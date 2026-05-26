require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const { sequelize } = require('./models')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth',      require('./routes/auth'))
app.use('/api/productos', require('./routes/productos'))
app.use('/api/ventas',    require('./routes/ventas'))
app.use('/api/clientes',  require('./routes/clientes'))
app.use('/api/reportes',  require('./routes/reportes'))
app.use('/api',           require('./routes/catalogos'))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Error interno del servidor' })
})

const PORT = process.env.PORT || 4000
sequelize.authenticate()
  .then(() => console.log('Sequelize conectado a PostgreSQL'))
  .catch(err => console.error('Error Sequelize:', err))

app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`))
