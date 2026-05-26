-- ============================================================
--  ROLES DE BASE DE DATOS  –  Proyecto 3
--  5 roles con permisos granulares por tabla y operación
-- ============================================================

-- ── 1. gerente ───────────────────────────────────────────────
-- Acceso total de lectura/escritura a todas las tablas
CREATE ROLE gerente;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gerente;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gerente;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO gerente;

-- ── 2. vendedor ──────────────────────────────────────────────
-- Puede registrar y consultar ventas; solo lectura en productos/clientes
CREATE ROLE vendedor;
GRANT SELECT ON productos, categorias, proveedores, clientes, empleados TO vendedor;
GRANT SELECT, INSERT ON ventas, detalle_venta TO vendedor;
GRANT USAGE, SELECT ON SEQUENCE ventas_id_seq, detalle_venta_id_seq TO vendedor;

-- ── 3. cajero ────────────────────────────────────────────────
-- Solo puede ver ventas y cobrar (INSERT en ventas)
CREATE ROLE cajero;
GRANT SELECT ON ventas, detalle_venta, productos, clientes TO cajero;
GRANT INSERT ON ventas, detalle_venta TO cajero;
GRANT USAGE, SELECT ON SEQUENCE ventas_id_seq, detalle_venta_id_seq TO cajero;

-- ── 4. inventarista ──────────────────────────────────────────
-- Gestiona productos, categorías y proveedores; no ve ventas
CREATE ROLE inventarista;
GRANT SELECT, INSERT, UPDATE, DELETE ON productos, categorias, proveedores TO inventarista;
GRANT SELECT ON clientes, empleados TO inventarista;
GRANT USAGE, SELECT ON SEQUENCE productos_id_seq, categorias_id_seq, proveedores_id_seq TO inventarista;
REVOKE DELETE ON categorias FROM inventarista;   -- no puede borrar categorías

-- ── 5. auditor ───────────────────────────────────────────────
-- Solo lectura en todas las tablas (para reportes y auditoría)
CREATE ROLE auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO auditor;
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM auditor;

-- ── Usuarios de BD por rol ───────────────────────────────────
-- Cada usuario de app se conecta con el usuario proy3 (requerido por la rúbrica)
-- Los roles se asignan a nivel de aplicación y se documentan aquí como referencia

-- Documentación del esquema de roles (ver docs/Roles.md)
