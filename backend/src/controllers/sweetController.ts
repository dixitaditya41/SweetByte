import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Sweet from '../models/Sweet';

export const createSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, price, quantity } = req.body;

    const existingSweet = await Sweet.findOne({ name });
    if (existingSweet) {
      res.status(400).json({ message: 'Sweet with this name already exists' });
      return;
    }

    const sweet = new Sweet({ name, category, price, quantity });
    await sweet.save();

    res.status(201).json({ message: 'Sweet created successfully', sweet });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create sweet' });
  }
};

export const getAllSweets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sweets = await Sweet.find().sort({ createdAt: -1 });
    res.json({ sweets });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch sweets' });
  }
};

export const searchSweets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    const query: any = {};

    if (name) {
      query.name = { $regex: name as string, $options: 'i' };
    }

    if (category) {
      query.category = { $regex: category as string, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
    }

    const sweets = await Sweet.find(query).sort({ createdAt: -1 });
    res.json({ sweets });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Search failed' });
  }
};

export const updateSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    if (name && name !== sweet.name) {
      const existingSweet = await Sweet.findOne({ name });
      if (existingSweet) {
        res.status(400).json({ message: 'Sweet with this name already exists' });
        return;
      }
    }

    sweet.name = name || sweet.name;
    sweet.category = category || sweet.category;
    sweet.price = price !== undefined ? price : sweet.price;
    sweet.quantity = quantity !== undefined ? quantity : sweet.quantity;

    await sweet.save();

    res.json({ message: 'Sweet updated successfully', sweet });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update sweet' });
  }
};

export const deleteSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findByIdAndDelete(id);
    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    res.json({ message: 'Sweet deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete sweet' });
  }
};

export const purchaseSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    if (sweet.quantity === 0) {
      res.status(400).json({ message: 'Sweet is out of stock' });
      return;
    }

    sweet.quantity -= 1;
    await sweet.save();

    res.json({ message: 'Purchase successful', sweet });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Purchase failed' });
  }
};

export const restockSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      res.status(404).json({ message: 'Sweet not found' });
      return;
    }

    sweet.quantity += quantity;
    await sweet.save();

    res.json({ message: 'Restock successful', sweet });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Restock failed' });
  }
};

