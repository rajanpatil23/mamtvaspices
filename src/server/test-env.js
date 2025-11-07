require('dotenv').config();

console.log('=== Environment Variables Test ===');
console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('\nActual values (first 20 chars):');
console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET?.substring(0, 20));
console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET?.substring(0, 20));
