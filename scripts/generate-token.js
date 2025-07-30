#!/usr/bin/env node

/**
 * JWT Token Generator Script
 * 
 * This script generates JWT tokens for testing the API.
 * 
 * Usage:
 *   node scripts/generate-token.js [api_key] [permissions]
 * 
 * Examples:
 *   node scripts/generate-token.js my-api-key read,write,delete
 *   node scripts/generate-token.js read-only-key read
 */

// Import JWT utilities directly from source
const jwt = require('jsonwebtoken');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Generate a JWT token for API access
 */
function generateToken(apiKey, permissions = ['read']) {
  const payload = {
    api_key: apiKey,
    permissions,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Get token expiration time
 */
function getTokenExpiration(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const apiKey = args[0] || 'test-api-key';
const permissions = args[1] ? args[1].split(',') : ['read'];

console.log('🔐 JWT Token Generator');
console.log('=====================\n');

console.log(`API Key: ${apiKey}`);
console.log(`Permissions: ${permissions.join(', ')}\n`);

try {
  // Generate token
  const token = generateToken(apiKey, permissions);
  const expiration = getTokenExpiration(token);

  console.log('✅ Token generated successfully!\n');
  console.log('📋 Token:');
  console.log(token);
  console.log('\n📅 Expires at:', expiration?.toISOString());
  
  console.log('\n🔧 Usage:');
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/v1/events`);
  
  console.log('\n📚 Swagger UI:');
  console.log('1. Go to http://localhost:3000/docs');
  console.log('2. Click "Authorize" button');
  console.log('3. Enter the token above');
  console.log('4. Test the API endpoints');

} catch (error) {
  console.error('❌ Error generating token:', error.message);
  process.exit(1);
} 