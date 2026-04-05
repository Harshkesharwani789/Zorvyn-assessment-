import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { db } from './db';
import bcrypt from 'bcrypt';

const port = process.env.PORT || 3000;

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  try {
    const existingAdmin = await db.user.findFirst({ where: { role: 'ADMIN' } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.user.create({
        data: {
          name: 'System Admin',
          email,
          password: hashedPassword,
          role: 'ADMIN',
        }
      });
      console.log(`[Seed] Default admin created: ${email} / ${password}`);
    } else {
      console.log(`[Seed] Admin already exists.`);
    }
  } catch (error) {
    console.error(`[Seed] Error creating admin:`, error);
  }
};

app.listen(port, async () => {
  await seedAdmin();
  console.log(`Server is running on port ${port}`);
});
