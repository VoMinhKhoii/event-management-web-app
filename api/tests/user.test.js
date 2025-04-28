import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import app from '../app.js';

dotenv.config(); // Load environment variables

const EXISTING_USER_ID = '6807c62835296727bebadf03'; // ID in dtb
const SECOND_USER_ID = '6807cad335296727bebadf0b';  // ID in dtb
const NONEXISTENT_USER_ID = new mongoose.Types.ObjectId(); // ID non-existent in dtb

// Helper function to generate test token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1d' }
  );
};

describe('User API Tests', () => {
  // Test getting user profile
  it('should return user profile when authenticated', async () => {
    const token = generateToken(EXISTING_USER_ID);
    
    const res = await request(app)
      .get(`/api/users/${EXISTING_USER_ID}`)
      .set('Cookie', [`token=${token}`]);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('email');
    expect(res.body).not.toHaveProperty('password');
  },15000);
  
  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .get(`/api/users/${EXISTING_USER_ID}`);
    
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
  
  it('should return 404 if user is not found', async () => {
    const token = generateToken(EXISTING_USER_ID);
    
    const res = await request(app)
      .get(`/api/users/${NONEXISTENT_USER_ID}`)
      .set('Cookie', [`token=${token}`]);
    
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message');
  });
  
  // Test updating user profile 
  it('should update user profile when authenticated', async () => {
    const token = generateToken(EXISTING_USER_ID);
    const updateData = {
      firstName: 'Tai',
      lastName: 'Truong',
      email: 'tantai123@gmail.com',
      password: '12345678',
    };
    
    const res = await request(app)
      .put(`/api/users/${EXISTING_USER_ID}`)
      .set('Cookie', [`token=${token}`])
      .send(updateData);
    
    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('firstName', 'Tai');
    expect(res.body.user).toHaveProperty('lastName', 'Truong');
    expect(res.body.user).toHaveProperty('email', 'tantai123@gmail.com');
    expect(res.body.user).not.toHaveProperty('password' ); 
  });

  
  it('should return 403 when trying to update another user profile', async () => {
    const token = generateToken(EXISTING_USER_ID);
    
    const res = await request(app)
      .put(`/api/users/${SECOND_USER_ID}`)
      .set('Cookie', [`token=${token}`])
      .send({ firstName: 'Tai' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
  
  // Test all users endpoint
  it('should return all users', async () => {
    const res = await request(app)
      .get('/api/users');
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });


  it('should update user avatar when authenticated', async () => {
    const token = generateToken(EXISTING_USER_ID);
    const avatarUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbCFD9hBq5ZBfdDqHa1IPFZORSL3EkPSxU2tomxsaeiOcuOyQMbUhNN-htl5xLTtZwvMU&usqp=CAU';
    
    const res = await request(app)
      .put(`/api/users/${EXISTING_USER_ID}/avatar`)
      .set('Cookie', [`token=${token}`])
      .send({ avatarUrl: avatarUrl });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('avatar', avatarUrl);
    expect(res.body).toHaveProperty('message', 'Avatar updated successfully');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});