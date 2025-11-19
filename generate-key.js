const crypto = require('crypto');

// Generate a random 32-byte (256-bit) key
const key = crypto.randomBytes(32).toString('hex');

console.log('\n🔑 Generated Encryption Key:\n');
console.log(key);
console.log('\n📋 Add this to your .env file:');
console.log(`NEXT_PUBLIC_ENCRYPTION_KEY=${key}`);
console.log('\n⚠️  Keep this key secret and never commit it to version control!\n');
