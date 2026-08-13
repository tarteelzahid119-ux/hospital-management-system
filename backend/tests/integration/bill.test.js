const request = require('supertest');
const app = require('../../app');

describe('Billing API', () => {
  let receptionistToken;
  let adminToken;
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

    const patient = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ name: 'Bill Patient', age: 45, gender: 'male', phone: '3213214321' });
    patientId = patient.body.data._id;
  });

  it('generates a bill and auto-computes the total from treatment items', async () => {
    const res = await request(app)
      .post('/api/bills')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        patient: patientId,
        treatments: [
          { name: 'Consultation', charge: 50 },
          { name: 'Blood Test', charge: 30 },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.totalAmount).toBe(80);
    expect(res.body.data.paymentStatus).toBe('unpaid');
  });

  it('rejects a bill for a non-existent patient', async () => {
    const res = await request(app)
      .post('/api/bills')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({
        patient: '64b1f7f7f7f7f7f7f7f7f7f7',
        treatments: [{ name: 'Consultation', charge: 50 }],
      });

    expect(res.statusCode).toBe(404);
  });

  it('rejects a bill with no treatment items', async () => {
    const res = await request(app)
      .post('/api/bills')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ patient: patientId, treatments: [] });

    expect(res.statusCode).toBe(400);
  });

  it('updates payment status and filters bills by status', async () => {
    const created = await request(app)
      .post('/api/bills')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ patient: patientId, treatments: [{ name: 'X-Ray', charge: 100 }] });
    const billId = created.body.data._id;

    const patchRes = await request(app)
      .patch(`/api/bills/${billId}/payment`)
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ paymentStatus: 'paid' });
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.data.paymentStatus).toBe('paid');

    const listRes = await request(app)
      .get('/api/bills?paymentStatus=paid')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listRes.body.count).toBe(1);
  });

  it('only allows an admin to delete a bill', async () => {
    const created = await request(app)
      .post('/api/bills')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .send({ patient: patientId, treatments: [{ name: 'Consultation', charge: 20 }] });
    const billId = created.body.data._id;

    const forbidden = await request(app)
      .delete(`/api/bills/${billId}`)
      .set('Authorization', `Bearer ${receptionistToken}`);
    expect(forbidden.statusCode).toBe(403);

    const allowed = await request(app)
      .delete(`/api/bills/${billId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(allowed.statusCode).toBe(200);
  });
});
