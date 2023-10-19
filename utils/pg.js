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

const HATEOAS = (joyas, limit, order, page) => {
  const results = joyas.map((j) => ({
    name: j.nombre,
    href: `/joyas/joya/${j.id}`
  }))
  return {
    total: joyas.length,
    next: page < 2 ? `/joyas?limit=${limit}&order=${order}&page=${+page + 1}` : null,
    previous: page > 1 ? `/joyas?limit=${limit}&order=${order}&page=${page - 1}` : null,
    results
  }
}

const joyasPorId = async (id) => await genericSqlQuery('SELECT * FROM inventario WHERE id = $1;', [id])

const todasLasJoyas = async ({ limit = 6, page = 1, order = 'nombre_asc' }) => {
  const [campo, direccion] = order.split('_')
  const offSet = limit * (page - 1)
  const formatted = format('SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s', campo, direccion, limit, offSet)
  const joyas = await genericSqlQuery(formatted)
  return HATEOAS(joyas, limit, order, page)
}

// obtener joyas ordenadas por filtro
const getAllJewelsByFilters = async ({ preciomax, preciomin, categoria = 'aros', metal = 'oro' }) => {
  const filters = []
  let query = 'SELECT * FROM inventario'
  if (preciomin) filters.push(`precio >= ${preciomin}`)
  if (preciomax) filters.push(`precio <= ${preciomax}`)
  if (filters.length > 0) query += `WHERE ${filters.join(' AND ')};`
  return await genericSqlQuery(query)
}

module.exports = {
  getAllJewelsByFilters,
  joyasPorId,
  todasLasJoyas
}
