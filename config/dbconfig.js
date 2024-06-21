import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'chelsy237',
  database: 'chelsy',
  port: 5432,
});

pool
  .connect()
  .then(() => console.log("Connected to the database on port 5432"))
  .catch((err) => console.error(err));

export default pool;