-- ============================================================
--  TIENDA DB  –  DDL  (Proyecto 2, cc3088 Bases de Datos 1)
-- ============================================================

-- --------------------------
-- TABLAS PRINCIPALES
-- --------------------------

CREATE TABLE IF NOT EXISTS categorias (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS proveedores (
    id        SERIAL PRIMARY KEY,
    nombre    VARCHAR(150) NOT NULL,
    contacto  VARCHAR(150),
    telefono  VARCHAR(30),
    email     VARCHAR(150),
    direccion TEXT
);

CREATE TABLE IF NOT EXISTS productos (
    id           SERIAL PRIMARY KEY,
    nombre       VARCHAR(150) NOT NULL,
    descripcion  TEXT,
    precio       NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    stock        INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria_id INT NOT NULL REFERENCES categorias(id),
    proveedor_id INT NOT NULL REFERENCES proveedores(id),
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS empleados (
    id           SERIAL PRIMARY KEY,
    nombre       VARCHAR(150) NOT NULL,
    apellido     VARCHAR(150) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    telefono     VARCHAR(30),
    cargo        VARCHAR(100),
    activo       BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
    id        SERIAL PRIMARY KEY,
    nombre    VARCHAR(150) NOT NULL,
    apellido  VARCHAR(150) NOT NULL,
    email     VARCHAR(150) UNIQUE,
    telefono  VARCHAR(30),
    direccion TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ventas (
    id           SERIAL PRIMARY KEY,
    cliente_id   INT NOT NULL REFERENCES clientes(id),
    empleado_id  INT NOT NULL REFERENCES empleados(id),
    fecha        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total        NUMERIC(12,2) NOT NULL DEFAULT 0,
    estado       VARCHAR(20) NOT NULL DEFAULT 'completada'
                     CHECK (estado IN ('completada','anulada','pendiente'))
);

CREATE TABLE IF NOT EXISTS detalle_venta (
    id          SERIAL PRIMARY KEY,
    venta_id    INT NOT NULL REFERENCES ventas(id),
    producto_id INT NOT NULL REFERENCES productos(id),
    cantidad    INT NOT NULL CHECK (cantidad > 0),
    precio_unit NUMERIC(10,2) NOT NULL CHECK (precio_unit >= 0),
    subtotal    NUMERIC(12,2) GENERATED ALWAYS AS (cantidad * precio_unit) STORED
);

CREATE TABLE IF NOT EXISTS usuarios (
    id           SERIAL PRIMARY KEY,
    username     VARCHAR(80) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol          VARCHAR(20) NOT NULL DEFAULT 'vendedor'
                     CHECK (rol IN ('gerente','vendedor','cajero','inventarista','auditor')),
    empleado_id  INT REFERENCES empleados(id),
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------
-- ÍNDICES
-- --------------------------
CREATE INDEX IF NOT EXISTS idx_productos_categoria  ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_proveedor  ON productos(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente        ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_empleado       ON ventas(empleado_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha          ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_detalle_venta_venta   ON detalle_venta(venta_id);
CREATE INDEX IF NOT EXISTS idx_detalle_venta_prod    ON detalle_venta(producto_id);

-- --------------------------
-- VISTAS
-- --------------------------

-- Vista 1: resumen de ventas con nombre de cliente y empleado
CREATE OR REPLACE VIEW v_ventas_detalle AS
SELECT
    v.id            AS venta_id,
    v.fecha,
    v.estado,
    v.total,
    c.nombre || ' ' || c.apellido AS cliente,
    c.email         AS cliente_email,
    e.nombre || ' ' || e.apellido AS empleado,
    COUNT(dv.id)    AS num_items
FROM ventas v
JOIN clientes  c  ON c.id = v.cliente_id
JOIN empleados e  ON e.id = v.empleado_id
LEFT JOIN detalle_venta dv ON dv.venta_id = v.id
GROUP BY v.id, v.fecha, v.estado, v.total, c.nombre, c.apellido,
         c.email, e.nombre, e.apellido;

-- Vista 2: stock y valor de inventario por categoría
CREATE OR REPLACE VIEW v_inventario_categoria AS
SELECT
    cat.id          AS categoria_id,
    cat.nombre      AS categoria,
    COUNT(p.id)     AS num_productos,
    SUM(p.stock)    AS stock_total,
    SUM(p.stock * p.precio) AS valor_inventario
FROM categorias cat
LEFT JOIN productos p ON p.categoria_id = cat.id
GROUP BY cat.id, cat.nombre;

-- Vista 3: productos más vendidos
CREATE OR REPLACE VIEW v_productos_mas_vendidos AS
SELECT
    p.id            AS producto_id,
    p.nombre        AS producto,
    cat.nombre      AS categoria,
    SUM(dv.cantidad) AS total_vendido,
    SUM(dv.subtotal) AS ingresos_total
FROM productos p
JOIN detalle_venta dv ON dv.producto_id = p.id
JOIN ventas v         ON v.id = dv.venta_id AND v.estado = 'completada'
JOIN categorias cat   ON cat.id = p.categoria_id
GROUP BY p.id, p.nombre, cat.nombre;
