-- db/schema.sql — base de datos de ms-usuarios
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

CREATE TABLE usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  password_hash  VARCHAR(100) NOT NULL,      -- la contraseña cifrada con bcrypt, nunca en texto plano
  rol            VARCHAR(30)  NOT NULL,
  activo         BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Usuario inicial para poder iniciar sesión por primera vez.
-- Email: admin@empresa.com   Contraseña: Admin2026*
-- Cámbienle la contraseña (PUT /usuarios/1) apenas despliegue la aplicación.
INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES
  ('Administrador General', 'admin@gmail.com',
   '$2b$10$UMKG9NQN1y3QdSJ5cOgFy.RrH839x43YGsEcN4qH33LIKi.l6/GuK', 'administrador', TRUE);
