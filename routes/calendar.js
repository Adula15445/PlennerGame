const express = require('express');
const router = express.Router();
const Calendar = require('../models/Calendar'); // 캘린더 DB 모델 (아직 안 만들었다면 곧 만들 예정!)
const authenticateToken = require('../middleware/authMiddleware');

// 1. 유저의 캘린더 데이터 불러오기 (GET)
router.get('/sync', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const calendarData = await Calendar.findOne({ userId });
        res.json(calendarData || { scheduleKeys: [], scheduleValues: [], colorKeys: [], colorValues: [] });
    } catch (err) {
        res.status(500).json({ error: "데이터 불러오기 실패" });
    }
});

// 2. 유저의 캘린더 데이터 저장하기 (POST)
router.post('/sync', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { scheduleKeys, scheduleValues, colorKeys, colorValues } = req.body;

        await Calendar.findOneAndUpdate(
            { userId },
            { scheduleKeys, scheduleValues, colorKeys, colorValues },
            { upsert: true, new: true } // 없으면 생성하고, 있으면 업데이트
        );
        res.status(200).json({ message: "동기화 성공" });
    } catch (err) {
        res.status(500).json({ error: "동기화 실패" });
    }
});

module.exports = router;