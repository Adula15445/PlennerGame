const mongoose = require('mongoose');

const StampSchema = new mongoose.Schema({
    // 어떤 유저의 도장 리스트인지 식별 (Calendar 모델과 동일한 방식)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    // 도장 데이터들을 담는 배열
    // 유니티에서 보낸 List<WorkStampData>가 JSON 배열 형태로 여기에 저장됩니다.
    savedStamps: [Object] 
});

module.exports = mongoose.model('Stamp', StampSchema);