const { DataTypes } = require('sequelize')
const sequelize = require('../db/sequelize')

// ── Categoria ─────────────────────────────────────────────────
const Categoria = sequelize.define('categorias', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:      { type: DataTypes.STRING(100), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
}, { timestamps: false })

// ── Proveedor ─────────────────────────────────────────────────
const Proveedor = sequelize.define('proveedores', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:    { type: DataTypes.STRING(150), allowNull: false },
  contacto:  { type: DataTypes.STRING(150) },
  telefono:  { type: DataTypes.STRING(30) },
  email:     { type: DataTypes.STRING(150) },
  direccion: { type: DataTypes.TEXT },
}, { timestamps: false })

// ── Producto ──────────────────────────────────────────────────
const Producto = sequelize.define('productos', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:       { type: DataTypes.STRING(150), allowNull: false },
  descripcion:  { type: DataTypes.TEXT },
  precio:       { type: DataTypes.DECIMAL(10,2), allowNull: false },
  stock:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  categoria_id: { type: DataTypes.INTEGER, allowNull: false },
  proveedor_id: { type: DataTypes.INTEGER, allowNull: false },
  creado_en:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false })

// ── Empleado ──────────────────────────────────────────────────
const Empleado = sequelize.define('empleados', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:    { type: DataTypes.STRING(150), allowNull: false },
  apellido:  { type: DataTypes.STRING(150), allowNull: false },
  email:     { type: DataTypes.STRING(150), allowNull: false, unique: true },
  telefono:  { type: DataTypes.STRING(30) },
  cargo:     { type: DataTypes.STRING(100) },
  activo:    { type: DataTypes.BOOLEAN, defaultValue: true },
  creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false })

// ── Cliente ───────────────────────────────────────────────────
const Cliente = sequelize.define('clientes', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre:    { type: DataTypes.STRING(150), allowNull: false },
  apellido:  { type: DataTypes.STRING(150), allowNull: false },
  email:     { type: DataTypes.STRING(150), unique: true },
  telefono:  { type: DataTypes.STRING(30) },
  direccion: { type: DataTypes.TEXT },
  creado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false })

// ── Venta ─────────────────────────────────────────────────────
const Venta = sequelize.define('ventas', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cliente_id:  { type: DataTypes.INTEGER, allowNull: false },
  empleado_id: { type: DataTypes.INTEGER, allowNull: false },
  fecha:       { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  total:       { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  estado:      { type: DataTypes.STRING(20), defaultValue: 'completada' },
}, { timestamps: false })

// ── DetalleVenta ──────────────────────────────────────────────
const DetalleVenta = sequelize.define('detalle_venta', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  venta_id:    { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad:    { type: DataTypes.INTEGER, allowNull: false },
  precio_unit: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  subtotal:    { type: DataTypes.DECIMAL(12,2) },
}, { timestamps: false })

// ── Usuario ───────────────────────────────────────────────────
const Usuario = sequelize.define('usuarios', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username:      { type: DataTypes.STRING(80), allowNull: false, unique: true },
  password_hash: { type: DataTypes.TEXT, allowNull: false },
  rol:           { type: DataTypes.STRING(20), defaultValue: 'vendedor' },
  empleado_id:   { type: DataTypes.INTEGER },
  creado_en:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: false })

// ── Associations ──────────────────────────────────────────────
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' })
Producto.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' })
Categoria.hasMany(Producto,   { foreignKey: 'categoria_id' })
Proveedor.hasMany(Producto,   { foreignKey: 'proveedor_id' })

Venta.belongsTo(Cliente,  { foreignKey: 'cliente_id',  as: 'cliente' })
Venta.belongsTo(Empleado, { foreignKey: 'empleado_id', as: 'empleado' })
Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'items' })
DetalleVenta.belongsTo(Venta,    { foreignKey: 'venta_id' })
DetalleVenta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' })

Usuario.belongsTo(Empleado, { foreignKey: 'empleado_id', as: 'empleado' })

module.exports = { sequelize, Categoria, Proveedor, Producto, Empleado, Cliente, Venta, DetalleVenta, Usuario }
