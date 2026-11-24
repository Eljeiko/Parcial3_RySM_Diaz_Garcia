// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio) — versión MySQL
// Única capa que sabe dónde y cómo se guardan los datos.
// =====================================================================
const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM tickets';
  const condiciones = [];
  const valores = [];
  if (filtros.prioridad) {
    condiciones.push('prioridad = ?');
    valores.push(filtros.prioridad);
  }
  if (filtros.ids) {                       // ?ids=1,2,3 → WHERE id IN (1, 2, 3)
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

async function findByNumero(numero) {
  const [filas] = await pool.query('SELECT * FROM tickets WHERE numero = ?', [numero]);
  return filas.length > 0 ? filas[0] : null;
}

async function findByAreaId(areaId) {
  const [filas] = await pool.query('SELECT * FROM tickets WHERE area_id = ?', [areaId]);
  return filas;
}

async function create(ticket) {
  const [resultado] = await pool.query(
    'INSERT INTO tickets (numero, asunto, prioridad, estado, fecha, area_id) VALUES (?, ?, ?, ?, ?, ?)',
    [ticket.numero, ticket.asunto, ticket.prioridad, ticket.estado, ticket.fecha, ticket.area_id]);
  return findById(resultado.insertId);
}

async function update(id, ticket) {
  const [resultado] = await pool.query(
    'UPDATE tickets SET numero = ?, asunto = ?, prioridad = ?, estado = ?, fecha = ?, area_id = ? WHERE id = ?',
    [ticket.numero, ticket.asunto, ticket.prioridad, ticket.estado, ticket.fecha, ticket.area_id, id]);
  if (resultado.affectedRows === 0) return null;
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM tickets WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByNumero, findByAreaId, create, update, remove };
