const request = require('supertest');
const app = require('../../app');

describe('Reports API', () => {
  let receptionistToken;
  let adminToken;
  let doctorId;
  let patientId;

  beforeEach(async () => {
    const receptionist = await request(app).post('/api/auth/signup').send({
      name: 'Front Desk',
      email: 'frontdesk@hospital.com',
      password: 'password123',
      role: 'receptionist',
    });
    receptionistToken = receptionist.body.data.token;

    const admin = await request(app).post('/api/auth/signup').send({
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = admin.body.data.token;

    const doctor = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Dr. Report', specialization: 'General', email: 'drreport@hospital.com', phone: '1112223333' });
    doctorId = doctor.body.data._id;

    const patient = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ name: 'Report Patient', age: 30, gender: 'female', phone: '4445556666' });
    patientId = patient.body.data._id;

    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        patient: patientId,
        doctor: doctorId,
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '09:30',
      });

    await request(app)
      .post('/api/bills')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ patient: patientId, treatments: [{ name: 'Consultation', charge: 75 }] });
  });

  it('rejects unauthenticated access to the summary report', async () => {
    const res = await request(app).get('/api/reports/summary');
    expect(res.statusCode).toBe(401);
  });

  it('returns a daily summary with patient, appointment, and revenue counts', async () => {
    const res = await request(app)
      .get('/api/reports/summary?period=daily')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.period).toBe('daily');
    expect(res.body.data.totalPatients).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totalAppointments).toBeGreaterThanOrEqual(1);
    expect(res.body.data.revenuePending).toBeGreaterThanOrEqual(75);
  });

  it('returns a weekly summary when period=weekly', async () => {
    const res = await request(app)
      .get('/api/reports/summary?period=weekly')
      .set('Authorization', `Bearer ${receptionistToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.period).toBe('weekly');
  });
});

describe('Notifications API', () => {
  let token;
  let doctorId;
  let patientId;

  beforeEach(async () => {
    const admin = await request(app).post('/api/auth/signup').send({
      name: 'Admin User',
      email: 'admin3@hospital.com',
      password: 'password123',
      role: 'admin',
    });
    token = admin.body.data.token;

    const doctor = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Dr. Notify', specialization: 'General', email: 'drnotify@hospital.com', phone: '7778889999' });
    doctorId = doctor.body.data._id;

    const patient = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Notify Patient', age: 28, gender: 'male', phone: '1231234321' });
    patientId = patient.body.data._id;
  });

  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(401);
  });

  it('returns notifications generated after booking an appointment', async () => {
    await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        patient: patientId,
        doctor: doctorId,
        date: '2026-10-01',
        startTime: '11:00',
        endTime: '11:30',
      });

    const res = await request(app).get('/api/notifications').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].type).toBeDefined();
  });
});
