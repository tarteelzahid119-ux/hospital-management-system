const User = require('../../models/User');

describe('User model', () => {
  it('hashes the password before saving', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'plaintext123',
      role: 'admin',
    });

    expect(user.password).not.toBe('plaintext123');
  });

  it('comparePassword returns true for correct password', async () => {
    const user = await User.create({
      name: 'Test User 2',
      email: 'test2@example.com',
      password: 'mypassword',
      role: 'receptionist',
    });
    const fetched = await User.findById(user._id).select('+password');
    await expect(fetched.comparePassword('mypassword')).resolves.toBe(true);
    await expect(fetched.comparePassword('wrongpassword')).resolves.toBe(false);
  });

  it('toSafeObject omits the password field', async () => {
    const user = await User.create({
      name: 'Test User 3',
      email: 'test3@example.com',
      password: 'secretpass',
      role: 'doctor',
    });
    const safe = user.toSafeObject();
    expect(safe.password).toBeUndefined();
    expect(safe.email).toBe('test3@example.com');
  });
});
