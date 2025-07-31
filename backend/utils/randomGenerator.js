// 간단한 랜덤 닉네임 생성
const adjectives = [
    'Cool', 'Brave', 'Swift', 'Golden', 'Silver', 'Mystic', 'Noble', 'Wild',
    'Bold', 'Wise', 'Sharp', 'Fierce', 'Gentle', 'Royal', 'Hidden', 'Blazing'
];

const animals = [
    'Wolf', 'Eagle', 'Tiger', 'Dragon', 'Phoenix', 'Lion', 'Bear', 'Hawk',
    'Panther', 'Dolphin', 'Whale', 'Shark', 'Falcon', 'Raven', 'Fox', 'Lynx'
];

// 랜덤 색상 팔레트
const colors = [
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#84cc16', // Lime
    '#f97316'  // Orange-Red
];

// 랜덤 닉네임
function generateRandomUsername() {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const number = Math.floor(Math.random() * 1000);
    
    return `${adjective}${animal}${number}`;
}

// 랜덤 아바타
function generateRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = {
    generateRandomUsername,
    generateRandomColor
}; 