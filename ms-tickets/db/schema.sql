-- db/schema.sql — base de datos de ms-tickets (tickets_db)
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

CREATE TABLE tickets (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  numero     VARCHAR(30)  NOT NULL UNIQUE,
  asunto     VARCHAR(200) NOT NULL,
  prioridad  VARCHAR(10)  NOT NULL,      -- baja, media o alta
  estado     VARCHAR(10)  NOT NULL,      -- abierto o cerrado
  fecha      DATE         NOT NULL,
  area_id     INT          NOT NULL
);

INSERT INTO tickets (numero, asunto, prioridad, estado, fecha, area_id) VALUES
  ('TK-0001', 'No funciona el correo institucional', 'alta',  'abierto', '2026-11-02', 1),
  ('TK-0002', 'Solicitud de instalación de software', 'media', 'abierto', '2026-11-05', 2),
  ('TK-0003', 'Cambio de contraseña de la red WiFi',  'baja',  'cerrado', '2026-11-09', 1),
  ('TK-0004', 'Impresora del piso 2 sin tinta',       'media', 'cerrado', '2026-11-12', 2);
