const jwt = require('jsonwebtoken');
const generateToken = require('../../utils/generateToken');

describe('generateToken', () => {
  it('signs a JWT containing the user id and role', () => {
    const token = generateToken('507f1f77bcf86cd799439011', 'admin');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.id).toBe('507f1f77bcf86cd799439011');
    expect(decoded.role).toBe('admin');
    expect(decoded.exp).toBeDefined();
  });

  it('produces a token that fails verification with the wrong secret', () => {
    const token = generateToken('507f1f77bcf86cd799439011', 'doctor');
    expect(() => jwt.verify(token, 'wrong_secret')).toThrow();
  });
});
