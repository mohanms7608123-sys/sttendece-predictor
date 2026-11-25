import crypto from 'crypto';
import { Rating } from '../models/Rating.js';

export async function getMenuItemRatings(req, res) {
  try {
    const ratings = await Rating.find({});
    const ratingsByItem = {};

    ratings.forEach(({ menu_item_id, rating }) => {
      if (!ratingsByItem[menu_item_id]) {
        ratingsByItem[menu_item_id] = { total: 0, count: 0 };
      }
      ratingsByItem[menu_item_id].total += rating;
      ratingsByItem[menu_item_id].count += 1;
    });

    const stats = {};
    Object.entries(ratingsByItem).forEach(([menuItemId, { total, count }]) => {
      stats[menuItemId] = {
        menuItemId,
        averageRating: total / count,
        totalRatings: count,
      };
    });

    return res.json(stats);
  } catch (error) {
    console.error('getMenuItemRatings error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getUserRatings(req, res) {
  try {
    const userId = req.user ? req.user.id : req.query.userId;
    if (!userId) {
      return res.json({});
    }

    const ratings = await Rating.find({ user_id: userId });
    const ratingsMap = {};
    ratings.forEach(({ menu_item_id, rating }) => {
      ratingsMap[menu_item_id] = rating;
    });

    return res.json(ratingsMap);
  } catch (error) {
    console.error('getUserRatings error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function submitRating(req, res) {
  try {
    const userId = req.user ? req.user.id : req.body.userId;
    const { menuItemId, rating } = req.body;

    if (!userId || !menuItemId || !rating) {
      return res.status(400).json({ error: 'User ID, menuItemId, and rating are required' });
    }

    const ratingDoc = await Rating.findOneAndUpdate(
      { user_id: userId, menu_item_id: menuItemId },
      {
        $set: { rating: Number(rating), updated_at: new Date() },
        $setOnInsert: { id: crypto.randomUUID(), created_at: new Date() },
      },
      { new: true, upsert: true }
    );

    return res.json(ratingDoc);
  } catch (error) {
    console.error('submitRating error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteRating(req, res) {
  try {
    const userId = req.user ? req.user.id : req.body.userId;
    const { menuItemId } = req.body;

    await Rating.findOneAndDelete({ user_id: userId, menu_item_id: menuItemId });
    return res.json({ message: 'Rating deleted' });
  } catch (error) {
    console.error('deleteRating error:', error);
    return res.status(500).json({ error: error.message });
  }
}
