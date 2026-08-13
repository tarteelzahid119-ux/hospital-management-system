const request = require('supertest');
const app = require('../../app');

describe('Appointments API - double booking prevention', () => {
  let token;
  let doctorId;
  let patientId;

  beforeEach(async () => {
    const signup = await request(app).post('/api/auth/signup').send({
      name: 'Reception User',
      email: 'reception@hospital.com',
      password: 'password123',
      role: 'receptionist',
    });
    token = signup.body.data.token;

    // Admin needed to create a doctor
    const adminSignup = await request(app).post('/api/auth/signup').send({
      name: 'Admin User',
      email: 'admin2@hospital.com',
      password: 'password123',
      role: 'admin',
    });
    const adminToken = adminSignup.body.data.token;

    const doctorRes = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dr. Smith',
        specialization: 'Cardiology',
        email: 'drsmith@hospital.com',
        phone: '1234567890',
      });
    doctorId = doctorRes.body.data._id;

    const patientRes = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'John Doe', age: 40, gender: 'male', phone: '9999999999' });
    patientId = patientRes.body.data._id;
  });

  it('books an appointment successfully', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patient: patientId,
        doctor: doctorId,
        date: '2026-09-01',
        startTime: '10:00',
        endTime: '10:30',
        reason: 'Checkup',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe('pending');
  });

  it('rejects an overlapping appointment for the same doctor', async () => {
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patient: patientId,
        doctor: doctorId,
        date: '2026-09-01',
        startTime: '10:00',
        endTime: '10:30',
      });

    const conflictRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patient: patientId,
        doctor: doctorId,
        date: '2026-09-01',
        startTime: '10:15',
        endTime: '10:45',
      });

    expect(conflictRes.statusCode).toBe(409);
  });

  it('allows a non-overlapping appointment for the same doctor on the same day', async () => {
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patient: patientId,
        doctor: doctorId,
        date: '2026-09-01',
        startTime: '10:00',
        endTime: '10:30',
      });

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patient: patientId,
        doctor: doctorId,
        date: '2026-09-01',
        startTime: '10:30',
        endTime: '11:00',
      });

    expect(res.statusCode).toBe(201);
  });
});
