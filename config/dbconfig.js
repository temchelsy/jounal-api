import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


pool
  .connect()
  .then(() => {
    console.log("Connected to the database on port 5432")
    pool.query(`
      CREATE TABLE IF NOT EXISTS journal (
          date DATE,
          description TEXT,
          temperature DECIMAL,
          weather VARCHAR(255)
      );
  `);
  })
  .catch((err) => console.error(err));

export default pool;


