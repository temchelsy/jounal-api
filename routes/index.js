import { Router } from "express";
import express from 'express'
import pool from '../config/dbconfig.js'
import 'dotenv/config';
const apiKey = process.env.API_KEY;
import axios from 'axios';
// const router = express.Router()
// import validateData from '../validation.js';

const router = express.Router();
// const apiKey = process.env.API_KEY;

function handleApiError(error, next) {
  if (axios.isAxiosError(error)) {
    const { response } = error;
    if (response) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      console.error(response.data);
      next(new Error(`Weather API error: ${response.status} ${response.statusText} - ${response.data.message || 'No additional details'}`));
    } else {
      console.error('API Error:', error.message);
      next(new Error(`Weather API error: ${error.message}`));
    }
  } else {
    console.error('Unknown Error:', error);
    next(error);
  }
} 

router.post('/', (req, res, next) => {
  const { date, description, latitude, longitude } = req.body;

  try {
    // validateData({ date, description });

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }

    const url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    console.log(`Requesting weather data from URL: ${url}`);

    axios.get(url)
      .then(weatherResponse => {
        const { weather, main } = weatherResponse.data;
        const temperature = main.temp;

        return pool.query(
          'INSERT INTO journal (date, description, weather, temperature) VALUES ($1, $2, $3, $4) RETURNING *',
          [date, description, weather[0].main, temperature]
        );
      })
      .then(result => {
        res.json(result.rows[0]);
      })
      .catch(error => {
        next(error);
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', (req, res, next) => {
  pool.query('SELECT * FROM journal')
    .then(entries => {
      res.json(entries.rows);
    })
    .catch(error => {
      next(error);
    });
});

router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { date, description, weather, temperature } = req.body;

  try {
   

    pool.query(
      'UPDATE journal SET date = $1, description = $2, weather = $3, temperature = $4 WHERE id = $5 RETURNING *',
      [date, description, weather, temperature, id]
    )
      .then(result => {
        const updatedEntry = result.rows[0];
        if (!updatedEntry) {
          res.status(404).json({ error: "Entry not found." });
        } else {
          res.json(updatedEntry);
        }
      })
      .catch(error => {
        next(error);
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  pool.query('DELETE FROM journal WHERE id = $1', [id])
    .then(() => {
      res.json({ message: 'Entry deleted' });
    })
    .catch(error => {
      next(error);
    });
});

router.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? '' : error.stack 
  });
});

export default router;