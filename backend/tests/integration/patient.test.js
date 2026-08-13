const request = require('supertest');
const app = require('../../app');

describe('Patients API', () => {
  let receptionistToken;
  let doctorToken;
  let adminToken;

  beforeEach(async () => {
    const receptionist = await request(app).post('/api/auth/signup').send({
      name: 'Front Desk',
      email: 'frontdesk@hospital.com',
      password: 'password123',
      role: 'receptionist',
    });
    receptionistToken = receptionist.body.data.token;

    const doctor = await request(app).post('/api/auth/signup').send({
      name: 'Dr. House',
      email: 'house@hospital.com',
      password: 'password123',
      role: 'doctor',
    });
    doctorToken = doctor.body.data.token;

    const admin = await request(app).post('/api/auth/signup').send({
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = admin.body.data.token;
  });

  it('allows a receptionist to register a patient', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ name: 'John Doe', age: 34, gender: 'male', phone: '9998887777' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe('John Doe');
    expect(res.body.data.registeredBy).toBeDefined();
  });

  it('forbids a doctor from registering a patient', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ name: 'Jane Doe', age: 29, gender: 'female', phone: '9998887778' });

    expect(res.statusCode).toBe(403);
  });

  it('rejects invalid gender values', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ name: 'Bad Data', age: 29, gender: 'unknown', phone: '1231231234' });

    expect(res.statusCode).toBe(400);
  });

  it('lets any authenticated role view patients, but only admin can delete', async () => {
    const created = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ name: 'Sam Smith', age: 50, gender: 'male', phone: '4445556666' });
    const id = created.body.data._id;

    const viewRes = await request(app)
      .get(`/api/patients/${id}`)
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(viewRes.statusCode).toBe(200);

    const deleteAsDoctorRes = await request(app)
      .delete(`/api/patients/${id}`)
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(deleteAsDoctorRes.statusCode).toBe(403);

    const deleteAsAdminRes = await request(app)
      .delete(`/api/patients/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteAsAdminRes.statusCode).toBe(200);
  });

  it('supports searching patients by name or phone', async () => {
    await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ name: 'Unique Searchname', age: 22, gender: 'other', phone: '1112223333' });

    const res = await request(app)
      .get('/api/patients?search=Searchname')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(1);
  });
});
