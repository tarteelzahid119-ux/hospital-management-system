const { authorize } = require('../../middleware/authMiddleware');

const mockRes = () => ({ status: jest.fn().mockReturnThis() });

describe('authorize middleware (role management)', () => {
  it('calls next() when the user role is in the allowed list', () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    const next = jest.fn();

    authorize('admin', 'doctor')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('throws a 403 error when the user role is not allowed', () => {
    const req = { user: { role: 'receptionist' } };
    const res = mockRes();
    const next = jest.fn();

    expect(() => authorize('admin')(req, res, next)).toThrow();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('throws a 403 error when there is no authenticated user on the request', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    expect(() => authorize('admin')(req, res, next)).toThrow();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
