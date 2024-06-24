import { Router } from "express";
import express from 'express'
import pool from '../config/dbconfig.js'
import 'dotenv/config';
const apiKey = process.env.API_KEY;
import axios from 'axios';
const router = express.Router()
 
router.post('/', async (req, res) => {
  const { date, description, latitude, longitude } = req.body;

  try {
    // Make weather API call
    const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=44a1147ed2527a0c66967dd206194156`);
    const { weather, main } = weatherResponse.data;
    const temperature = main.temp;

    // Insert into database
    const newEntry = await pool.query(
      'INSERT INTO journal (date, description, weather, temperature) VALUES ($1, $2, $3, $4) RETURNING *',
      [date, description, weather[0].main, temperature]
    );

    res.status(201).json(newEntry.rows[0]); // 201 for successful creation
  } catch (error) {
    console.error('Database or Weather API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/', async (req, res) => {
  try {
    const entries = await pool.query('SELECT * FROM journal');
    res.json(entries.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { date, description, weather, temperature } = req.body;
  try {
    const updatedEntry = await pool.query('UPDATE journal SET date = $1, description = $2, weather = $3, temperature = $4 WHERE id = $5 RETURNING *', [date, description, weather, temperature, id]);
    res.json(updatedEntry.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await client.query('DELETE FROM journal WHERE id = $1', [id]);
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router