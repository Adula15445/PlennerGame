const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. 이미 존재하는 유저인지 확인
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "이미 존재하는 아이디입니다." });
        }

        // 2. 존재하지 않는다면 비밀번호 암호화 후 저장
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: "회원가입 성공" });
    } catch (err) {
        res.status(500).json({ error: "회원가입 처리 중 오류 발생" });
    }
});

module.exports = router;

const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "로그인 실패" });
    }
});