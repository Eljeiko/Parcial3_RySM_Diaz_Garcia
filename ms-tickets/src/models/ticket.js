// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Ticket y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
// =====================================================================
const PRIORIDADES = ['baja', 'media', 'alta'];
const ESTADOS = ['abierto', 'cerrado'];
 // máximo de tickets abiertos por área
const FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

// true si el texto es una fecha real en formato AAAA-MM-DD (rechaza 2026-02-30)
function esFecha(texto) {
  if (typeof texto !== 'string' || !FECHA_VALIDA.test(texto)) return false;
  const [anio, mes, dia] = texto.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
}

function textoNoVacio(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

// Devuelve una lista de errores de validación (vacía si todo está bien).
function validarTicket(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del ticket'];
  }
  if (!textoNoVacio(datos.numero)) errores.push('numero es obligatorio (texto)');
  if (!textoNoVacio(datos.asunto)) errores.push('asunto es obligatorio (texto)');
  if (!PRIORIDADES.includes(datos.prioridad)) {
    errores.push(`prioridad debe ser una de: ${PRIORIDADES.join(', ')}`);
  }
  if (!ESTADOS.includes(datos.estado)) {
    errores.push(`estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  if (!esFecha(datos.fecha)) errores.push('fecha es obligatoria y debe ser una fecha válida AAAA-MM-DD');
  if (datos.area_id === undefined || !Number.isInteger(datos.area_id) || datos.area_id <= 0) {
    errores.push('area_id es obligatorio y debe ser un entero positivo');
  }
  return errores;
}

// Construye un ticket "limpio" solo con los campos permitidos
function construirTicket(datos) {
  return {
    numero: datos.numero.trim(),
    asunto: datos.asunto.trim(),
    prioridad: datos.prioridad,
    estado: datos.estado,
    fecha: datos.fecha,
    area_id: datos.area_id,
  };
}

module.exports = { validarTicket, construirTicket, PRIORIDADES, ESTADOS };
