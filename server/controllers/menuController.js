import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { MenuItem } from '../models/MenuItem.js';
import { AuditLog } from '../models/AuditLog.js';

export async function getMenuItems(req, res) {
  try {
    const { availableOnly } = req.query;
    const filter = {};
    if (availableOnly === 'true') {
      filter.is_available = true;
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    return res.json(items);
  } catch (error) {
    console.error('getMenuItems error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function createMenuItem(req, res) {
  try {
    const { name, price, image_url, prep_time, is_available, category, is_veg } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({ error: 'Name, price and category are required' });
    }

    const newItem = new MenuItem({
      id: crypto.randomUUID(),
      name: name.trim(),
      price: Number(price),
      image_url: image_url || null,
      prep_time: prep_time ? Number(prep_time) : 10,
      is_available: is_available !== undefined ? Boolean(is_available) : true,
      category: category.trim(),
      is_veg: Boolean(is_veg),
    });

    await newItem.save();

    await AuditLog.create({
      user_id: req.user ? req.user.id : null,
      event_type: 'MENU_CREATE',
      action: `Created menu item: ${newItem.name}`,
      resource_type: 'menu_item',
      resource_id: newItem.id,
      metadata: { name: newItem.name, price: newItem.price },
    });

    return res.status(201).json(newItem);
  } catch (error) {
    console.error('createMenuItem error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function updateMenuItem(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date() };

    delete updates._id;
    delete updates.id;

    const item = await MenuItem.findOneAndUpdate({ id }, { $set: updates }, { new: true });
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await AuditLog.create({
      user_id: req.user ? req.user.id : null,
      event_type: 'MENU_UPDATE',
      action: `Updated menu item: ${item.name}`,
      resource_type: 'menu_item',
      resource_id: item.id,
      metadata: updates,
    });

    return res.json(item);
  } catch (error) {
    console.error('updateMenuItem error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteMenuItem(req, res) {
  try {
    const { id } = req.params;
    const item = await MenuItem.findOneAndDelete({ id });

    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    await AuditLog.create({
      user_id: req.user ? req.user.id : null,
      event_type: 'MENU_DELETE',
      action: `Deleted menu item: ${item.name}`,
      resource_type: 'menu_item',
      resource_id: item.id,
    });

    return res.json({ message: 'Menu item deleted successfully', id });
  } catch (error) {
    console.error('deleteMenuItem error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function uploadImage(req, res) {
  try {
    const { data, fileName } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Save image to public/uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = fileName ? path.extname(fileName) : '.jpg';
    const cleanFileName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext || '.jpg'}`;
    const filePath = path.join(uploadDir, cleanFileName);

    // If data is base64
    const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const publicUrl = `/uploads/${cleanFileName}`;
    return res.json({ publicUrl, filePath: publicUrl });
  } catch (error) {
    console.error('uploadImage error:', error);
    return res.status(500).json({ error: error.message });
  }
}
