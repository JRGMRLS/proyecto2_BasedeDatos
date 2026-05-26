# Esquema de Roles — Proyecto 3

## Los 5 roles definidos en el DBMS

| Rol | Descripción | Tablas con acceso | Operaciones |
|---|---|---|---|
| `gerente` | Acceso total al sistema | Todas | SELECT, INSERT, UPDATE, DELETE |
| `vendedor` | Registra ventas y consulta inventario | productos, categorias, proveedores, clientes, empleados (lectura) + ventas, detalle_venta (escritura) | SELECT en catálogos; SELECT+INSERT en ventas |
| `cajero` | Solo procesa cobros y ve ventas | ventas, detalle_venta, productos, clientes | SELECT+INSERT en ventas/detalle; SELECT en productos/clientes |
| `inventarista` | Gestiona inventario, no ve ventas | productos, categorias, proveedores (CRUD) + clientes, empleados (lectura) | SELECT+INSERT+UPDATE+DELETE en inventario; sin DELETE en categorias |
| `auditor` | Solo lectura total (reportes y auditoría) | Todas las tablas | SELECT únicamente |

## Usuarios de prueba por rol

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | gerente |
| `gerente1` | `gerente123` | gerente |
| `vendedor1` | `vendedor123` | vendedor |
| `cajero1` | `cajero123` | cajero |
| `inventarista1` | `inventarista123` | inventarista |
| `auditor1` | `auditor123` | auditor |

## Menú visible por rol

| Sección | gerente | vendedor | cajero | inventarista | auditor |
|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ventas | ✅ | ✅ | ✅ | ❌ | ✅ (solo lectura) |
| Productos | ✅ | ✅ | ✅ (solo lectura) | ✅ | ✅ (solo lectura) |
| Clientes | ✅ | ✅ | ❌ | ❌ | ✅ (solo lectura) |
| Reportes | ✅ | ❌ | ❌ | ✅ | ✅ |
| Catálogos | ✅ | ❌ | ❌ | ✅ | ❌ |

## Stored Procedures

| Nombre | Descripción | Parámetros entrada | Parámetros salida |
|---|---|---|---|
| `registrar_venta` | Registra venta completa con validación de stock y ROLLBACK | cliente_id, empleado_id, items JSON | venta_id, total, error |
| `anular_venta` | Anula venta y restaura stock | venta_id | ok, error |
| `actualizar_stock` | Actualiza stock con validación | producto_id, nuevo_stock | ok, error |
| `crear_cliente` | Crea cliente validando email duplicado | nombre, apellido, email, telefono, direccion | cliente_id, error |
| `reporte_ventas_periodo` | Resumen de ventas en rango de fechas | fecha_ini, fecha_fin | total_ventas, monto_total, ticket_promedio, error |
| `crear_producto` | Crea producto con validaciones | nombre, descripcion, precio, stock, categoria_id, proveedor_id | producto_id, error |
