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

/* const prepararHATEOAS = (medicamentos) => {
  const results = medicamentos.map((m) => {
    return {
      name: m.nombre,
      href: `/joyas/${m.id}`
    }
  }).slice(0, 4)
  const total = medicamentos.length
  const HATEOAS = {
    total,
    results
  }
  return HATEOAS
} */

// obtener todas las joyas
const allJewels = async ({ limit = 6 }) => await genericSqlQuery('SELECT * FROM inventario LIMIT $1;', [limit])

// obtener todas las joyas pero con un limit y un order
const allJewelsformatted = async ({ limit = 6, order = 'nombre_asc' }) => {
  const [campo, direccion] = order.split('_')
  const formatted = format('SELECT * FROM inventario ORDER BY %s %s LIMIT %s;', campo, direccion, limit)
  return await genericSqlQuery(formatted)
}

// obtener todas las joyas por pagina pero con limit y order
const allJewelsPerPage = async ({ limit = 6, page = 0, order = 'nombre_asc' }) => {
  const [campo, direccion] = order.split('_')
  const offSet = limit * page
  const formatted = format('SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s', campo, direccion, limit, offSet)
  return await genericSqlQuery(formatted)
}

// obtener joyas ordenadas por filtro
const getAllJewelsByFilters = async ({ preciomax, preciomin, categoria = 'aros', metal = 'oro' }) => {
  const filters = []
  let query = 'SELECT * FROM inventario'
  if (preciomin) filters.push(`precio >= ${preciomin}`)
  if (preciomax) filters.push(`precio <= ${preciomax}`)
  if (filters.length > 0) query += `WHERE ${filters.join(' AND ')}`
  return await genericSqlQuery(query)
}

module.exports = {
  allJewels,
  allJewelsformatted,
  allJewelsPerPage,
  getAllJewelsByFilters
}
