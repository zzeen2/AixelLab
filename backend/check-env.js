require('dotenv').config();

console.log('=== 환경 변수 검증 ===');

const requiredEnvVars = {
    'ENTRYPOINT_ADDRESS': process.env.ENTRYPOINT_ADDRESS,
    'PAYMASTER_ADDRESS': process.env.PAYMASTER_ADDRESS,
    'SMART_ACCOUNT_FACTORY_ADDRESS': process.env.SMART_ACCOUNT_FACTORY_ADDRESS,
    'ARTWORK_NFT_ADDRESS': process.env.ARTWORK_NFT_ADDRESS,
    'AXC_ADDRESS': process.env.AXC_ADDRESS,
    'MARKETPLACE_ADDRESS': process.env.MARKETPLACE_ADDRESS,
    'PRIVATE_KEY': process.env.PRIVATE_KEY,
    'RPC_URL': process.env.RPC_URL,
    'PINATA_JWT': process.env.PINATA_JWT
};

let allValid = true;

for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
        console.log(`❌ ${key}: 설정되지 않음`);
        allValid = false;
    } else {
        console.log(`✅ ${key}: ${value}`);
    }
}

if (allValid) {
    console.log('\n🎉 모든 필수 환경 변수가 설정되었습니다!');
} else {
    console.log('\n🚨 일부 환경 변수가 설정되지 않았습니다!');
    process.exit(1);
} 