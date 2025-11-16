import request from 'supertest';
import app from '../server';
import User from '../models/User';
import Sweet from '../models/Sweet';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

describe('Sweets API', () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;

  beforeAll(async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-sweet-shop';
    await mongoose.connect(mongoURI);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Sweet.deleteMany({});
    await User.deleteMany({});

    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    adminId = admin._id.toString();

    const user = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    });
    userId = user._id.toString();

    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    adminToken = jwt.sign({ id: adminId, role: 'admin' }, jwtSecret);
    userToken = jwt.sign({ id: userId, role: 'user' }, jwtSecret);
  });

  describe('POST /api/sweets', () => {
    it('should create a sweet as admin', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 5.99,
          quantity: 100
        });

      expect(response.status).toBe(201);
      expect(response.body.sweet).toHaveProperty('name', 'Chocolate Bar');
    });

    it('should return 403 if user is not admin', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 5.99,
          quantity: 100
        });

      expect(response.status).toBe(403);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 5.99,
          quantity: 100
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '',
          category: '',
          price: -1,
          quantity: -1
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      await Sweet.create([
        { name: 'Sweet 1', category: 'Candy', price: 2.99, quantity: 50 },
        { name: 'Sweet 2', category: 'Chocolate', price: 4.99, quantity: 30 }
      ]);
    });

    it('should get all sweets for authenticated user', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets).toHaveLength(2);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/sweets');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      await Sweet.create([
        { name: 'Chocolate Bar', category: 'Chocolate', price: 5.99, quantity: 100 },
        { name: 'Gummy Bears', category: 'Candy', price: 3.99, quantity: 50 },
        { name: 'Dark Chocolate', category: 'Chocolate', price: 7.99, quantity: 30 }
      ]);
    });

    it('should search by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=Chocolate')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBeGreaterThan(0);
    });

    it('should search by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Candy')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets).toHaveLength(1);
    });

    it('should search by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=4&maxPrice=6')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Original Sweet',
        category: 'Candy',
        price: 2.99,
        quantity: 50
      });
      sweetId = sweet._id.toString();
    });

    it('should update sweet as admin', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Sweet',
          category: 'Chocolate',
          price: 4.99,
          quantity: 75
        });

      expect(response.status).toBe(200);
      expect(response.body.sweet.name).toBe('Updated Sweet');
    });

    it('should return 403 if user is not admin', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Sweet',
          category: 'Chocolate',
          price: 4.99,
          quantity: 75
        });

      expect(response.status).toBe(403);
    });

    it('should return 404 if sweet not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Sweet',
          category: 'Chocolate',
          price: 4.99,
          quantity: 75
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'To Delete',
        category: 'Candy',
        price: 2.99,
        quantity: 50
      });
      sweetId = sweet._id.toString();
    });

    it('should delete sweet as admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      const deleted = await Sweet.findById(sweetId);
      expect(deleted).toBeNull();
    });

    it('should return 403 if user is not admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Purchasable Sweet',
        category: 'Candy',
        price: 2.99,
        quantity: 10
      });
      sweetId = sweet._id.toString();
    });

    it('should purchase sweet and decrease quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(9);
    });

    it('should return 400 if sweet is out of stock', async () => {
      await Sweet.findByIdAndUpdate(sweetId, { quantity: 0 });

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('out of stock');
    });

    it('should return 404 if sweet not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/sweets/${fakeId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let sweetId: string;

    beforeEach(async () => {
      const sweet = await Sweet.create({
        name: 'Restockable Sweet',
        category: 'Candy',
        price: 2.99,
        quantity: 10
      });
      sweetId = sweet._id.toString();
    });

    it('should restock sweet as admin', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 20 });

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(30);
    });

    it('should return 403 if user is not admin', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 20 });

      expect(response.status).toBe(403);
    });

    it('should return 400 if quantity is invalid', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 0 });

      expect(response.status).toBe(400);
    });
  });
});

