# TiendaGT — Proyecto 2 · cc3088 Bases de Datos 1

Aplicación web para gestión de inventario y ventas. Stack: **PostgreSQL + Node.js (Express) + React (Vite)**, desplegada con Docker.

---

## Requisitos

- Docker Desktop (o Docker Engine + Compose v2)
- Git

---

## Levantar el proyecto

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPO>
cd proyecto2

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar todo con Docker Compose
docker compose up --build
```

La primera vez tarda ~2 minutos mientras se construyen las imágenes y se inicializa la base de datos.

| Servicio   | URL                         |
|------------|-----------------------------|
| Frontend   | http://localhost:3000        |
| Backend    | http://localhost:4000        |
| PostgreSQL | localhost:5432               |

---

## Credenciales

### Aplicación web
| Usuario     | Contraseña    | Rol       |
|-------------|---------------|-----------|
| `admin`     | `admin123`    | Admin     |
| `vendedor1` | `vendedor123` | Vendedor  |
| `vendedor2` | `vendedor123` | Vendedor  |

### Base de datos
| Parámetro | Valor    |
|-----------|----------|
| Usuario   | `proy2`  |
| Contraseña| `secret` |
| Base      | `tienda` |

---

## Estructura del proyecto

```
proyecto2/
├── docker-compose.yml
├── .env.example
├── db/
│   ├── init.sql          # DDL: tablas, índices, vistas
│   └── seed.sql          # Datos de prueba (25+ registros/tabla)
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── db/pool.js
│       ├── middleware/auth.js
│       └── routes/
│           ├── auth.js
│           ├── productos.js
│           ├── ventas.js
│           ├── clientes.js
│           ├── reportes.js
│           └── catalogos.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── api.js
        ├── hooks/useAuth.jsx
        ├── components/Layout.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Productos.jsx
            ├── Clientes.jsx
            ├── Ventas.jsx
            ├── NuevaVenta.jsx
            ├── Reportes.jsx
            └── Catalogos.jsx
```

---

## Rúbrica cubierta

### I. Diseño de base de datos (40 pts)
| Criterio | Archivo |
|---|---|
| Diagrama ER | `docs/ER_Diagram.md` |
| Modelo relacional | `docs/Modelo_Relacional.md` |
| Normalización 3FN | `docs/Normalizacion.md` |
| DDL completo con PK, FK, NOT NULL | `db/init.sql` |
| Datos de prueba ≥ 25 registros/tabla | `db/seed.sql` |
| CREATE INDEX en ≥ 2 columnas | `db/init.sql` (7 índices) |

### II. SQL (50 pts)
| Criterio | Ruta |
|---|---|
| 3 JOINs múltiples visibles en UI | GET /productos, GET /ventas, GET /clientes |
| 2 subqueries (IN/EXISTS/correlacionado) | GET /productos/bajo-stock, GET /reportes/clientes-frecuentes |
| GROUP BY + HAVING + agregación | GET /reportes/ventas-por-empleado |
| CTE (WITH) | GET /reportes/ventas-diarias |
| VIEW usado por backend | v_ventas_detalle, v_inventario_categoria, v_productos_mas_vendidos |
| Transacción explícita + ROLLBACK | POST /ventas, DELETE /ventas/:id |

### III. Aplicación web (35 pts)
| Criterio | Ubicación |
|---|---|
| CRUD ≥ 2 entidades | Productos, Clientes, Categorías, Proveedores |
| ≥ 1 reporte con datos reales | Página Reportes (4 reportes) |
| Manejo de errores visible | Alertas en formularios y validaciones |
| README funcional | Este archivo |

### IV. Avanzado (15 pts)
| Criterio | Ubicación |
|---|---|
| Autenticación login/logout con JWT | `/login`, sidebar |
| Exportar reporte a CSV | Botón "↓ Exportar CSV" en página Reportes |

---

## Detener el proyecto

```bash
docker compose down          # detiene contenedores
docker compose down -v       # detiene + borra volumen de datos
```
