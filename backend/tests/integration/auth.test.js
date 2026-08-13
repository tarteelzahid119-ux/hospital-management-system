const request = require('supertest');
const app = require('../../app');

describe('Auth API', () => {
  const userPayload = {
    name: 'Admin User',
    email: 'admin@hospital.com',
    password: 'password123',
    role: 'admin',
  };

  it('POST /api/auth/signup creates a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/signup').send(userPayload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(userPayload.email);
  });

  it('POST /api/auth/signup rejects duplicate email', async () => {
    await request(app).post('/api/auth/signup').send(userPayload);
    const res = await request(app).post('/api/auth/signup').send(userPayload);
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/auth/login returns a token for valid credentials', async () => {
    await request(app).post('/api/auth/signup').send(userPayload);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userPayload.email, password: userPayload.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/auth/login rejects invalid credentials', async () => {
    await request(app).post('/api/auth/signup').send(userPayload);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userPayload.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/auth/me returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/auth/me returns the user profile with a valid token', async () => {
    const signupRes = await request(app).post('/api/auth/signup').send(userPayload);
    const token = signupRes.body.data.token;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(userPayload.email);
  });
});
