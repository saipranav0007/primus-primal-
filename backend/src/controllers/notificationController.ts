import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const { limit = 25 } = req.query;
    const logs = await prisma.activityLog.findMany({
      take: Number(limit),
      orderBy: { timestamp: 'desc' },
    });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
