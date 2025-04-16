/**
 * Test script for user creation and deletion
 * Run with: node test-user-cleanup.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:7000/api/v1';

async function testUserOperations() {
  try {
    console.log('1. Creating test user...');
    const userResponse = await axios.post(`${API_URL}/signup`, {
      name: 'Test User',
      username: 'testuser' + Date.now(),
      email: `testuser${Date.now()}@example.com`,
      password: 'password123'
    });
    console.log('User created:', userResponse.data);

    console.log('\n2. Creating test astrologer...');
    const astrologerResponse = await axios.post(`${API_URL}/signup/astrologer`, {
      name: 'Test Astrologer',
      username: 'astrologer' + Date.now(),
      email: `astrologer${Date.now()}@example.com`,
      password: 'password123',
      languages: ['English', 'Hindi'],
      experience: 5,
      costPerMinute: 10,
      about: 'Test astrologer for testing purposes'
    });
    console.log('Astrologer created:', astrologerResponse.data);

    console.log('\n3. Testing login...');
    const loginResponse = await axios.post(`${API_URL}/login`, {
      email: userResponse.data.user.email,
      password: 'password123'
    });
    console.log('Login successful:', loginResponse.data);

    console.log('\n4. Deleting all users and astrologers...');
    const deleteResponse = await axios.delete(`${API_URL}/deleteAll`);
    console.log('Deletion response:', deleteResponse.data);

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error.response ? error.response.data : error.message);
  }
}

testUserOperations(); 