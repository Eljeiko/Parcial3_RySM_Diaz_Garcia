const HttpError = require('../utils/http-error');

async function pedir(ruta, authorization) {
  const areasUrl = process.env.AREAS_URL;
  if (!areasUrl) {
    throw new HttpError(503, 'No está configurada la URL de ms-areas');
  }

  try {
    return await fetch(`${areasUrl.replace(/\/$/, '')}${ruta}`, {
      headers: { Authorization: authorization },
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    throw new HttpError(503, 'No fue posible consultar ms-areas');
  }
}

async function leerRespuesta(respuesta) {
  if (!respuesta.ok) {
    throw new HttpError(502, `ms-areas respondió con el estado ${respuesta.status}`);
  }

  try {
    return await respuesta.json();
  } catch {
    throw new HttpError(502, 'ms-areas devolvió una respuesta inválida');
  }
}

function validarDatosArea(area) {
  if (!area || !Number.isInteger(area.id) || area.id <= 0) {
    throw new HttpError(502, 'ms-areas devolvió un área inválida');
  }
  if (!Number.isInteger(area.max_tickets_alta) || area.max_tickets_alta < 0) {
    throw new HttpError(502, 'ms-areas devolvió un límite de tickets inválido');
  }
}

async function validarArea(areaId, authorization) {
  const respuesta = await pedir(`/areas/${areaId}`, authorization);
  if (respuesta.status === 404) {
    throw new HttpError(400, `area_id ${areaId} no existe en ms-areas`);
  }

  const area = await leerRespuesta(respuesta);
  validarDatosArea(area);
  if (area.id !== areaId) {
    throw new HttpError(502, 'ms-areas devolvió un área distinta a la solicitada');
  }
  return area;
}

async function listarAreas(ids, authorization) {
  if (ids.length === 0) return [];

  const ruta = `/areas?ids=${encodeURIComponent(ids.join(','))}`;
  const areas = await leerRespuesta(await pedir(ruta, authorization));
  if (!Array.isArray(areas)) {
    throw new HttpError(502, 'ms-areas devolvió una lista de áreas inválida');
  }

  const esperados = new Set(ids);
  const encontrados = new Set();
  for (const area of areas) {
    validarDatosArea(area);
    if (!esperados.has(area.id) || encontrados.has(area.id)) {
      throw new HttpError(502, 'ms-areas devolvió áreas inesperadas');
    }
    encontrados.add(area.id);
  }

  for (const id of esperados) {
    if (!encontrados.has(id)) {
      throw new HttpError(502, `ms-areas no devolvió el área con id ${id}`);
    }
  }

  return areas;
}

module.exports = { validarArea, listarAreas };
