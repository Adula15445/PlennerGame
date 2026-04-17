const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // 기존 필드
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 구글 로그인을 위한 추가 필드
    // unique: true를 주되, 일반 유저의 null 값끼리 충돌하지 않게 sparse 옵션을 넣습니다.
    email: { type: String, unique: true, sparse: true }, 
    googleId: { type: String, unique: true, sparse: true }
});

module.exports = mongoose.model('User', userSchema);