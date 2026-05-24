const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/authMiddleware'); // ✅ 추가

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("432052625871-gaijb8n45ragn7u6ca5ra8juv10i7fmq.apps.googleusercontent.com");

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "이미 존재하는 아이디입니다." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: "회원가입 성공" });
    } catch (err) {
        res.status(500).json({ error: "회원가입 처리 중 오류 발생" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.json({ token, username: user.username });
        } else {
            res.status(401).json({ error: "로그인 실패" });
        }
    } catch (err) {
        res.status(500).json({ error: "로그인 중 서버 오류 발생" });
    }
});

router.post('/google', async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: "432052625871-gaijb8n45ragn7u6ca5ra8juv10i7fmq.apps.googleusercontent.com",
        });
        
        const payload = ticket.getPayload();
        const { sub, email, name } = payload; 

        let user = await User.findOne({ $or: [{ googleId: sub }, { email: email }] });

        if (!user) {
            const tempUsername = `${name}_${sub.slice(-4)}`;
            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
            
            user = new User({ 
                username: tempUsername, 
                password: dummyPassword,
                email: email,
                googleId: sub 
            });
            await user.save();
        }

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, username: user.username });

    } catch (err) {
        console.error(err);
        res.status(401).json({ error: "구글 토큰이 유효하지 않습니다." });
    }
});

// ✅ 추가 - 자동 로그인 시 유저 정보 반환
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: '유저를 찾을 수 없습니다.' });
        res.json({ username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;