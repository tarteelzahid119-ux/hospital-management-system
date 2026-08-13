const request = require('supertest');
const app = require('../../app');

describe('Doctors API', () => {
  let adminToken;
  let receptionistToken;

  beforeEach(async () => {
    const admin = await request(app).post('/api/auth/signup').send({
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = admin.body.data.token;

    const receptionist = await request(app).post('/api/auth/signup').send({
      name: 'Front Desk',
      email: 'frontdesk@hospital.com',
      password: 'password123',
      role: 'receptionist',
    });
    receptionistToken = receptionist.body.data.token;
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/doctors');
    expect(res.statusCode).toBe(401);
  });

  it('allows an admin to create a doctor', async () => {
    const res = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dr. Alice',
        specialization: 'Neurology',
        email: 'alice@hospital.com',
        phone: '5551234567',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe('Dr. Alice');
  });

  it('forbids a non-admin from creating a doctor', async () => {
    const res = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        name: 'Dr. Bob',
        specialization: 'Cardiology',
        email: 'bob@hospital.com',
        phone: '5559876543',
      });
    expect(res.statusCode).toBe(403);
  });

  it('rejects doctor creation with missing required fields', async () => {
    const res = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Incomplete Doctor' });
    expect(res.statusCode).toBe(400);
  });

  it('lists doctors and supports specialization filtering', async () => {
    await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dr. Carol',
        specialization: 'Pediatrics',
        email: 'carol@hospital.com',
        phone: '5551112222',
      });

    const res = await request(app)
      .get('/api/doctors?specialization=pediatrics')
      .set('Authorization', `Bearer ${receptionistToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].specialization).toBe('Pediatrics');
  });

  it('gets, updates, and deletes a doctor by id', async () => {
    const created = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dr. Dan',
        specialization: 'Dermatology',
        email: 'dan@hospital.com',
        phone: '5553334444',
      });
    const id = created.body.data._id;

    const getRes = await request(app)
      .get(`/api/doctors/${id}`)
      .set('Authorization', `Bearer ${receptionistToken}`);
    expect(getRes.statusCode).toBe(200);

    const updateRes = await request(app)
      .put(`/api/doctors/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ consultationFee: 150 });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.consultationFee).toBe(150);

    const deleteRes = await request(app)
      .delete(`/api/doctors/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.statusCode).toBe(200);

    const getAfterDelete = await request(app)
      .get(`/api/doctors/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getAfterDelete.statusCode).toBe(404);
  });
});
