// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Reglas del negocio y validaciones. No sabe nada de HTTP (req/res)
// ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/tickets.repository');
const { validarTicket, construirTicket, PRIORIDADES } = require('../models/ticket');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  if (filtros.prioridad && !PRIORIDADES.includes(filtros.prioridad)) {
    throw new HttpError(400, `prioridad debe ser una de: ${PRIORIDADES.join(', ')}`);
  }
  return repo.findAll(filtros);
}

async function obtener(id) {
  const ticket = await repo.findById(id);
  if (!ticket) throw new HttpError(404, `No existe el ticket con id ${id}`);
  return ticket;
}

async function crear(datos) {
  const errores = validarTicket(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const ticket = construirTicket(datos);

  // Regla de negocio: no puede haber dos tickets con el mismo número
  if (await repo.findByNumero(ticket.numero)) {
    throw new HttpError(409, `Ya existe un ticket con el número ${ticket.numero}`);
  }
  return repo.create(ticket);
}

async function actualizar(id, datos) {
  const errores = validarTicket(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);
  const ticket = construirTicket(datos);

  const otro = await repo.findByNumero(ticket.numero);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un ticket con el número ${ticket.numero}`);
  }

  const actualizado = await repo.update(id, ticket);
  if (!actualizado) throw new HttpError(404, `No existe el ticket con id ${id}`);
  return actualizado;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el ticket con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
