import { Router } from "express";
import express from 'express'
import pool from '../config/dbconfig.js'
import 'dotenv/config';
const apiKey = process.env.API_KEY;
import axios from 'axios';
const router = express.Router()
router.post('/', async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=44a1147ed2527a0c66967dd206194156`
    );

    if (!weatherResponse.ok) {
      throw new Error('Weather API request failed');
    }

    const weatherData = await weatherResponse.json();
    const { main, weather } = weatherData;

    const temperature = main.temperature;
    const weatherDescription = weather[0].description;

    const newEntry = await pool.query(
      'INSERT INTO journal (date, description, temperature, weather) VALUES ($1, $2, $3, $4) RETURNING *',
      [date, description, temperature, weather]
    );

    res.status(201).json(newEntry.rows[0]);
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
  try {
    const { id } = req.params;
    const { date, description, temperature, weather } = req.body;
    const updatedEntry = await pool.query(
      'UPDATE journal SET date = $1, description = $2, weather = $3, temperature = $4 WHERE id = $5 RETURNING *',
      [date, description, weather, temperature, id]
    );
    res.json(updatedEntry.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM journal WHERE id = $1', [id]);
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router