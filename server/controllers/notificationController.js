import crypto from 'crypto';
import { PushSubscription } from '../models/PushSubscription.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';

// VAPID keys for push notifications
const MOCK_VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgD zk8zL0T99k9iYwU303c7W1uXn0Q2Zc74';

export async function sendSmsNotification(req, res) {
  try {
    const { orderId, status } = req.body;
    console.log(`[SMS Notification] Order ${orderId} is now ${status}`);

    const order = await Order.findOne({ id: orderId });
    if (order) {
      const user = await User.findOne({ id: order.user_id });
      if (user && user.phone) {
        console.log(`[SMS Sent] To: ${user.phone} -> "Your CampusBite Order #${order.token_number} is now ${status}!"`);
      }
    }

    await AuditLog.create({
      event_type: 'NOTIFICATION_SMS',
      action: `SMS triggered for order ${orderId} (${status})`,
      resource_type: 'order',
      resource_id: orderId,
    });

    return res.json({ success: true, message: 'SMS notification processed' });
  } catch (error) {
    console.error('sendSmsNotification error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function sendEmailNotification(req, res) {
  try {
    const { orderId, status } = req.body;
    console.log(`[Email Notification] Order ${orderId} status: ${status}`);

    const order = await Order.findOne({ id: orderId });
    if (order) {
      const user = await User.findOne({ id: order.user_id });
      if (user && user.email) {
        console.log(`[Email Sent] To: ${user.email} -> "Your CampusBite Order #${order.token_number} is ${status}!"`);
      }
    }

    await AuditLog.create({
      event_type: 'NOTIFICATION_EMAIL',
      action: `Email triggered for order ${orderId} (${status})`,
      resource_type: 'order',
      resource_id: orderId,
    });

    return res.json({ success: true, message: 'Email notification processed' });
  } catch (error) {
    console.error('sendEmailNotification error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function sendPushNotification(req, res) {
  try {
    const { action, userId, orderId, title, body } = req.body;

    if (action === 'get-vapid-key') {
      return res.json({ vapidPublicKey: MOCK_VAPID_PUBLIC_KEY });
    }

    console.log(`[Push Notification] User: ${userId}, Order: ${orderId}, Title: ${title}`);

    await AuditLog.create({
      user_id: userId,
      event_type: 'NOTIFICATION_PUSH',
      action: `Push notification sent to user ${userId}`,
      resource_type: 'order',
      resource_id: orderId,
    });

    return res.json({ success: true, message: 'Push notification queued' });
  } catch (error) {
    console.error('sendPushNotification error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function savePushSubscription(req, res) {
  try {
    const { user_id, endpoint, p256dh, auth } = req.body;
    if (!user_id || !endpoint || !p256dh || !auth) {
      return res.status(400).json({ error: 'Missing required subscription fields' });
    }

    const sub = await PushSubscription.findOneAndUpdate(
      { user_id, endpoint },
      {
        $set: { p256dh, auth, created_at: new Date() },
        $setOnInsert: { id: crypto.randomUUID() },
      },
      { new: true, upsert: true }
    );

    return res.json(sub);
  } catch (error) {
    console.error('savePushSubscription error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function deletePushSubscription(req, res) {
  try {
    const { user_id, endpoint } = req.body;
    await PushSubscription.findOneAndDelete({ user_id, endpoint });
    return res.json({ success: true });
  } catch (error) {
    console.error('deletePushSubscription error:', error);
    return res.status(500).json({ error: error.message });
  }
}
