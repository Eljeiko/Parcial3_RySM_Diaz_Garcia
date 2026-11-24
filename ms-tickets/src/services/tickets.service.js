// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Reglas del negocio y validaciones. No sabe nada de HTTP (req/res)
// ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/tickets.repository');
const { validarTicket, construirTicket, PRIORIDADES } = require('../models/ticket');
const areasClient = require('../clients/areas.client');
const HttpError = require('../utils/http-error');

const AVISO_AREAS_NO_DISPONIBLE =
  'No fue posible conectar con ms-areas; el área no se pudo cargar.';

function componerTicket(ticket, area) {
  const compuesto = { ...ticket, area };
  delete compuesto.area_id;
  return compuesto;
}

function incluirAvisoAreaNoDisponible(ticket) {
  const compuesto = { ...ticket, area: null, aviso: AVISO_AREAS_NO_DISPONIBLE };
  delete compuesto.area_id;
  return compuesto;
}

function areasNoDisponible(error) {
  return error instanceof HttpError && error.status === 503;
}

async function componerTickets(tickets, authorization) {
  if (tickets.length === 0) return [];

  const ids = [...new Set(tickets.map((ticket) => ticket.area_id))];
  let areas;
  try {
    areas = await areasClient.listarAreas(ids, authorization);
  } catch (error) {
    if (areasNoDisponible(error)) return tickets.map(incluirAvisoAreaNoDisponible);
    throw error;
  }
  const areasPorId = new Map(areas.map((area) => [area.id, area]));

  return tickets.map((ticket) => componerTicket(ticket, areasPorId.get(ticket.area_id)));
}

async function listar(filtros, authorization) {
  if (filtros.prioridad && !PRIORIDADES.includes(filtros.prioridad)) {
    throw new HttpError(400, `prioridad debe ser una de: ${PRIORIDADES.join(', ')}`);
  }
  const tickets = await repo.findAll(filtros);
  return componerTickets(tickets, authorization);
}

async function obtener(id, authorization) {
  const ticket = await repo.findById(id);
  if (!ticket) throw new HttpError(404, `No existe el ticket con id ${id}`);
  let area;
  try {
    area = await areasClient.validarArea(ticket.area_id, authorization);
  } catch (error) {
    if (areasNoDisponible(error)) return incluirAvisoAreaNoDisponible(ticket);
    throw error;
  }
  return componerTicket(ticket, area);
}

async function validarPrioridadAlta(ticket, authorization) {
  const area = await areasClient.validarArea(ticket.area_id, authorization);
  if (ticket.prioridad === 'alta' && area.max_tickets_alta === 0) {
    throw new HttpError(409, `El área con id ${ticket.area_id} no permite tickets de prioridad alta`);
  }
  return area;
}

async function crear(datos, authorization) {
  const errores = validarTicket(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const ticket = construirTicket(datos);
  const area = await validarPrioridadAlta(ticket, authorization);

  // Regla de negocio: no puede haber dos tickets con el mismo número
  if (await repo.findByNumero(ticket.numero)) {
    throw new HttpError(409, `Ya existe un ticket con el número ${ticket.numero}`);
  }
  if (area===null) {
    throw new HttpError(404, `No existe el área con id ${ticket.area_id}`);
  }
  return componerTicket(await repo.create(ticket), area);
}

async function actualizar(id, datos, authorization) {
  const errores = validarTicket(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const ticket = construirTicket(datos);
  const area = await validarPrioridadAlta(ticket, authorization);

  const otro = await repo.findByNumero(ticket.numero);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un ticket con el número ${ticket.numero}`);
  }

  const actualizado = await repo.update(id, ticket);
  if (!actualizado) throw new HttpError(404, `No existe el ticket con id ${id}`);
  return componerTicket(actualizado, area);
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el ticket con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
