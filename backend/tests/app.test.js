const request = require('supertest');

// Mock environment variables required by Passport.js before requiring the app
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.JWT_SECRET = 'test-jwt-secret';

// Mock the database connection so we don't try to connect to MongoDB during simple route tests
jest.mock('../config/db', () => jest.fn());

const app = require('../app'); // Import your Express app

describe('JobPortal API Tests', () => {
  
  // 1. A basic mathematical test to prove Jest is working
  it('should pass a basic sanity check', () => {
    expect(1 + 1).toBe(2);
  });

  // 2. Testing the Express App Error Handling (404 Not Found)
  it('should return 404 for an unknown route', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');
    
    // We expect the HTTP status code to be 404
    expect(res.statusCode).toBe(404);
  });

});
