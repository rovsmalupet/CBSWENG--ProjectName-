#!/usr/bin/env node
/**
 * Helper script to generate international accounts migration with proper bcrypt hashes
 * Run this script to generate the migration file with correct password hashes
 *
 * Usage: node generate-migration.js
 */

import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SALT_ROUNDS = 10;

// Sample org + donor per ASEAN member state (must match ASEANCountry enum in schema.prisma)
const accountsData = [
  {
    country: "Brunei",
    orgName: "Community Care Brunei",
    orgFirstName: "Haji",
    orgSurname: "Rahman",
    donorFirstName: "Siti",
    donorLastName: "Yusof",
    donorAffiliation: "Bandar Seri Begawan Foundation",
    shorthand: "bn",
    bio: "Bruneian organization supporting education, health, and community welfare initiatives across the nation.",
  },
  {
    country: "Cambodia",
    orgName: "Khmer Development Initiative",
    orgFirstName: "Sokha",
    orgSurname: "Chea",
    donorFirstName: "Vannak",
    donorLastName: "Lim",
    donorAffiliation: "Phnom Penh Social Trust",
    shorthand: "kh",
    bio: "Cambodian NGO focused on rural livelihoods, clean water, and youth skills training.",
  },
  {
    country: "Indonesia",
    orgName: "Maju Bersama Indonesia",
    orgFirstName: "Budi",
    orgSurname: "Santoso",
    donorFirstName: "Dewi",
    donorLastName: "Kusuma",
    donorAffiliation: "Jakarta Impact Collective",
    shorthand: "id",
    bio: "Indonesian organization working on disaster resilience, education, and sustainable agriculture.",
  },
  {
    country: "Laos",
    orgName: "Lao Community Partners",
    orgFirstName: "Kham",
    orgSurname: "Vongsa",
    donorFirstName: "Noy",
    donorLastName: "Phimmasone",
    donorAffiliation: "Vientiane Development Circle",
    shorthand: "la",
    bio: "Lao civil society group supporting rural health, nutrition, and smallholder farming programs.",
  },
  {
    country: "Malaysia",
    orgName: "Harapan Malaysia",
    orgFirstName: "Aisha",
    orgSurname: "Razak",
    donorFirstName: "Wei",
    donorLastName: "Tan",
    donorAffiliation: "Kuala Lumpur Giving Network",
    shorthand: "my",
    bio: "Malaysian organization advancing inclusive education and urban poverty reduction.",
  },
  {
    country: "Myanmar",
    orgName: "Golden Land Relief",
    orgFirstName: "Kyaw",
    orgSurname: "Min",
    donorFirstName: "Thida",
    donorLastName: "Aung",
    donorAffiliation: "Yangon Humanitarian Alliance",
    shorthand: "mm",
    bio: "Myanmar-based initiative focused on humanitarian relief and community-led recovery.",
  },
  {
    country: "Philippines",
    orgName: "Bayanihan Projects PH",
    orgFirstName: "Maria",
    orgSurname: "Reyes",
    donorFirstName: "Juan",
    donorLastName: "Dela Cruz",
    donorAffiliation: "Manila Bay Community Fund",
    shorthand: "ph",
    bio: "Philippine organization supporting coastal communities, livelihoods, and disaster preparedness.",
  },
  {
    country: "Singapore",
    orgName: "Lion City Impact",
    orgFirstName: "Wei",
    orgSurname: "Lim",
    donorFirstName: "Priya",
    donorLastName: "Sharma",
    donorAffiliation: "Singapore Giving Hub",
    shorthand: "sg",
    bio: "Singapore-based organization funding regional development and cross-border partnerships.",
  },
  {
    country: "Thailand",
    orgName: "Siam Community Trust",
    orgFirstName: "Nattaya",
    orgSurname: "Srisai",
    donorFirstName: "Somchai",
    donorLastName: "Prasert",
    donorAffiliation: "Bangkok Social Impact Lab",
    shorthand: "th",
    bio: "Thai NGO working on health access, education, and rural infrastructure development.",
  },
  {
    country: "Vietnam",
    orgName: "Viet Solidarity Network",
    orgFirstName: "Lan",
    orgSurname: "Nguyen",
    donorFirstName: "Minh",
    donorLastName: "Tran",
    donorAffiliation: "Ho Chi Minh City Development Fund",
    shorthand: "vn",
    bio: "Vietnamese organization supporting climate-smart agriculture and community health.",
  },
];

async function generateMigration() {
  console.log("🔐 Generating bcrypt hashes for passwords...\n");

  let migrationSql = `-- Migration: Add ASEAN sample Organization and Donor accounts
-- One verified org + one verified donor per ASEAN member state (ASEANCountry enum)
-- Generated with proper bcrypt hashing (SALT_ROUNDS=10)

`;

  for (const account of accountsData) {
    const orgId = randomUUID();
    const donorId = randomUUID();
    const orgPassword = `${account.country}123`;
    const donorPassword = `${account.country}123`;

    const orgPasswordHash = await bcrypt.hash(orgPassword, SALT_ROUNDS);
    const donorPasswordHash = await bcrypt.hash(donorPassword, SALT_ROUNDS);

    console.log(`✓ ${account.country}: Generated hashes`);
    console.log(`  - Password: ${orgPassword}`);
    console.log(`  - Hash: ${orgPasswordHash}\n`);

    // Organization insert (id has no DB default — must supply UUID)
    migrationSql += `-- ${account.country} Organization
INSERT INTO "Organization" ("id", "orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  '${orgId}',
  '${account.orgName.replace(/'/g, "''")}',
  '${account.orgFirstName.replace(/'/g, "''")}',
  '${account.orgSurname.replace(/'/g, "''")}',
  '${account.country.toLowerCase()}@gov.org.${account.shorthand}',
  '${orgPasswordHash}',
  '${account.country}',
  '${account.bio.replace(/'/g, "''")}',
  true,
  'Approved',
  NOW()
);

-- ${account.country} Donor
INSERT INTO "Donor" ("id", "firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  '${donorId}',
  '${account.donorFirstName.replace(/'/g, "''")}',
  '${account.donorLastName.replace(/'/g, "''")}',
  '${account.country.toLowerCase()}.donor@gov.org.${account.shorthand}',
  '${donorPasswordHash}',
  '${account.country}',
  '${account.donorAffiliation.replace(/'/g, "''")}',
  true,
  'Approved',
  NOW()
);

`;
  }

  // Write to migration file
  const migrationDir = path.join(
    __dirname,
    "prisma",
    "migrations",
    "20260405_add_international_accounts",
  );
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }

  const migrationFile = path.join(migrationDir, "migration.sql");
  fs.writeFileSync(migrationFile, migrationSql);

  console.log(`\n✅ Migration file generated successfully!`);
  console.log(`📁 Location: ${migrationFile}\n`);
  console.log("📝 Next steps:");
  console.log("   1. npx prisma migrate deploy");
  console.log("   2. npx prisma generate\n");
}

generateMigration().catch((err) => {
  console.error("❌ Error generating migration:", err);
  process.exit(1);
});
