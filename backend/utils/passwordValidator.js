const bcrypt = require('bcrypt');

// 비밀번호 검증 규칙
const validatePassword = (password) => {
    const errors = [];
    
    if (!password) {
        errors.push('비밀번호가 필요합니다.');
        return { isValid: false, errors };
    }
    
    if (password.length < 8) {
        errors.push('비밀번호는 8자 이상이어야 합니다.');
    }
    
    if (password.length > 100) {
        errors.push('비밀번호는 100자 이하여야 합니다.');
    }
    
    // 개발용 - 숫자만 필수로 하고 대소문자는 선택사항
    if (!/[0-9]/.test(password)) {
        errors.push('숫자를 포함해야 합니다.');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// 비밀번호 해싱
const hashPassword = async (password) => {
    try {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        console.error('비밀번호 해싱 실패:', error);
        throw new Error('비밀번호 처리 중 오류가 발생했습니다.');
    }
};

// 비밀번호 검증
const verifyPassword = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.error('비밀번호 검증 실패:', error);
        throw new Error('비밀번호 검증 중 오류가 발생했습니다.');
    }
};

module.exports = {
    validatePassword,
    hashPassword,
    verifyPassword
}; 