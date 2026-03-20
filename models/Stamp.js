const mongoose = require('mongoose');

const StampSchema = new mongoose.Schema({
    // 유저 식별자 (User 모델 참조)
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true 
    },
    
    // 도장 데이터 리스트
    // 유니티의 List<WorkStampData> 구조를 통째로 담기 위해 Array 타입으로 정의
    savedStamps: { 
        type: Array, 
        default: [] 
    }
}, { 
    // createdAt, updatedAt 자동 생성 (디버깅 및 관리용)
    timestamps: true 
});

module.exports = mongoose.model('Stamp', StampSchema);