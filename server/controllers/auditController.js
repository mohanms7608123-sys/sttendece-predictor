import { AuditLog } from '../models/AuditLog.js';

export async function getAuditLogs(req, res) {
  try {
    const { eventType, status, startDate, endDate, search } = req.query;
    const filter = {};

    if (eventType && eventType !== 'all') {
      filter.event_type = eventType;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) {
        filter.created_at.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.created_at.$lte = end;
      }
    }

    let logs = await AuditLog.find(filter).sort({ created_at: -1 }).limit(500);

    if (search) {
      const searchLower = search.toLowerCase();
      logs = logs.filter(
        (log) =>
          (log.action && log.action.toLowerCase().includes(searchLower)) ||
          (log.event_type && log.event_type.toLowerCase().includes(searchLower)) ||
          (log.resource_type && log.resource_type.toLowerCase().includes(searchLower)) ||
          (log.resource_id && log.resource_id.toLowerCase().includes(searchLower))
      );
    }

    return res.json(logs);
  } catch (error) {
    console.error('getAuditLogs error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getAuditLogEventTypes(req, res) {
  try {
    const types = await AuditLog.distinct('event_type');
    return res.json(types.sort());
  } catch (error) {
    console.error('getAuditLogEventTypes error:', error);
    return res.status(500).json({ error: error.message });
  }
}
