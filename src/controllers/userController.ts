import { Request, Response } from 'express';
import { db } from '../db';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.enum(['VIEWER', 'ANALYST']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const parsed = updateUserSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.format() });
    }

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deactivating an Admin user
    if (targetUser.role === 'ADMIN' && parsed.data.status === 'INACTIVE') {
      return res.status(403).json({ error: 'Action forbidden: Admin users cannot be deactivated.' });
    }

    const user = await db.user.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
