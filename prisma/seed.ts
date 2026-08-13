import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Supabase Postgres Database: 2 Factories & 1 Global Super Admin...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Global Super Admin User
  await prisma.user.upsert({
    where: { email: "superadmin@dks-erp.com" },
    update: {
      name: "DKS SaaS Super Admin",
      passwordHash,
      role: Role.GLOBAL_SUPER_ADMIN,
      isSuperAdmin: true,
      phone: "+91 99999 00000"
    },
    create: {
      email: "superadmin@dks-erp.com",
      name: "DKS SaaS Super Admin",
      passwordHash,
      role: Role.GLOBAL_SUPER_ADMIN,
      isSuperAdmin: true,
      phone: "+91 99999 00000"
    }
  });

  // 2. Factory 1: Dhandai Textiles
  const dhandai = await prisma.tenant.upsert({
    where: { slug: "dhandai-textiles" },
    update: {
      name: "Dhandai Textiles",
      logo: "🏭",
      tagline: "24x7 Cotton Powerloom & Airjet Weaving Mill",
      cluster: "Ichalkaranji, Maharashtra",
      plan: "Enterprise",
      status: "Active",
      ownerName: "Bhushan Khairnar",
      email: "bhushan.dks@gmail.com",
      phone: "+91 98230 11223",
      gstNumber: "27AAIPK1234F1Z5",
      panNumber: "AAIPK1234F",
      addressLine1: "Plot No. 18, MIDC Industrial Zone",
      city: "Ichalkaranji",
      state: "Maharashtra",
      pincode: "416115"
    },
    create: {
      name: "Dhandai Textiles",
      slug: "dhandai-textiles",
      logo: "🏭",
      tagline: "24x7 Cotton Powerloom & Airjet Weaving Mill",
      cluster: "Ichalkaranji, Maharashtra",
      plan: "Enterprise",
      status: "Active",
      ownerName: "Bhushan Khairnar",
      email: "bhushan.dks@gmail.com",
      phone: "+91 98230 11223",
      gstNumber: "27AAIPK1234F1Z5",
      panNumber: "AAIPK1234F",
      addressLine1: "Plot No. 18, MIDC Industrial Zone",
      city: "Ichalkaranji",
      state: "Maharashtra",
      pincode: "416115"
    }
  });

  await prisma.user.upsert({
    where: { email: "bhushan.dks@gmail.com" },
    update: { tenantId: dhandai.id, role: Role.BUSINESS_OWNER, name: "Bhushan Khairnar" },
    create: {
      tenantId: dhandai.id,
      email: "bhushan.dks@gmail.com",
      name: "Bhushan Khairnar",
      passwordHash,
      role: Role.BUSINESS_OWNER,
      phone: "+91 98230 11223"
    }
  });

  // 3. Factory 2: Lalit Textiles & Weaving
  const lalit = await prisma.tenant.upsert({
    where: { slug: "lalit-textiles" },
    update: {
      name: "Lalit Textiles & Weaving",
      logo: "🧵",
      tagline: "High-Speed Rapier & Airjet Cotton Mill",
      cluster: "Ichalkaranji, Maharashtra",
      plan: "Pro",
      status: "Active",
      ownerName: "Lalit Patil",
      email: "owner@lalittextiles.com",
      phone: "+91 99220 88990",
      gstNumber: "27AABCL5678L1ZP",
      panNumber: "AABCL5678L",
      addressLine1: "Plot No. 45, Powerloom Park",
      city: "Ichalkaranji",
      state: "Maharashtra",
      pincode: "416115"
    },
    create: {
      name: "Lalit Textiles & Weaving",
      slug: "lalit-textiles",
      logo: "🧵",
      tagline: "High-Speed Rapier & Airjet Cotton Mill",
      cluster: "Ichalkaranji, Maharashtra",
      plan: "Pro",
      status: "Active",
      ownerName: "Lalit Patil",
      email: "owner@lalittextiles.com",
      phone: "+91 99220 88990",
      gstNumber: "27AABCL5678L1ZP",
      panNumber: "AABCL5678L",
      addressLine1: "Plot No. 45, Powerloom Park",
      city: "Ichalkaranji",
      state: "Maharashtra",
      pincode: "416115"
    }
  });

  await prisma.user.upsert({
    where: { email: "owner@lalittextiles.com" },
    update: { tenantId: lalit.id, role: Role.BUSINESS_OWNER, name: "Lalit Patil" },
    create: {
      tenantId: lalit.id,
      email: "owner@lalittextiles.com",
      name: "Lalit Patil",
      passwordHash,
      role: Role.BUSINESS_OWNER,
      phone: "+91 99220 88990"
    }
  });

  console.log("Database successfully seeded: 2 Factories (Dhandai Textiles, Lalit Textiles) & 1 Global Super Admin!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


