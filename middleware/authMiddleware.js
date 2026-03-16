const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // 요청 헤더에서 Authorization 추출
    const authHeader = req.headers['authorization'];
    // "Bearer <token>" 형태에서 토큰 값만 분리
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "접근 권한이 없습니다." });

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "유효하지 않은 토큰입니다." });
        
        // 인증 성공! 토큰에서 뽑은 정보를 req.user에 담아 다음 단계로 전달
        req.user = user; 
        next();
    });
};

module.exports = authenticateToken;