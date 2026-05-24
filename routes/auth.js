const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. 구글 인증 라이브러리 추가
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("432052625871-gaijb8n45ragn7u6ca5ra8juv10i7fmq.apps.googleusercontent.com");

/**
 * [POST] /register
 * 일반 회원가입 (기존 로직 유지)
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "이미 존재하는 아이디입니다." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // 모델이 변경되었으므로 기본 가입 시에도 구조는 유지됩니다.
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: "회원가입 성공" });
    } catch (err) {
        res.status(500).json({ error: "회원가입 처리 중 오류 발생" });
    }
});

/**
 * [POST] /login
 * 일반 로그인 (기존 로직 유지)
 */
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

/**
 * [POST] /google
 * 구글 전용 로그인/회원가입 라우터 (추가된 부분)
 */
router.post('/google', async (req, res) => {
    const { idToken } = req.body;

    try {
        // 구글 토큰 검증
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: "432052625871-gaijb8n45ragn7u6ca5ra8juv10i7fmq.apps.googleusercontent.com",
        });
        
        const payload = ticket.getPayload();
        const { sub, email, name } = payload; 

        // 1. 구글 ID(sub) 또는 이메일로 유저 찾기
        let user = await User.findOne({ $or: [{ googleId: sub }, { email: email }] });

        if (!user) {
            // 2. 유저가 없다면 신규 생성
            // 일반 아이디와 겹치지 않게 이름 뒤에 구글 ID 끝자리 4글자를 붙임
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

        // 3. 우리 서버 전용 JWT 발급 (기존 로그인과 동일한 방식)
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, username: user.username });

    } catch (err) {
        console.error(err);
        res.status(401).json({ error: "구글 토큰이 유효하지 않습니다." });
    }
});

module.exports = router;