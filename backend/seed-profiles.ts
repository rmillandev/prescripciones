import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: { in: ["doctor", "patient"] } },
  });

  let created = 0;

  for (const user of users) {
    if (user.role === "doctor") {
      const existing = await prisma.doctor.findUnique({ where: { userId: user.id } });
      if (!existing) {
        await prisma.doctor.create({ data: { userId: user.id } });
        console.log(`Perfil doctor creado para: ${user.email}`);
        created++;
      }
    }
    if (user.role === "patient") {
      const existing = await prisma.patient.findUnique({ where: { userId: user.id } });
      if (!existing) {
        await prisma.patient.create({ data: { userId: user.id } });
        console.log(`Perfil paciente creado para: ${user.email}`);
        created++;
      }
    }
  }

  console.log(created === 0 ? "No habia perfiles pendientes." : `Perfiles creados: ${created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
