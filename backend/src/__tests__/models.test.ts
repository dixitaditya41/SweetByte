import mongoose from 'mongoose';
import User from '../models/User';
import Sweet from '../models/Sweet';

describe('Models', () => {
  beforeAll(async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-sweet-shop';
    await mongoose.connect(mongoURI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});
  });

  describe('User Model', () => {
    it('should hash password before saving', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      expect(user.password).not.toBe('password123');
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('should compare password correctly', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    it('should set default role to user', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();

      expect(user.role).toBe('user');
    });

    it('should not hash password if not modified', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();
      const originalPassword = user.password;

      user.username = 'newusername';
      await user.save();

      expect(user.password).toBe(originalPassword);
    });
  });

  describe('Sweet Model', () => {
    it('should create sweet with all required fields', async () => {
      const sweet = new Sweet({
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 5.99,
        quantity: 100
      });
      await sweet.save();

      expect(sweet.name).toBe('Chocolate Bar');
      expect(sweet.category).toBe('Chocolate');
      expect(sweet.price).toBe(5.99);
      expect(sweet.quantity).toBe(100);
    });

    it('should set default quantity to 0', async () => {
      const sweet = new Sweet({
        name: 'Test Sweet',
        category: 'Candy',
        price: 2.99
      });
      await sweet.save();

      expect(sweet.quantity).toBe(0);
    });

    it('should validate price is non-negative', async () => {
      const sweet = new Sweet({
        name: 'Test Sweet',
        category: 'Candy',
        price: -5,
        quantity: 10
      });

      await expect(sweet.save()).rejects.toThrow();
    });
  });
});

