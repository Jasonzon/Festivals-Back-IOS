const Pool = require("pg").Pool
require("dotenv").config()

const proConfig = process.env.DATABASE_URL

const pool = process.env.NODE_ENV !== "production" ? 
new Pool ({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD.toString(),
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT,
  host: process.env.PG_HOST
})

:
new Pool({
    connectionString:proConfig,
    ssl: {
        rejectUnauthorized: false
      }
})

module.exports = pool