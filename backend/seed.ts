import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "admin@admin.com";
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Admin";

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log(`Ya existe un usuario con email ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashed, name, role: "admin" },
  });

  console.log(`Admin creado: ${user.email} (${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
