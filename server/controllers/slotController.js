import crypto from 'crypto';
import { TimeSlot } from '../models/TimeSlot.js';

export async function getTimeSlots(req, res) {
  try {
    const { activeOnly, date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const filter = { slot_date: targetDate };
    if (activeOnly === 'true') {
      filter.is_active = true;
    }

    let slots = await TimeSlot.find(filter).sort({ start_time: 1 });

    // If no slots exist for today's date, let's auto-generate default slots for today so students can immediately test and place orders!
    if (slots.length === 0) {
      const defaultSlots = [
        { start_time: '10:00:00', end_time: '11:00:00', max_orders: 50, slot_date: targetDate },
        { start_time: '11:00:00', end_time: '12:00:00', max_orders: 50, slot_date: targetDate },
        { start_time: '12:00:00', end_time: '13:00:00', max_orders: 100, slot_date: targetDate },
        { start_time: '13:00:00', end_time: '14:00:00', max_orders: 100, slot_date: targetDate },
        { start_time: '14:00:00', end_time: '15:00:00', max_orders: 50, slot_date: targetDate },
        { start_time: '15:00:00', end_time: '16:00:00', max_orders: 50, slot_date: targetDate },
        { start_time: '16:00:00', end_time: '17:00:00', max_orders: 50, slot_date: targetDate },
        { start_time: '17:00:00', end_time: '18:00:00', max_orders: 50, slot_date: targetDate },
      ];

      for (const s of defaultSlots) {
        await TimeSlot.create({
          id: crypto.randomUUID(),
          ...s,
          current_orders: 0,
          is_active: true,
        });
      }

      slots = await TimeSlot.find(filter).sort({ start_time: 1 });
    }

    return res.json(slots);
  } catch (error) {
    console.error('getTimeSlots error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function createTimeSlot(req, res) {
  try {
    const { start_time, end_time, max_orders, slot_date, is_active } = req.body;
    const targetDate = slot_date || new Date().toISOString().split('T')[0];

    const newSlot = new TimeSlot({
      id: crypto.randomUUID(),
      start_time,
      end_time,
      max_orders: max_orders ? Number(max_orders) : 50,
      current_orders: 0,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      slot_date: targetDate,
    });

    await newSlot.save();
    return res.status(201).json(newSlot);
  } catch (error) {
    console.error('createTimeSlot error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function updateTimeSlot(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date() };
    delete updates._id;
    delete updates.id;

    const slot = await TimeSlot.findOneAndUpdate({ id }, { $set: updates }, { new: true });
    if (!slot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    return res.json(slot);
  } catch (error) {
    console.error('updateTimeSlot error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function deleteTimeSlot(req, res) {
  try {
    const { id } = req.params;
    const slot = await TimeSlot.findOneAndDelete({ id });
    if (!slot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    return res.json({ message: 'Time slot deleted successfully', id });
  } catch (error) {
    console.error('deleteTimeSlot error:', error);
    return res.status(500).json({ error: error.message });
  }
}
