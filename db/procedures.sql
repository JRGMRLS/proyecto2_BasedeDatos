-- ============================================================
--  STORED PROCEDURES  –  Proyecto 3
-- ============================================================

-- ── SP 1: registrar_venta ─────────────────────────────────────
-- Registra una venta completa con validación de stock y ROLLBACK
-- Parámetros de entrada: cliente_id, empleado_id, items JSON
-- Parámetros de salida:  venta_id, total, mensaje_error
CREATE OR REPLACE PROCEDURE registrar_venta(
    IN  p_cliente_id   INT,
    IN  p_empleado_id  INT,
    IN  p_items        JSON,
    OUT p_venta_id     INT,
    OUT p_total        NUMERIC,
    OUT p_error        TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_item       JSON;
    v_prod_id    INT;
    v_cantidad   INT;
    v_precio     NUMERIC;
    v_stock_act  INT;
    v_nombre     TEXT;
BEGIN
    p_error    := NULL;
    p_total    := 0;
    p_venta_id := NULL;

    -- Validar cliente
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE id = p_cliente_id) THEN
        p_error := 'Cliente no encontrado: ' || p_cliente_id;
        RETURN;
    END IF;

    -- Validar empleado
    IF NOT EXISTS (SELECT 1 FROM empleados WHERE id = p_empleado_id AND activo = TRUE) THEN
        p_error := 'Empleado no encontrado o inactivo: ' || p_empleado_id;
        RETURN;
    END IF;

    -- Crear la venta
    INSERT INTO ventas (cliente_id, empleado_id, estado)
    VALUES (p_cliente_id, p_empleado_id, 'completada')
    RETURNING id INTO p_venta_id;

    -- Procesar cada ítem del JSON array
    FOR v_item IN SELECT * FROM json_array_elements(p_items)
    LOOP
        v_prod_id  := (v_item->>'producto_id')::INT;
        v_cantidad := (v_item->>'cantidad')::INT;

        -- Obtener precio y stock actual con lock
        SELECT precio, stock, nombre
        INTO v_precio, v_stock_act, v_nombre
        FROM productos
        WHERE id = v_prod_id
        FOR UPDATE;

        IF NOT FOUND THEN
            p_error := 'Producto no encontrado: ' || v_prod_id;
            RAISE EXCEPTION 'Producto no encontrado';
        END IF;

        IF v_stock_act < v_cantidad THEN
            p_error := 'Stock insuficiente para "' || v_nombre || '". Disponible: ' || v_stock_act;
            RAISE EXCEPTION 'Stock insuficiente';
        END IF;

        -- Insertar detalle
        INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unit)
        VALUES (p_venta_id, v_prod_id, v_cantidad, v_precio);

        -- Descontar stock
        UPDATE productos SET stock = stock - v_cantidad WHERE id = v_prod_id;

        p_total := p_total + (v_cantidad * v_precio);
    END LOOP;

    -- Actualizar total
    UPDATE ventas SET total = p_total WHERE id = p_venta_id;

EXCEPTION WHEN OTHERS THEN
    -- ROLLBACK implícito en el bloque de excepción
    IF p_error IS NULL THEN
        p_error := SQLERRM;
    END IF;
    p_venta_id := NULL;
    p_total    := 0;
    RAISE;  -- re-lanza para que el caller haga ROLLBACK
END;
$$;

-- ── SP 2: anular_venta ────────────────────────────────────────
-- Anula una venta y restaura el stock con transacción explícita
CREATE OR REPLACE PROCEDURE anular_venta(
    IN  p_venta_id  INT,
    OUT p_ok        BOOLEAN,
    OUT p_error     TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado TEXT;
BEGIN
    p_ok    := FALSE;
    p_error := NULL;

    SELECT estado INTO v_estado FROM ventas WHERE id = p_venta_id FOR UPDATE;

    IF NOT FOUND THEN
        p_error := 'Venta no encontrada: ' || p_venta_id;
        RETURN;
    END IF;

    IF v_estado = 'anulada' THEN
        p_error := 'La venta ya está anulada';
        RETURN;
    END IF;

    -- Restaurar stock de cada producto
    UPDATE productos p
    SET stock = p.stock + dv.cantidad
    FROM detalle_venta dv
    WHERE dv.venta_id = p_venta_id AND dv.producto_id = p.id;

    -- Cambiar estado
    UPDATE ventas SET estado = 'anulada' WHERE id = p_venta_id;

    p_ok := TRUE;

EXCEPTION WHEN OTHERS THEN
    p_error := SQLERRM;
    p_ok    := FALSE;
    RAISE;
END;
$$;

-- ── SP 3: actualizar_stock ────────────────────────────────────
-- Actualiza el stock de un producto con validación
CREATE OR REPLACE PROCEDURE actualizar_stock(
    IN  p_producto_id  INT,
    IN  p_nuevo_stock  INT,
    OUT p_ok           BOOLEAN,
    OUT p_error        TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    p_ok    := FALSE;
    p_error := NULL;

    IF p_nuevo_stock < 0 THEN
        p_error := 'El stock no puede ser negativo';
        RETURN;
    END IF;

    UPDATE productos SET stock = p_nuevo_stock WHERE id = p_producto_id;

    IF NOT FOUND THEN
        p_error := 'Producto no encontrado: ' || p_producto_id;
        RETURN;
    END IF;

    p_ok := TRUE;

EXCEPTION WHEN OTHERS THEN
    p_error := SQLERRM;
    p_ok    := FALSE;
END;
$$;

-- ── SP 4: crear_cliente ───────────────────────────────────────
-- Crea un cliente con validación de email duplicado
CREATE OR REPLACE PROCEDURE crear_cliente(
    IN  p_nombre     VARCHAR(150),
    IN  p_apellido   VARCHAR(150),
    IN  p_email      VARCHAR(150),
    IN  p_telefono   VARCHAR(30),
    IN  p_direccion  TEXT,
    OUT p_cliente_id INT,
    OUT p_error      TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    p_cliente_id := NULL;
    p_error      := NULL;

    IF p_nombre IS NULL OR p_nombre = '' THEN
        p_error := 'El nombre es requerido';
        RETURN;
    END IF;

    IF p_email IS NOT NULL AND EXISTS (SELECT 1 FROM clientes WHERE email = p_email) THEN
        p_error := 'El email ya está registrado: ' || p_email;
        RETURN;
    END IF;

    INSERT INTO clientes (nombre, apellido, email, telefono, direccion)
    VALUES (p_nombre, p_apellido, p_email, p_telefono, p_direccion)
    RETURNING id INTO p_cliente_id;

EXCEPTION WHEN OTHERS THEN
    p_error      := SQLERRM;
    p_cliente_id := NULL;
END;
$$;

-- ── SP 5: reporte_ventas_periodo ──────────────────────────────
-- Genera resumen de ventas entre dos fechas
CREATE OR REPLACE PROCEDURE reporte_ventas_periodo(
    IN  p_fecha_ini   DATE,
    IN  p_fecha_fin   DATE,
    OUT p_total_ventas    BIGINT,
    OUT p_monto_total     NUMERIC,
    OUT p_ticket_promedio NUMERIC,
    OUT p_error           TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    p_error := NULL;

    IF p_fecha_ini > p_fecha_fin THEN
        p_error := 'La fecha inicial no puede ser mayor a la final';
        p_total_ventas := 0; p_monto_total := 0; p_ticket_promedio := 0;
        RETURN;
    END IF;

    SELECT
        COUNT(*)          AS total_ventas,
        COALESCE(SUM(total), 0)  AS monto_total,
        COALESCE(AVG(total), 0)  AS ticket_promedio
    INTO p_total_ventas, p_monto_total, p_ticket_promedio
    FROM ventas
    WHERE estado = 'completada'
      AND DATE(fecha) BETWEEN p_fecha_ini AND p_fecha_fin;

EXCEPTION WHEN OTHERS THEN
    p_error := SQLERRM;
    p_total_ventas := 0; p_monto_total := 0; p_ticket_promedio := 0;
END;
$$;

-- ── SP 6: crear_producto ──────────────────────────────────────
-- Crea un producto con validaciones
CREATE OR REPLACE PROCEDURE crear_producto(
    IN  p_nombre        VARCHAR(150),
    IN  p_descripcion   TEXT,
    IN  p_precio        NUMERIC,
    IN  p_stock         INT,
    IN  p_categoria_id  INT,
    IN  p_proveedor_id  INT,
    OUT p_producto_id   INT,
    OUT p_error         TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    p_producto_id := NULL;
    p_error       := NULL;

    IF p_nombre IS NULL OR p_nombre = '' THEN
        p_error := 'El nombre es requerido'; RETURN;
    END IF;
    IF p_precio < 0 THEN
        p_error := 'El precio no puede ser negativo'; RETURN;
    END IF;
    IF p_stock < 0 THEN
        p_error := 'El stock no puede ser negativo'; RETURN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM categorias WHERE id = p_categoria_id) THEN
        p_error := 'Categoría no encontrada'; RETURN;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM proveedores WHERE id = p_proveedor_id) THEN
        p_error := 'Proveedor no encontrado'; RETURN;
    END IF;

    INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, proveedor_id)
    VALUES (p_nombre, p_descripcion, p_precio, p_stock, p_categoria_id, p_proveedor_id)
    RETURNING id INTO p_producto_id;

EXCEPTION WHEN OTHERS THEN
    p_error       := SQLERRM;
    p_producto_id := NULL;
END;
$$;
