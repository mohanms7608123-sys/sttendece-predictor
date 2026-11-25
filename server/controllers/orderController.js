import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { MenuItem } from '../models/MenuItem.js';
import { TimeSlot } from '../models/TimeSlot.js';
import { User } from '../models/User.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { AuditLog } from '../models/AuditLog.js';
import { broadcastOrderCreated, broadcastOrderUpdated } from '../socket.js';

export async function getNextToken() {
  const today = new Date().toISOString().split('T')[0];

  let resetDateDoc = await SystemSetting.findOne({ key: 'last_token_reset_date' });
  let counterDoc = await SystemSetting.findOne({ key: 'daily_token_counter' });

  if (!resetDateDoc) {
    resetDateDoc = await SystemSetting.create({ key: 'last_token_reset_date', value: today });
  }

  if (!counterDoc) {
    counterDoc = await SystemSetting.create({ key: 'daily_token_counter', value: '0' });
  }

  let nextToken = 1;
  if (resetDateDoc.value !== today) {
    resetDateDoc.value = today;
    resetDateDoc.updated_at = new Date();
    await resetDateDoc.save();

    counterDoc.value = '1';
    counterDoc.updated_at = new Date();
    await counterDoc.save();
    nextToken = 1;
  } else {
    nextToken = (parseInt(counterDoc.value, 10) || 0) + 1;
    counterDoc.value = nextToken.toString();
    counterDoc.updated_at = new Date();
    await counterDoc.save();
  }

  return nextToken;
}

export async function createOrder(req, res) {
  try {
    const { userId, timeSlotId, items, totalAmount, notes } = req.body;

    if (!userId || !timeSlotId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required order fields or items' });
    }

    const tokenNumber = await getNextToken();
    const orderId = crypto.randomUUID();

    const order = new Order({
      id: orderId,
      user_id: userId,
      token_number: tokenNumber,
      time_slot_id: timeSlotId,
      total_amount: Number(totalAmount),
      status: 'placed',
      notes: notes || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await order.save();

    // Create order items
    const orderItemDocs = [];
    for (const item of items) {
      const orderItem = new OrderItem({
        id: crypto.randomUUID(),
        order_id: orderId,
        menu_item_id: item.menuItem ? item.menuItem.id : item.menu_item_id,
        quantity: item.quantity,
        price_at_time: item.menuItem ? item.menuItem.price : item.price_at_time,
        created_at: new Date(),
      });
      await orderItem.save();
      orderItemDocs.push(orderItem);
    }

    // Increment current_orders in time_slot
    await TimeSlot.findOneAndUpdate(
      { id: timeSlotId },
      { $inc: { current_orders: 1 } }
    );

    // Populate order with full details for Socket.IO and response
    const fullOrder = await getPopulatedOrder(orderId);

    // Broadcast real-time Socket.IO notification to KDS / dashboard
    broadcastOrderCreated(fullOrder);

    // Audit log
    await AuditLog.create({
      user_id: userId,
      event_type: 'ORDER_CREATE',
      action: `Order #${tokenNumber} placed`,
      resource_type: 'order',
      resource_id: orderId,
      metadata: { token_number: tokenNumber, total_amount: totalAmount, items_count: items.length },
    });

    return res.status(201).json(fullOrder);
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getStudentOrders(req, res) {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user_id: userId }).sort({ created_at: -1 });

    const populatedOrders = await Promise.all(orders.map((o) => getPopulatedOrder(o.id)));
    return res.json(populatedOrders);
  } catch (error) {
    console.error('getStudentOrders error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getCanteenOrders(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(today);

    // Fetch orders from today onwards
    const orders = await Order.find({
      created_at: { $gte: startOfDay },
    }).sort({ created_at: -1 });

    const populatedOrders = await Promise.all(orders.map((o) => getPopulatedOrder(o.id)));
    return res.json(populatedOrders);
  } catch (error) {
    console.error('getCanteenOrders error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await getPopulatedOrder(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json(order);
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['placed', 'accepted', 'preparing', 'ready', 'collected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findOneAndUpdate(
      { id },
      { $set: { status, updated_at: new Date() } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const fullOrder = await getPopulatedOrder(id);

    // Broadcast real-time Socket.IO notification to KDS / student dashboard
    broadcastOrderUpdated(fullOrder);

    // Audit log
    await AuditLog.create({
      user_id: req.user ? req.user.id : null,
      event_type: 'ORDER_STATUS_UPDATE',
      action: `Order #${order.token_number} status updated to ${status}`,
      resource_type: 'order',
      resource_id: id,
      metadata: { status },
    });

    return res.json(fullOrder);
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Helper function to build full OrderWithDetails structure
async function getPopulatedOrder(orderId) {
  const orderDoc = await Order.findOne({ id: orderId });
  if (!orderDoc) return null;

  const order = orderDoc.toJSON();

  // Time slot
  const timeSlot = await TimeSlot.findOne({ id: order.time_slot_id });
  order.time_slot = timeSlot ? timeSlot.toJSON() : null;

  // Order items
  const items = await OrderItem.find({ order_id: orderId });
  const populatedItems = await Promise.all(
    items.map(async (itemDoc) => {
      const item = itemDoc.toJSON();
      const menuItem = await MenuItem.findOne({ id: item.menu_item_id });
      item.menu_item = menuItem ? menuItem.toJSON() : null;
      return item;
    })
  );
  order.order_items = populatedItems;

  // User profile
  const user = await User.findOne({ id: order.user_id });
  if (user) {
    order.profiles = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      usn: user.usn,
    };
    order.profile = order.profiles;
  }

  return order;
}
