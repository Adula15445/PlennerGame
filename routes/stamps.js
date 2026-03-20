const express = require('express');
const router = express.Router();
const Stamp = require('../models/Stamp'); 
const authenticateToken = require('../middleware/authMiddleware');

/**
 * [저장/업데이트] POST /stamps/sync
 * 클라이언트의 도장 리스트를 유저별로 서버 DB에 동기화합니다.
 */
router.post('/sync', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // 토큰에서 추출한 유저 ID
        
        // 유니티에서 보낸 JSON 데이터 추출
        // req.body.savedStamps가 없을 경우를 대비해 빈 배열([])을 기본값으로 할당
        const savedStamps = req.body.savedStamps || [];

        // 데이터 업데이트 로직
        // { userId }: 해당 유저의 문서를 찾음
        // { savedStamps }: 새로운 도장 리스트로 덮어씀
        // { upsert: true }: 문서가 없으면 새로 생성, 있으면 업데이트
        await Stamp.findOneAndUpdate(
            { userId },
            { savedStamps },
            { upsert: true, new: true }
        );

        // 성공 로그 (서버 터미널에서 확인용)
        console.log(`[Stamp Sync] User: ${userId} - Saved ${savedStamps.length} stamps.`);

        res.status(200).json({ 
            message: "도장 데이터 동기화 완료",
            count: savedStamps.length 
        });
    } catch (err) {
        console.error("[Stamp POST Error]:", err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * [불러오기] GET /stamps/sync
 * 로그인한 유저의 도장 데이터를 조회합니다.
 */
router.get('/sync', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const stampData = await Stamp.findOne({ userId });

        // 1. 해당 유저의 도장 데이터가 아예 없는 경우 (최초 가입 등)
        if (!stampData) {
            return res.status(200).json({ savedStamps: [] });
        }

        // 2. 데이터는 있으나 리스트가 유실된 경우 대비
        const resultList = stampData.savedStamps || [];

        // 유니티 JsonUtility가 인식할 수 있도록 "객체" 안에 "배열"을 담아서 반환
        res.status(200).json({ 
            savedStamps: resultList 
        });
    } catch (err) {
        console.error("[Stamp GET Error]:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;