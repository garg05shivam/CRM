import bcrypt from "bcrypt";
import { pool } from "../pool.js";

const SALT_ROUNDS = 12;

const users = [
  {
    name: "System Admin",
    email: "admin@crm.local",
    password: "Admin@12345",
    role: "ADMIN",
  },
  {
    name: "Sales User",
    email: "sales@crm.local",
    password: "Sales@12345",
    role: "SALES",
  },
  {
    name: "Warehouse User",
    email: "warehouse@crm.local",
    password: "Warehouse@12345",
    role: "WAREHOUSE",
  },
  {
    name: "Accounts User",
    email: "accounts@crm.local",
    password: "Accounts@12345",
    role: "ACCOUNTS",
  },
] as const;

const seedUsers = async (): Promise<void> => {
  try {
    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);

      await pool.query(
        `
          INSERT INTO users (
            name,
            email,
            password_hash,
            role
          )
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (email)
          DO UPDATE SET
            name = EXCLUDED.name,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            is_active = TRUE,
            updated_at = NOW()
        `,
        [
          user.name,
          user.email,
          passwordHash,
          user.role,
        ],
      );
    }

    console.log("Development users seeded successfully.");
  } catch (error) {
    console.error("Failed to seed development users:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

await seedUsers();