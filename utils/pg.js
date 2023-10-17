require('dotenv').config()
const { Pool } = require('pg')
const format = require('pg-format')

const config = {
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  allowExistOnIdle: true
}

const pool = new Pool(config)

const genericSqlQuery = (query, values) => pool
  .query(query, values)
  .then(({ rows }) => rows)
  .catch(({ code, message }) => ({ code, message }))

const allJoyas = async ({ limit = 6 }) => await genericSqlQuery('SELECT * FROM inventario LIMIT $1;', [limit])

const allJoyasformatted = async ({ limit = 6, order = 'nombre_asc' }) => {
  const [campo, direccion] = order.split('_')
  const formatted = format('SELECT * FROM inventario ORDER BY %s %s LIMIT %s;', campo, direccion, limit)
  return await genericSqlQuery(formatted)
}

module.exports = {
  allJoyas,
  allJoyasformatted
}
