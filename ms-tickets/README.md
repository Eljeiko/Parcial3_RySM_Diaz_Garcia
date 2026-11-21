# ms-tickets · Módulo 3 (preparación)

Redes y Servicios Multimedia · UAO. Microservicio de tickets de soporte.
Arquitectura en capas: `routes → controller → service → repository`, con `models/ticket.js` y `HttpError`.

## Cómo ejecutarlo

Requisitos: Node.js 22.9 o superior, MySQL 8 y **ms-usuarios corriendo en el puerto 3001** (para obtener el token).

1. Crear la base de datos y su usuario (como root):

```sql
CREATE DATABASE tickets_db CHARACTER SET utf8mb4;
CREATE USER 'tickets_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON tickets_db.* TO 'tickets_user'@'localhost';
```

2. Cargar la tabla y los datos iniciales: `mysql -u root -p tickets_db < db/schema.sql`
3. `npm install`
4. Copiar `.env.example` como `.env`. **`JWT_SECRET` debe ser idéntico al de ms-usuarios.**
5. `npm run dev` → escucha en `http://127.0.0.1:3011`. Cada petición se registra en la terminal (método, ruta y código).

## Entidad Ticket

| Campo | Tipo | Regla |
|---|---|---|
| id | entero | lo genera la base de datos |
| numero | texto | obligatorio, **único** (409 si ya existe) |
| asunto | texto | obligatorio |
| prioridad | texto | `baja`, `media` o `alta` |
| estado | texto | `abierto` o `cerrado` |
| fecha | fecha | formato `AAAA-MM-DD`, debe ser una fecha real |

## Endpoints

Todas las rutas exigen `Authorization: Bearer <token>`.

| Método | URI | Quién | Respuesta exitosa | Errores |
|---|---|---|---|---|
| GET | /health | Público | 200 | — |
| GET | /tickets | Cualquier rol | 200 arreglo (filtros `?prioridad=` y `?ids=1,2,3`) | 400 · 401 |
| GET | /tickets/:id | Cualquier rol | 200 ticket | 400 · 401 · 404 |
| POST | /tickets | administrador | 201 ticket + `Location` | 400 · 401 · 403 · 409 |
| PUT | /tickets/:id | administrador | 200 ticket | 400 · 401 · 403 · 404 · 409 |
| DELETE | /tickets/:id | administrador | 204 | 400 · 401 · 403 · 404 |

Ejemplo de ticket:

```json
{ "id": 1, "numero": "TK-0001", "asunto": "No funciona el correo", "prioridad": "alta", "estado": "abierto", "fecha": "2026-11-02" }
```

Los errores responden `{ "error": "mensaje", "detalles": [...] }`.

## Pruebas (Postman)

Importar `docs/ms-tickets.postman_collection.json`. Requiere ms-usuarios en el 3001 con el usuario
`admin@empresa.com`. La colección hace login, crea un usuario `despacho` (para probar el 403) y
recorre los códigos 200, 201, 204, 400, 401, 403, 404 y 409. Ejecutarla con *Run collection*.
