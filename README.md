# TiendaGT — Proyecto 3 · cc3088 Bases de Datos 1

Extensión del Proyecto 2 con seguridad a nivel de base de datos: 5 roles con permisos granulares, stored procedures y ORM (Sequelize).

---

## Levantar el proyecto

```bash
git clone <URL_DEL_REPO>
cd proyecto2_BasedeDatos
git checkout proyecto-3
cp .env.example .env
docker compose up --build
```

Abre **http://localhost:3000**

---

## Credenciales de BD

| Parámetro | Valor |
|---|---|
| Usuario | `proy3` |
| Contraseña | `secret` |
| Base | `tienda` |

## Usuarios de prueba (1 por rol)

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | gerente |
| `vendedor1` | `vendedor123` | vendedor |
| `cajero1` | `cajero123` | cajero |
| `inventarista1` | `inventarista123` | inventarista |
| `auditor1` | `auditor123` | auditor |

---

## Qué se agregó en el Proyecto 3

### I. Seguridad y roles (55 pts)
- ✅ 5 roles en PostgreSQL con `CREATE ROLE`, `GRANT`, `REVOKE` → `db/roles.sql`
- ✅ Esquema documentado → `docs/Roles.md`
- ✅ 1 usuario de prueba por cada rol → `db/seed.sql`
- ✅ Rutas y menú de UI protegidos según el rol autenticado

### II. Stored Procedures y ORM (45 pts)
- ✅ 6 stored procedures invocados desde el backend → `db/procedures.sql`
- ✅ SP con parámetros IN/OUT y manejo de excepciones (`registrar_venta`, `crear_cliente`)
- ✅ Transacción con ROLLBACK dentro de stored procedure (`registrar_venta`, `anular_venta`)
- ✅ ORM Sequelize en Productos, Clientes, Catálogos (findAll, findByPk, create, update, destroy)

---

## Detener

```bash
docker compose down
docker compose down -v   # borra datos
```
