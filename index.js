require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const calendarRouter = require('./routes/calendar');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use('/calendar', calendarRouter);


const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);


const weatherRoutes = require('./routes/weather');
app.use('/weather', weatherRoutes);

// DB 연결
mongoose.connect(process.env.DB_URL)
    .then(() => console.log('MongoDB 연결 성공'))
    .catch(err => console.error('MongoDB 연결 실패:', err));

// 기본 테스트 라우트
app.get('/', (req, res) => {
    res.send('Plenner Server is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});