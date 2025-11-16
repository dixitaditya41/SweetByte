import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  createSweet,
  getAllSweets,
  searchSweets,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet
} from '../controllers/sweetController';

const router = express.Router();

const validateSweet = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
];

router.post('/', authenticate, isAdmin, validateSweet, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  createSweet(req, res);
});

router.get('/', authenticate, getAllSweets);

router.get('/search', authenticate, [
  query('name').optional().trim(),
  query('category').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  searchSweets(req, res);
});

router.put('/:id', authenticate, isAdmin, validateSweet, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  updateSweet(req, res);
});

router.delete('/:id', authenticate, isAdmin, deleteSweet);

router.post('/:id/purchase', authenticate, purchaseSweet);

router.post('/:id/restock', authenticate, isAdmin, [
  body('quantity').isInt({ min: 1 }).withMessage('Restock quantity must be at least 1')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  restockSweet(req, res);
});

export default router;

