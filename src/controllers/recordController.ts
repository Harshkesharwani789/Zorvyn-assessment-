import { Response } from 'express';
import { db } from '../db';
import { createRecordSchema, updateRecordSchema } from '../utils/validation';
import { AuthRequest } from '../middleware/auth';

export const createRecord = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.format() });
    }

    const record = await db.record.create({
      data: {
        ...parsed.data,
        date: new Date(parsed.data.date),
        createdById: req.user!.userId,
      }
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getRecords = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const cursor = req.query.cursor as string | undefined;

    const where: any = {};
    if (req.query.type) where.type = req.query.type as string;
    if (req.query.category) where.category = req.query.category as string;
    if (req.query.startDate || req.query.endDate) {
      where.date = {};
      if (req.query.startDate) {
        const d = new Date(req.query.startDate as string);
        if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid startDate format' });
        where.date.gte = d;
      }
      if (req.query.endDate) {
        const d = new Date(req.query.endDate as string);
        if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid endDate format' });
        where.date.lte = d;
      }
    }

    const queryOptions: any = {
      where,
      take: limit,
      orderBy: { id: 'desc' }, // Usually order by ID or createdAt for cursor pagination stability
    };

    // If cursor is provided, we use cursor-based pagination
    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1; // skip the cursor itself
    } else {
      // Otherwise, we fallback to offset-based pagination
      queryOptions.skip = (page - 1) * limit;
    }

    const records = await db.record.findMany(queryOptions);

    const total = await db.record.count({ where });

    // Determine the next cursor if we retrieved items via cursor strategy
    const nextCursor = records.length === limit ? records[records.length - 1].id : null;

    res.json({
      data: records,
      meta: {
        total,
        page,
        limit,
        nextCursor
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getRecordById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const record = await db.record.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateRecord = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const parsed = updateRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation Error', details: parsed.error.format() });
    }

    const data: any = { ...parsed.data };
    if (data.date) {
      data.date = new Date(data.date);
    }

    const record = await db.record.update({
      where: { id },
      data
    });
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteRecord = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await db.record.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const d = new Date(startDate as string);
        if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid startDate format' });
        where.date.gte = d;
      }
      if (endDate) {
        const d = new Date(endDate as string);
        if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid endDate format' });
        where.date.lte = d;
      }
    }

    const records = await db.record.findMany({ where });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals: Record<string, number> = {};

    records.forEach(record => {
      if (record.type === 'INCOME') {
        totalIncome += record.amount;
      } else if (record.type === 'EXPENSE') {
        totalExpense += record.amount;
      }

      if (!categoryTotals[record.category]) {
        categoryTotals[record.category] = 0;
      }
      if (record.type === 'EXPENSE') {
        categoryTotals[record.category] += record.amount; // Or separate by type
      }
    });

    const recentActivity = await db.record.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 5
    });

    res.json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      categoryExpenseTotals: categoryTotals,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
