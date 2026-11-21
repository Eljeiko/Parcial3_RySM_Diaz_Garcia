// =====================================================================
// Configuración de la aplicación Express.
// Aquí se registran los middlewares, las rutas y el manejo de errores.
// =====================================================================
const express = require('express');
const cors = require('cors');
const ticketsRoutes = require('./routes/tickets.routes');

const app = express();

// CORS: permite que un frontend abierto en otro origen llame a este microservicio
app.use(cors());

// Registro de cada petición recibida: método, ruta y código de respuesta.
// Se imprime cuando la respuesta termina, para poder mostrar el código.
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
});

// Middleware: convierte el cuerpo JSON de la petición en un objeto (req.body)
app.use(express.json());

// Endpoint de salud: permite verificar que el microservicio está vivo
app.get('/health', (req, res) => {
  res.json({ servicio: 'ms-tickets', estado: 'ok' });
});

// Rutas del recurso. Todas las URIs de este microservicio empiezan por /tickets
app.use('/tickets', ticketsRoutes);

// Cualquier otra ruta: 404 Not Found
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo centralizado de errores (los lanza la capa de servicio)
app.use((err, req, res, next) => {
  // JSON mal formado en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: err.message, detalles: err.detalles });
});

module.exports = app;
