const express = require('express');
const router = express.Router();
const axios = require('axios'); // npm install axios 필요

router.get('/', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.WEATHER_API_KEY ? process.env.WEATHER_API_KEY.trim() : null;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: '날씨 정보를 가져오지 못했습니다.' });
    }
});

module.exports = router;