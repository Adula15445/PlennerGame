const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// GET /dialogue/check?key=user123_Doctor_First_Meet
router.get('/check', auth, async (req, res) => {
    const { key } = req.query;
    const userId = req.user.userId;

    try {
        const User = require('../models/User');
        const user = await User.findById(userId);
        
        const isCompleted = user.completedDialogues?.includes(key) ?? false;
        res.json({ isCompleted });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /dialogue/complete
router.post('/complete', auth, async (req, res) => {
    const { eventKey, isCompleted } = req.body;
    const userId = req.user.id;

    try {
        const User = require('../models/User');
        
        if (isCompleted) {
            // 완료 키 추가 ($addToSet = 중복 방지)
            await User.findByIdAndUpdate(userId, {
                $addToSet: { completedDialogues: eventKey }
            });
        } else {
            // 리셋 (에디터 테스트용)
            await User.findByIdAndUpdate(userId, {
                $pull: { completedDialogues: eventKey }
            });
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;