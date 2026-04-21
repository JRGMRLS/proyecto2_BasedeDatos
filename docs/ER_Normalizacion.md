# Diagrama ER — TiendaGT

## Entidades y atributos

```
CATEGORIAS
  PK id
     nombre (NOT NULL)
     descripcion

PROVEEDORES
  PK id
     nombre (NOT NULL)
     contacto
     telefono
     email
     direccion

PRODUCTOS
  PK id
     nombre (NOT NULL)
     descripcion
     precio (NOT NULL, ≥ 0)
     stock (NOT NULL, ≥ 0)
  FK categoria_id → CATEGORIAS(id)
  FK proveedor_id → PROVEEDORES(id)
     creado_en

EMPLEADOS
  PK id
     nombre (NOT NULL)
     apellido (NOT NULL)
     email (NOT NULL, UNIQUE)
     telefono
     cargo
     activo
     creado_en

CLIENTES
  PK id
     nombre (NOT NULL)
     apellido (NOT NULL)
     email (UNIQUE)
     telefono
     direccion
     creado_en

VENTAS
  PK id
  FK cliente_id → CLIENTES(id)
  FK empleado_id → EMPLEADOS(id)
     fecha
     total
     estado ∈ {completada, anulada, pendiente}

DETALLE_VENTA
  PK id
  FK venta_id → VENTAS(id)
  FK producto_id → PRODUCTOS(id)
     cantidad (> 0)
     precio_unit (≥ 0)
     subtotal (COMPUTED: cantidad × precio_unit)

USUARIOS
  PK id
     username (NOT NULL, UNIQUE)
     password_hash (NOT NULL)
     rol ∈ {admin, vendedor}
  FK empleado_id → EMPLEADOS(id)
     creado_en
```

## Relaciones y cardinalidades

| Relación | Cardinalidad | Descripción |
|---|---|---|
| CATEGORIAS — PRODUCTOS | 1 : N | Una categoría agrupa muchos productos |
| PROVEEDORES — PRODUCTOS | 1 : N | Un proveedor suministra muchos productos |
| CLIENTES — VENTAS | 1 : N | Un cliente realiza muchas ventas |
| EMPLEADOS — VENTAS | 1 : N | Un empleado atiende muchas ventas |
| VENTAS — DETALLE_VENTA | 1 : N | Una venta tiene muchos ítems de detalle |
| PRODUCTOS — DETALLE_VENTA | 1 : N | Un producto aparece en muchos detalles |
| EMPLEADOS — USUARIOS | 1 : 1 | Un empleado puede tener un usuario del sistema |

---

# Modelo Relacional (Notación relacional)

```
categorias(id, nombre, descripcion)
  PK: id

proveedores(id, nombre, contacto, telefono, email, direccion)
  PK: id

productos(id, nombre, descripcion, precio, stock, categoria_id, proveedor_id, creado_en)
  PK: id
  FK: categoria_id → categorias(id)
  FK: proveedor_id → proveedores(id)

empleados(id, nombre, apellido, email, telefono, cargo, activo, creado_en)
  PK: id
  UNIQUE: email

clientes(id, nombre, apellido, email, telefono, direccion, creado_en)
  PK: id
  UNIQUE: email

ventas(id, cliente_id, empleado_id, fecha, total, estado)
  PK: id
  FK: cliente_id  → clientes(id)
  FK: empleado_id → empleados(id)

detalle_venta(id, venta_id, producto_id, cantidad, precio_unit, subtotal)
  PK: id
  FK: venta_id    → ventas(id)
  FK: producto_id → productos(id)

usuarios(id, username, password_hash, rol, empleado_id, creado_en)
  PK: id
  UNIQUE: username
  FK: empleado_id → empleados(id)
```

---

# Normalización hasta 3FN

## 1FN — Primera Forma Normal
Todas las tablas cumplen 1FN:
- Cada atributo contiene valores atómicos (no hay grupos repetitivos).
- Cada fila es única (identificada por PK).
- No existen columnas multivaluadas.

Ejemplo en `detalle_venta`: en lugar de almacenar `"producto1, producto2"` en una columna, cada ítem tiene su propia fila.

## 2FN — Segunda Forma Normal
Todas las tablas cumplen 2FN:
- Están en 1FN.
- Todos los atributos no-clave dependen completamente de la clave primaria (no hay dependencias parciales).

Las tablas con claves simples (SERIAL) no pueden tener dependencias parciales por definición. En `detalle_venta`, `subtotal` depende de `(cantidad, precio_unit)` que son atributos de la misma fila, no de una parte de la clave.

## 3FN — Tercera Forma Normal
Todas las tablas cumplen 3FN:
- Están en 2FN.
- No existen dependencias transitivas (atributos no-clave que dependen de otros atributos no-clave).

**Ejemplo de decisión de diseño:**
- El `nombre` de la categoría no se almacena en `productos`; sólo se guarda `categoria_id`. Si se almacenara `categoria_nombre` en productos, habría dependencia transitiva: `producto.categoria_nombre` dependería de `producto.categoria_id` (no de la PK directamente).
- Igualmente, `precio_unit` en `detalle_venta` se copia del precio al momento de la venta (no referenciado dinámicamente), evitando que un cambio futuro en `productos.precio` altere el histórico de ventas.

**Dependencias funcionales documentadas:**

```
categorias:     id → nombre, descripcion
proveedores:    id → nombre, contacto, telefono, email, direccion
productos:      id → nombre, descripcion, precio, stock, categoria_id, proveedor_id
empleados:      id → nombre, apellido, email, telefono, cargo, activo
               email → id  (clave candidata)
clientes:       id → nombre, apellido, email, telefono, direccion
               email → id  (clave candidata)
ventas:         id → cliente_id, empleado_id, fecha, total, estado
detalle_venta:  id → venta_id, producto_id, cantidad, precio_unit, subtotal
               subtotal es atributo derivado: subtotal = cantidad × precio_unit
usuarios:       id → username, password_hash, rol, empleado_id
               username → id  (clave candidata)
```
