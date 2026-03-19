import prisma from "./client.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function main() {

  // ── Organization ──────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { email: "mary.angela@redcross.ph" },
    update: {
      isVerified: true,
      status: "Approved",
    },
    create: {
      orgName: "Philippine Red Cross",
      firstName: "Mary Angela",
      surname: "Cruz",
      email: "mary.angela@redcross.ph",
      password: await bcrypt.hash("redcross123", SALT_ROUNDS),
      country: "Philippines",
      isVerified: true,
      status: "Approved",
    },
  });
  console.log("Seeded organization:", org.orgName);

  // ── Admin ─────────────────────────────────────────────────────────────────
  const admin = await prisma.admin.upsert({
    where: { email: "admin@bayanihub.local" },
    update: {},
    create: {
      firstName: "System",
      lastName: "Admin",
      email: "admin@bayanihub.local",
      password: await bcrypt.hash("admin123", SALT_ROUNDS),
    },
  });
  console.log("Seeded admin:", admin.email);

  // ── Donor ─────────────────────────────────────────────────────────────────
  const donor = await prisma.donor.upsert({
    where: { email: "donor@bayanihub.local" },
    update: {},
    create: {
      firstName: "Demo",
      lastName: "Donor",
      email: "donor@bayanihub.local",
      password: await bcrypt.hash("donor123", SALT_ROUNDS),
      country: "Philippines",
      isVerified: true,
      status: "Approved",
    },
  });
  console.log("Seeded donor:", donor.email);

  // ── Posts ─────────────────────────────────────────────────────────────────

  // Project 1 — Monetary + Volunteer + InKind
  const project1 = await prisma.post.create({
    data: {
      projectName: "Community Medical Mission",
      description: "Free medical checkup and health awareness campaign for the community",
      causes: ["goodHealth", "sustainableCities"],
      location: "Manila",
      priority: "High",
      overallStatus: "Approved",
      orgId: org.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 50000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 20, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "Medical Supplies", targetQuantity: 100, unit: "boxes" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 1:", project1.projectName);

  // Project 2 — Monetary + InKind, with dates
  const project2 = await prisma.post.create({
    data: {
      projectName: "Batangas Typhoon Support Donation Drive",
      description: "Donate any monetary amount, food, and clothing for the victims of the Batangas Typhoon",
      causes: ["sustainableCities", "noPoverty"],
      location: "Batangas",
      priority: "High",
      overallStatus: "Approved",
      startDate: new Date("2026-03-23"),
      endDate: new Date("2026-03-28"),
      orgId: org.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 50000, currentAmount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "Biogesic", targetQuantity: 500, unit: "pills" },
          { itemName: "150g Canned Tuna", targetQuantity: 250, unit: "pieces" },
          { itemName: "Instant Cup Noodles", targetQuantity: 250, unit: "pieces" },
          { itemName: "1kg Rice", targetQuantity: 250, unit: "bags" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 2:", project2.projectName);

  // Project 3 — Monetary only, Pending status
  const project3 = await prisma.post.create({
    data: {
      projectName: "Clean Water Initiative",
      description: "Building water wells in rural areas",
      causes: ["cleanWater", "sustainableCities"],
      location: "Mindanao",
      priority: "Medium",
      overallStatus: "Pending",
      orgId: org.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 75000, currentAmount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 3:", project3.projectName);

  // Project 4 — Volunteer only, Edited status
  const project4 = await prisma.post.create({
    data: {
      projectName: "Batangas Typhoon Support Day 1",
      description: "Help us bag our donated materials and deliver them to the victims",
      causes: ["sustainableCities", "noPoverty"],
      location: "Batangas",
      priority: "High",
      overallStatus: "Edited",
      orgId: org.id,
      supportOptions: {
        create: [
          { type: "Volunteer", targetCount: 50, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 4:", project4.projectName);

  // Project 5 — InKind only, Unapproved status
  const project5 = await prisma.post.create({
    data: {
      projectName: "Donate-A-Book",
      description: "Help us collect 300 children's books to be given away during Paaralang Elementarya's back to school program.",
      causes: ["qualityEducation"],
      location: "Quezon City",
      priority: "High",
      overallStatus: "Unapproved",
      orgId: org.id,
      inKindItems: {
        create: [
          { itemName: "Children's Book", targetQuantity: 300, unit: "pieces" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 5:", project5.projectName);

  console.log("\nSeed complete.");
  console.log("Login credentials:");
  console.log("  Admin:  admin@bayanihub.local / admin123");
  console.log("  Donor:  donor@bayanihub.local / donor123");
  console.log("  NGO:    mary.angela@redcross.ph / redcross123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });