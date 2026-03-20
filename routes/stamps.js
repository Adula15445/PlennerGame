const express = require('express');
const router = express.Router();
const Stamp = require('../models/Stamp'); // 방금 만든 모델 불러오기
const authenticateToken = require('../middleware/authMiddleware');

// [저장/업데이트] POST /stamps/sync
router.post('/sync', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { savedStamps } = req.body;

        // 찾아서 업데이트하고, 없으면 새로 생성(upsert)
        await Stamp.findOneAndUpdate(
            { userId },
            { savedStamps },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "도장 데이터 동기화 완료" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [불러오기] GET /stamps/sync
router.get('/sync', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const stampData = await Stamp.findOne({ userId });

        // 데이터가 없으면 빈 배열을 반환해서 유니티에서 에러 안 나게 처리
        if (!stampData) {
            return res.status(200).json({ savedStamps: [] });
        }

        res.status(200).json({ savedStamps: stampData.savedStamps });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;