-- ============================================================
--  SEED DATA  –  25+ registros por tabla principal
-- ============================================================

-- CATEGORIAS (10)
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Electrónica',      'Dispositivos electrónicos y accesorios'),
  ('Ropa',             'Prendas de vestir para toda la familia'),
  ('Alimentos',        'Productos alimenticios y bebidas'),
  ('Hogar',            'Artículos para el hogar y decoración'),
  ('Deportes',         'Equipamiento deportivo y fitness'),
  ('Juguetes',         'Juguetes y juegos para niños'),
  ('Libros',           'Libros, revistas y material educativo'),
  ('Belleza',          'Cosméticos y cuidado personal'),
  ('Herramientas',     'Herramientas manuales y eléctricas'),
  ('Mascotas',         'Alimento y accesorios para mascotas');

-- PROVEEDORES (10)
INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES
  ('TechWorld SA',       'Carlos López',   '2222-1111', 'ventas@techworld.gt',     'Zona 10, Guatemala City'),
  ('ModaGT',             'Ana Pérez',      '2333-2222', 'pedidos@modagt.com',      'Zona 4, Guatemala City'),
  ('AlimentosFrescos',   'Luis García',    '2444-3333', 'info@alimfrescos.gt',     'Villa Nueva, Guatemala'),
  ('CasaDecor',          'María Rodríguez','2555-4444', 'ventas@casadecor.gt',     'Mixco, Guatemala'),
  ('SportPro',           'José Martínez',  '2666-5555', 'contacto@sportpro.gt',   'Zona 12, Guatemala City'),
  ('JugueMax',           'Sandra Díaz',    '2777-6666', 'compras@juguemax.com',    'Zona 7, Guatemala City'),
  ('LibreríaNacional',   'Roberto Sosa',   '2888-7777', 'pedidos@libronac.gt',     'Zona 1, Guatemala City'),
  ('BellezaTotal',       'Claudia Vega',   '2999-8888', 'ventas@bellezatotal.gt',  'Zona 14, Guatemala City'),
  ('FerreCenter',        'Miguel Ajú',     '3000-9999', 'info@ferrecenter.gt',     'Zona 6, Guatemala City'),
  ('PetWorld',           'Elena Castro',   '3111-0000', 'ventas@petworld.gt',      'San Miguel Petapa, GT');

-- EMPLEADOS (10)
INSERT INTO empleados (nombre, apellido, email, telefono, cargo) VALUES
  ('Juan',    'Pérez',    'juan.perez@tienda.gt',    '5001-0001', 'Vendedor'),
  ('María',   'López',    'maria.lopez@tienda.gt',   '5001-0002', 'Vendedora'),
  ('Carlos',  'García',   'carlos.garcia@tienda.gt', '5001-0003', 'Supervisor'),
  ('Ana',     'Martínez', 'ana.martinez@tienda.gt',  '5001-0004', 'Vendedora'),
  ('Luis',    'Rodríguez','luis.rodriguez@tienda.gt','5001-0005', 'Cajero'),
  ('Sofía',   'Díaz',     'sofia.diaz@tienda.gt',    '5001-0006', 'Vendedora'),
  ('Pedro',   'Sosa',     'pedro.sosa@tienda.gt',    '5001-0007', 'Almacenista'),
  ('Carmen',  'Vega',     'carmen.vega@tienda.gt',   '5001-0008', 'Cajera'),
  ('Diego',   'Morales',  'diego.morales@tienda.gt', '5001-0009', 'Gerente'),
  ('Laura',   'Castro',   'laura.castro@tienda.gt',  '5001-0010', 'Vendedora');

-- CLIENTES (25)
INSERT INTO clientes (nombre, apellido, email, telefono, direccion) VALUES
  ('Roberto',   'Ajú',       'roberto.aju@email.com',     '4001-0001', 'Zona 1, Guatemala'),
  ('Patricia',  'Batz',      'patricia.batz@email.com',   '4001-0002', 'Zona 2, Guatemala'),
  ('Fernando',  'Caal',      'fernando.caal@email.com',   '4001-0003', 'Zona 3, Guatemala'),
  ('Verónica',  'De León',   'veronica.dl@email.com',     '4001-0004', 'Zona 4, Guatemala'),
  ('Hugo',      'Estrada',   'hugo.estrada@email.com',    '4001-0005', 'Zona 5, Guatemala'),
  ('Ingrid',    'Fuentes',   'ingrid.fuentes@email.com',  '4001-0006', 'Zona 6, Guatemala'),
  ('Mario',     'González',  'mario.gonzalez@email.com',  '4001-0007', 'Zona 7, Guatemala'),
  ('Natalia',   'Hernández', 'natalia.h@email.com',       '4001-0008', 'Zona 8, Guatemala'),
  ('Oscar',     'Ixcoy',     'oscar.ixcoy@email.com',     '4001-0009', 'Zona 9, Guatemala'),
  ('Paola',     'Julajuj',   'paola.julajuj@email.com',   '4001-0010', 'Zona 10, Guatemala'),
  ('Quique',    'Kiej',      'quique.kiej@email.com',     '4001-0011', 'Zona 11, Guatemala'),
  ('Rebeca',    'Lux',       'rebeca.lux@email.com',      '4001-0012', 'Zona 12, Guatemala'),
  ('Samuel',    'Macario',   'samuel.macario@email.com',  '4001-0013', 'Zona 13, Guatemala'),
  ('Tania',     'Navarijo',  'tania.navarijo@email.com',  '4001-0014', 'Zona 14, Guatemala'),
  ('Ulises',    'Otzoy',     'ulises.otzoy@email.com',    '4001-0015', 'Villa Nueva, GT'),
  ('Valeria',   'Pérez',     'valeria.perez@email.com',   '4001-0016', 'Mixco, GT'),
  ('Walter',    'Quiché',    'walter.quiche@email.com',   '4001-0017', 'San Miguel Petapa'),
  ('Ximena',    'Raxón',     'ximena.raxon@email.com',    '4001-0018', 'Amatitlán, GT'),
  ('Yolanda',   'Sajquiy',   'yolanda.s@email.com',       '4001-0019', 'Escuintla, GT'),
  ('Zacarías',  'Tox',       'zacarias.tox@email.com',    '4001-0020', 'Chimaltenango, GT'),
  ('Álvaro',    'Uc',        'alvaro.uc@email.com',       '4001-0021', 'Quetzaltenango, GT'),
  ('Brenda',    'Velásquez', 'brenda.v@email.com',        '4001-0022', 'Cobán, GT'),
  ('César',     'Wug',       'cesar.wug@email.com',       '4001-0023', 'Huehuetenango, GT'),
  ('Diana',     'Xú',        'diana.xu@email.com',        '4001-0024', 'Retalhuleu, GT'),
  ('Ernesto',   'Yos',       'ernesto.yos@email.com',     '4001-0025', 'Santa Rosa, GT');

-- PRODUCTOS (30)
INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, proveedor_id) VALUES
  ('Laptop HP 15"',        'Procesador i5, 8GB RAM, 256GB SSD',    4500.00, 15, 1, 1),
  ('Smartphone Samsung A54','Pantalla 6.4", 128GB, 5000mAh',       2200.00, 30, 1, 1),
  ('Audífonos Bluetooth',  'Over-ear, 30h batería, ANC',            350.00, 50, 1, 1),
  ('Tablet Lenovo 10"',    'Android 13, 4GB RAM, 64GB',            1800.00, 20, 1, 1),
  ('Camiseta Polo',        'Algodón 100%, tallas S-XXL',             85.00, 100, 2, 2),
  ('Pantalón Jeans',       'Corte slim, denim azul',                180.00, 60,  2, 2),
  ('Vestido Floral',       'Poliéster, tallas XS-XL',              220.00, 40,  2, 2),
  ('Chaqueta Cuero',       'Cuero sintético, color negro',          550.00, 25,  2, 2),
  ('Arroz 5kg',            'Arroz blanco grano largo',               45.00, 200, 3, 3),
  ('Aceite 1L',            'Aceite vegetal para cocinar',            28.00, 150, 3, 3),
  ('Café Molido 500g',     'Café de altura, tostado medio',          65.00, 80,  3, 3),
  ('Pasta 500g',           'Espagueti de trigo duro',                18.00, 300, 3, 3),
  ('Sofá 3 plazas',        'Tapizado en tela gris',                3200.00, 8,   4, 4),
  ('Mesa de comedor',      'Madera de pino, 6 sillas',             2800.00, 5,   4, 4),
  ('Lámpara LED',          'Pie, 1800 lúmenes, regulable',          320.00, 35,  4, 4),
  ('Almohada Memory Foam', 'Espuma viscoelástica, 50x70cm',          180.00, 70,  4, 4),
  ('Bicicleta MTB',        'Aluminio, 21 velocidades, rin 26',     2500.00, 12,  5, 5),
  ('Pesas Mancuernas 10kg','Par, recubrimiento goma',               380.00, 25,  5, 5),
  ('Yoga Mat',             'Antideslizante, 6mm, 183x61cm',          95.00, 60,  5, 5),
  ('Balón Fútbol #5',      'Cuero sintético, costura máquina',       85.00, 45,  5, 5),
  ('LEGO 500pzs',          'Set construcción ciudad',               350.00, 30,  6, 6),
  ('Muñeca Barbie',        'Incluye accesorios',                    120.00, 40,  6, 6),
  ('Libro "Clean Code"',   'Robert C. Martin, en español',          150.00, 25,  7, 7),
  ('Diccionario Español',  'Real Academia, edición 2023',           220.00, 15,  7, 7),
  ('Shampoo Kerastase',    '250ml, para cabello dañado',            185.00, 55,  8, 8),
  ('Perfume 100ml',        'Eau de Parfum, fragancia floral',       450.00, 30,  8, 8),
  ('Taladro Percutor',     '800W, 13mm, maletín incluido',          850.00, 18,  9, 9),
  ('Set Desarmadores 20pc','Acero CrV, mangos ergonómicos',         120.00, 35,  9, 9),
  ('Comida Perro 15kg',    'Royal Canin, adulto raza mediana',      380.00, 40, 10, 10),
  ('Arena Gato 5kg',       'Aglomerante, sin fragancia',             75.00, 55, 10, 10);

-- USUARIOS — 1 por cada rol (Proyecto 3)
INSERT INTO usuarios (username, password_hash, rol, empleado_id) VALUES
  ('admin',         '$2a$10$G.auk3qGpvVN8kveKBUM7OfKvmN8Q0eZojHi5dQlG/T2QVnMdCePu', 'gerente',      9),
  ('gerente1',      '$2a$10$Pd6yQlxG1QbfHyCylXLdMeOMoupYikfbLuLoEkX19d/YFgnB0Gmrq', 'gerente',      9),
  ('vendedor1',     '$2a$10$Is25l4tCfAEQhsQIpwfwi.xGONJKB2CW9DeLuJfGviRb3G.1jq9AC', 'vendedor',     1),
  ('cajero1',       '$2a$10$vCWyZU6zlRxqOtrKPZ.SsOllN9Ql77nMEyR68HHI0cwgfne/q.XFq', 'cajero',       5),
  ('inventarista1', '$2a$10$CJp5vtc10WbQE8ECOer5KuRMtBbN5SonfA03m6t7FvMolBziQ10se', 'inventarista', 7),
  ('auditor1',      '$2a$10$qTrGpXeu/WE9FBH98GVnR.8Zd1MQX/oL6lbdnFlXxSSegUKtTdWXu', 'auditor',      NULL);

-- VENTAS (30)
INSERT INTO ventas (cliente_id, empleado_id, fecha, estado) VALUES
  (1,  1, NOW() - INTERVAL '29 days', 'completada'),
  (2,  2, NOW() - INTERVAL '28 days', 'completada'),
  (3,  1, NOW() - INTERVAL '27 days', 'completada'),
  (4,  3, NOW() - INTERVAL '26 days', 'completada'),
  (5,  2, NOW() - INTERVAL '25 days', 'completada'),
  (6,  4, NOW() - INTERVAL '24 days', 'completada'),
  (7,  1, NOW() - INTERVAL '23 days', 'anulada'),
  (8,  5, NOW() - INTERVAL '22 days', 'completada'),
  (9,  2, NOW() - INTERVAL '21 days', 'completada'),
  (10, 3, NOW() - INTERVAL '20 days', 'completada'),
  (11, 1, NOW() - INTERVAL '19 days', 'completada'),
  (12, 4, NOW() - INTERVAL '18 days', 'completada'),
  (13, 2, NOW() - INTERVAL '17 days', 'completada'),
  (14, 5, NOW() - INTERVAL '16 days', 'completada'),
  (15, 1, NOW() - INTERVAL '15 days', 'completada'),
  (16, 3, NOW() - INTERVAL '14 days', 'completada'),
  (17, 2, NOW() - INTERVAL '13 days', 'completada'),
  (18, 4, NOW() - INTERVAL '12 days', 'completada'),
  (19, 1, NOW() - INTERVAL '11 days', 'completada'),
  (20, 5, NOW() - INTERVAL '10 days', 'completada'),
  (21, 2, NOW() - INTERVAL '9 days',  'completada'),
  (22, 3, NOW() - INTERVAL '8 days',  'completada'),
  (23, 1, NOW() - INTERVAL '7 days',  'completada'),
  (24, 4, NOW() - INTERVAL '6 days',  'completada'),
  (25, 2, NOW() - INTERVAL '5 days',  'completada'),
  (1,  5, NOW() - INTERVAL '4 days',  'completada'),
  (3,  1, NOW() - INTERVAL '3 days',  'completada'),
  (5,  3, NOW() - INTERVAL '2 days',  'completada'),
  (7,  2, NOW() - INTERVAL '1 day',   'pendiente'),
  (9,  4, NOW(),                       'completada');

-- DETALLE_VENTA (mínimo 2 ítems por venta)
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unit) VALUES
  (1, 1, 1, 4500.00),(1, 3, 2, 350.00),
  (2, 5, 3, 85.00),  (2, 6, 1, 180.00),
  (3, 9, 2, 45.00),  (3, 11,1, 65.00),
  (4, 2, 1, 2200.00),(4, 3, 1, 350.00),
  (5, 17,1, 2500.00),(5, 19,2, 95.00),
  (6, 23,2, 150.00), (6, 24,1, 220.00),
  (7, 13,1, 3200.00),(7, 15,2, 320.00),
  (8, 25,1, 185.00), (8, 26,1, 450.00),
  (9, 27,1, 850.00), (9, 28,2, 120.00),
  (10,29,1, 380.00), (10,30,2, 75.00),
  (11,4, 1, 1800.00),(11,3, 1, 350.00),
  (12,7, 2, 220.00), (12,8, 1, 550.00),
  (13,10,3, 28.00),  (13,12,5, 18.00),
  (14,18,2, 380.00), (14,20,1, 85.00),
  (15,21,1, 350.00), (15,22,1, 120.00),
  (16,1, 1, 4500.00),(16,4, 1, 1800.00),
  (17,5, 5, 85.00),  (17,6, 2, 180.00),
  (18,9, 5, 45.00),  (18,11,3, 65.00),
  (19,2, 1, 2200.00),(19,25,2, 185.00),
  (20,17,1, 2500.00),(20,18,1, 380.00),
  (21,23,1, 150.00), (21,7, 1, 220.00),
  (22,27,1, 850.00), (22,28,1, 120.00),
  (23,13,1, 3200.00),(23,16,2, 180.00),
  (24,29,2, 380.00), (24,30,4, 75.00),
  (25,26,1, 450.00), (25,8, 1, 550.00),
  (26,3, 3, 350.00), (26,19,2, 95.00),
  (27,10,4, 28.00),  (27,12,6, 18.00),
  (28,1, 1, 4500.00),(28,2, 1, 2200.00),
  (29,20,2, 85.00),  (29,21,1, 350.00),
  (30,5, 4, 85.00),  (30,6, 1, 180.00);

-- Actualizar totales de ventas
UPDATE ventas v
SET total = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM detalle_venta dv
    WHERE dv.venta_id = v.id
);

-- Actualizar stocks según ventas completadas
UPDATE productos p
SET stock = stock - sq.vendido
FROM (
    SELECT dv.producto_id, SUM(dv.cantidad) AS vendido
    FROM detalle_venta dv
    JOIN ventas v ON v.id = dv.venta_id AND v.estado = 'completada'
    GROUP BY dv.producto_id
) sq
WHERE p.id = sq.producto_id;
