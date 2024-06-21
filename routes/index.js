import { Router } from "express";
import express from 'express'
import pool  from '../config/dbconfig.js'
import 'dotenv/config';
const apiKey = process.env.API_KEY;
import axios from 'axios';
const router = express.Router()
router.get('/', (req, res) => {
  res.send('Weather Forecast Journal API');
});

router.get('/weather', async (req, res) => {
  try {
    const lat = 52.5200; 
    const lon = 13.4050; 
    const part = 'hourly'; 
    

    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=${part}&appid=${apiKey}`);

    res.json(weatherResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

let journalEntries = [];
router.get("/", function (req, res, next) {
    try {
      client.query("select * from jounal;", (err, result) => {
        if (err) {
          throw err;
        }
        if (result.rows.length < 1) {
          res.json({ message: "There are no journal in the database" });
        } else {
          res.json(result.rows);
        }
      });
    } catch (error) {
      next(error);
    }
  });
router.get('/jounal/:id', (req, res) => {
    const entryId = parseInt(req.params.id);
    const entry = journalEntries.find((entry) => entry.id === entryId);
    if (entry) {
        res.json(entry);
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});
router.post('/jounal', (req, res) => {
    const newEntry = req.body;
    newEntry.id = journalEntries.length > 0 ? journalEntries[journalEntries.length - 1].id + 1 : 1;
    journalEntries.push(newEntry);
    res.status(201).json(newEntry);
});
router.put('/jounal/:id', (req, res) => {
    const entryId = parseInt(req.params.id);
    const entryIndex = journalEntries.findIndex((entry) => entry.id === entryId);
    if (entryIndex !== -1) {
        const updatedEntry = req.body;
        journalEntries[entryIndex] = { ...journalEntries[entryIndex], ...updatedEntry };
        res.json(journalEntries[entryIndex]);
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});
router.delete('/jounal/:id', (req, res) => {
    const entryId = parseInt(req.params.id);
    const initialLength = journalEntries.length;
    journalEntries = journalEntries.filter((entry) => entry.id !== entryId);
    if (journalEntries.length < initialLength) {
        res.json({ message: 'Entry deleted successfully' });
    } else {
        res.status(404).json({ error: 'Entry not found' });
    }
});
export default router;