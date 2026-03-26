import prisma from "./client.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function main() {
  // ── Organizations ─────────────────────────────────────────────────────────
  const org1 = await prisma.organization.upsert({
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
  console.log("Seeded organization 1:", org1.orgName);

  const org2 = await prisma.organization.upsert({
    where: { email: "juan.santos@actionaid.ph" },
    update: {
      isVerified: true,
      status: "Approved",
    },
    create: {
      orgName: "Action Aid Philippines",
      firstName: "Juan",
      surname: "Santos",
      email: "juan.santos@actionaid.ph",
      password: await bcrypt.hash("actionaid456", SALT_ROUNDS),
      country: "Philippines",
      isVerified: true,
      status: "Approved",
    },
  });
  console.log("Seeded organization 2:", org2.orgName);

  const org3 = await prisma.organization.upsert({
    where: { email: "rosa.garcia@greenearth.ph" },
    update: {
      isVerified: true,
      status: "Approved",
    },
    create: {
      orgName: "Green Earth Foundation",
      firstName: "Rosa",
      surname: "Garcia",
      email: "rosa.garcia@greenearth.ph",
      password: await bcrypt.hash("greenearth789", SALT_ROUNDS),
      country: "Philippines",
      isVerified: true,
      status: "Approved",
    },
  });
  console.log("Seeded organization 3:", org3.orgName);

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

  // ── Donors ────────────────────────────────────────────────────────────────
  const donor1 = await prisma.donor.upsert({
    where: { email: "donor@bayanihub.local" },
    update: {},
    create: {
      firstName: "Demo",
      lastName: "Donor",
      email: "donor@bayanihub.local",
      password: await bcrypt.hash("donor123", SALT_ROUNDS),
      country: "Philippines",
      affiliation: "Virtual Champions PH",
      isVerified: true,
      status: "Approved",
    },
  });
  console.log("Seeded donor 1:", donor1.email);

  const donor2 = await prisma.donor.upsert({
    where: { email: "margaret.lim@corporate.com" },
    update: {},
    create: {
      firstName: "Margaret",
      lastName: "Lim",
      email: "margaret.lim@corporate.com",
      password: await bcrypt.hash("margaret2024", SALT_ROUNDS),
      country: "Philippines",
      affiliation: "Tech Solutions Inc",
      isVerified: true,
      status: "Approved",
    },
  });
  console.log("Seeded donor 2:", donor2.email);

  const donor3 = await prisma.donor.upsert({
    where: { email: "carlos.fernandez@philanthropy.org" },
    update: {},
    create: {
      firstName: "Carlos",
      lastName: "Fernandez",
      email: "carlos.fernandez@philanthropy.org",
      password: await bcrypt.hash("carlos5050", SALT_ROUNDS),
      country: "Philippines",
      affiliation: "Global Giving Foundation",
      isVerified: true,
      status: "Approved",
    },
  });
  console.log("Seeded donor 3:", donor3.email);

  const donor4 = await prisma.donor.upsert({
    where: { email: "jessica.teo@nonprofit.sg" },
    update: {},
    create: {
      firstName: "Jessica",
      lastName: "Teo",
      email: "jessica.teo@nonprofit.sg",
      password: await bcrypt.hash("jessica2025", SALT_ROUNDS),
      country: "Singapore",
      affiliation: "ASEAN Community Partners",
      isVerified: true,
      status: "Approved",
    },
  });
  console.log("Seeded donor 4:", donor4.email);

  // ── Posts/Projects ───────────────────────────────────────────────────────

  // ═══════════════════════════════════════════════════════════════════════════
  // ORGANIZATION 1: Philippine Red Cross Projects
  // ═══════════════════════════════════════════════════════════════════════════

  // Project 1.1 — Approved: Monetary + Volunteer + InKind
  const project1_1 = await prisma.post.create({
    data: {
      projectName: "Community Medical Mission",
      description:
        "Free medical checkup and health awareness campaign for the community",
      causes: ["goodHealth", "sustainableCities"],
      location: "Manila",
      priority: "High",
      overallStatus: "Approved",
      orgId: org1.id,
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
  console.log("Seeded project 1.1:", project1_1.projectName);

  // Project 1.2 — Approved: Monetary + InKind with dates
  const project1_2 = await prisma.post.create({
    data: {
      projectName: "Batangas Typhoon Support Donation Drive",
      description:
        "Donate any monetary amount, food, and clothing for the victims of the Batangas Typhoon",
      causes: ["sustainableCities", "noPoverty"],
      location: "Batangas",
      priority: "High",
      overallStatus: "Approved",
      startDate: new Date("2026-03-23"),
      endDate: new Date("2026-03-28"),
      orgId: org1.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 50000, currentAmount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Biogesic", targetQuantity: 500, unit: "pills" },
          { itemName: "150g Canned Tuna", targetQuantity: 250, unit: "pieces" },
          {
            itemName: "Instant Cup Noodles",
            targetQuantity: 250,
            unit: "pieces",
          },
          { itemName: "1kg Rice", targetQuantity: 250, unit: "bags" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 1.2:", project1_2.projectName);

  // Project 1.3 — Pending: Monetary only
  const project1_3 = await prisma.post.create({
    data: {
      projectName: "Clean Water Initiative",
      description: "Building water wells in rural areas",
      causes: ["cleanWater", "sustainableCities"],
      location: "Mindanao",
      priority: "Medium",
      overallStatus: "Pending",
      orgId: org1.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 75000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 1.3:", project1_3.projectName);

  // Project 1.4 — Edited: Volunteer only
  const project1_4 = await prisma.post.create({
    data: {
      projectName: "Batangas Typhoon Support Day 1",
      description:
        "Help us bag our donated materials and deliver them to the victims",
      causes: ["sustainableCities", "noPoverty"],
      location: "Batangas",
      priority: "High",
      overallStatus: "Edited",
      orgId: org1.id,
      supportOptions: {
        create: [{ type: "Volunteer", targetCount: 50, currentCount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 1.4:", project1_4.projectName);

  // Project 1.5 — Unapproved: InKind only
  const project1_5 = await prisma.post.create({
    data: {
      projectName: "Donate-A-Book",
      description:
        "Help us collect 300 children's books to be given away during Paaralang Elementarya's back to school program.",
      causes: ["qualityEducation"],
      location: "Quezon City",
      priority: "High",
      overallStatus: "Unapproved",
      orgId: org1.id,
      inKindItems: {
        create: [
          { itemName: "Children's Book", targetQuantity: 300, unit: "pieces" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 1.5:", project1_5.projectName);

  // Project 1.6 — Approved: Volunteer + InKind
  const project1_6 = await prisma.post.create({
    data: {
      projectName: "Blood Donation Drive 2026",
      description:
        "Encourage safe blood donation to help save lives. We need both donors and volunteers.",
      causes: ["goodHealth"],
      location: "Makati City",
      priority: "High",
      overallStatus: "Approved",
      orgId: org1.id,
      supportOptions: {
        create: [{ type: "Volunteer", targetCount: 30, currentCount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Snacks and Juice", targetQuantity: 200, unit: "packs" },
          { itemName: "Vitamins", targetQuantity: 200, unit: "bottles" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 1.6:", project1_6.projectName);

  // ═══════════════════════════════════════════════════════════════════════════
  // ORGANIZATION 2: Action Aid Philippines Projects
  // ═══════════════════════════════════════════════════════════════════════════

  // Project 2.1 — Approved: Monetary only
  const project2_1 = await prisma.post.create({
    data: {
      projectName: "Rights-Based Education for Underprivileged Children",
      description:
        "Provide quality education and life skills training to 500 underprivileged children in Valenzuela",
      causes: ["qualityEducation", "noPoverty"],
      location: "Valenzuela",
      priority: "High",
      overallStatus: "Approved",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-12-31"),
      orgId: org2.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 100000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 2.1:", project2_1.projectName);

  // Project 2.2 — Approved: Monetary + Volunteer
  const project2_2 = await prisma.post.create({
    data: {
      projectName: "Women Livelihood and Empowerment Program",
      description:
        "Training and microfinance support for 200 women entrepreneurs in Cebu",
      causes: ["noPoverty", "genderEquality"],
      location: "Cebu",
      priority: "High",
      overallStatus: "Approved",
      orgId: org2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 150000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 15, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 2.2:", project2_2.projectName);

  // Project 2.3 — Approved: InKind only
  const project2_3 = await prisma.post.create({
    data: {
      projectName: "School Supply Drive for Rural Communities",
      description:
        "Collect and distribute school supplies to 15 public schools in Bicol region",
      causes: ["qualityEducation"],
      location: "Bicol Region",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: org2.id,
      inKindItems: {
        create: [
          { itemName: "Notebooks", targetQuantity: 5000, unit: "pieces" },
          { itemName: "Ballpens", targetQuantity: 3000, unit: "pieces" },
          { itemName: "Pencils", targetQuantity: 2000, unit: "pieces" },
          { itemName: "Erasers", targetQuantity: 1000, unit: "pieces" },
          { itemName: "Backpacks", targetQuantity: 800, unit: "pieces" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 2.3:", project2_3.projectName);

  // Project 2.4 — Unapproved: Monetary + InKind
  const project2_4 = await prisma.post.create({
    data: {
      projectName: "Nutrition Program for Malnourished Children",
      description:
        "Supplementary feeding program targeting 300 malnourished children in Samar",
      causes: ["goodHealth", "noPoverty"],
      location: "Samar",
      priority: "High",
      overallStatus: "Unapproved",
      orgId: org2.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 80000, currentAmount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Nutritional Milk", targetQuantity: 500, unit: "boxes" },
          {
            itemName: "Fortified Biscuits",
            targetQuantity: 1000,
            unit: "packs",
          },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 2.4:", project2_4.projectName);

  // Project 2.5 — Pending: Monetary + Volunteer + InKind
  const project2_5 = await prisma.post.create({
    data: {
      projectName: "Community Health Workers Training",
      description:
        "Train 100 community health workers to provide basic healthcare in remote villages",
      causes: ["goodHealth", "sustainableCities"],
      location: "Davao Region",
      priority: "Medium",
      overallStatus: "Pending",
      orgId: org2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 120000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 25, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "Medical Kits", targetQuantity: 100, unit: "units" },
          { itemName: "Training Materials", targetQuantity: 100, unit: "sets" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 2.5:", project2_5.projectName);

  // Project 2.6 — Unapproved: Volunteer only
  const project2_6 = await prisma.post.create({
    data: {
      projectName: "Child Rights Advocacy and Protection Campaign",
      description:
        "Community awareness campaign on child rights and protection in Iloilo",
      causes: ["qualityEducation", "noChildAbuse"],
      location: "Iloilo",
      priority: "High",
      overallStatus: "Unapproved",
      orgId: org2.id,
      supportOptions: {
        create: [{ type: "Volunteer", targetCount: 40, currentCount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 2.6:", project2_6.projectName);

  // ═══════════════════════════════════════════════════════════════════════════
  // ORGANIZATION 3: Green Earth Foundation Projects
  // ═══════════════════════════════════════════════════════════════════════════

  // Project 3.1 — Approved: Monetary + Volunteer
  const project3_1 = await prisma.post.create({
    data: {
      projectName: "Mangrove Reforestation Project",
      description:
        "Plant and maintain 10,000 mangrove trees to restore coastal ecosystems",
      causes: ["climateAction", "lifeBelow", "sustainableCities"],
      location: "Laguna Province",
      priority: "High",
      overallStatus: "Approved",
      startDate: new Date("2026-03-15"),
      endDate: new Date("2026-12-15"),
      orgId: org3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 200000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 100, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 3.1:", project3_1.projectName);

  // Project 3.2 — Approved: InKind + Volunteer
  const project3_2 = await prisma.post.create({
    data: {
      projectName: "Zero Waste Community Program",
      description:
        "Implement waste segregation and recycling systems in 5 barangays",
      causes: ["climateAction", "sustainableCities"],
      location: "Cavite Province",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: org3.id,
      supportOptions: {
        create: [{ type: "Volunteer", targetCount: 60, currentCount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Recycling Bins", targetQuantity: 500, unit: "pieces" },
          { itemName: "Compost Bins", targetQuantity: 200, unit: "pieces" },
          {
            itemName: "Educational Materials",
            targetQuantity: 500,
            unit: "sets",
          },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 3.2:", project3_2.projectName);

  // Project 3.3 — Approved: Monetary only
  const project3_3 = await prisma.post.create({
    data: {
      projectName: "Community Solar Energy Initiative",
      description: "Install solar panels in 20 barangay health centers",
      causes: ["cleenEnergy", "sustainableCities", "affordableEnergy"],
      location: "Nueva Ecija",
      priority: "High",
      overallStatus: "Approved",
      orgId: org3.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 500000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 3.3:", project3_3.projectName);

  // Project 3.4 — Unapproved: Monetary + InKind
  const project3_4 = await prisma.post.create({
    data: {
      projectName: "Organic Farming for Smallhold Farmers",
      description:
        "Training and support for 300 farmers to transition to organic farming",
      causes: ["noHunger", "goodHealth", "sustainableAgriculture"],
      location: "Nueva Vizcaya",
      priority: "Medium",
      overallStatus: "Unapproved",
      orgId: org3.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 180000, currentAmount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Organic Seeds", targetQuantity: 3000, unit: "packs" },
          { itemName: "Farming Tools", targetQuantity: 300, unit: "sets" },
          { itemName: "Fertilizer", targetQuantity: 5000, unit: "kg" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 3.4:", project3_4.projectName);

  // Project 3.5 — Pending: Volunteer + InKind
  const project3_5 = await prisma.post.create({
    data: {
      projectName: "Environmental Education in Schools",
      description:
        "Conduct environmental awareness programs in 30 schools across Metro Manila",
      causes: ["qualityEducation", "climateAction"],
      location: "Metro Manila",
      priority: "Medium",
      overallStatus: "Pending",
      orgId: org3.id,
      supportOptions: {
        create: [{ type: "Volunteer", targetCount: 50, currentCount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Educational Modules", targetQuantity: 30, unit: "sets" },
          { itemName: "Seedlings", targetQuantity: 5000, unit: "pieces" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 3.5:", project3_5.projectName);

  // Project 3.6 — Unapproved: Monetary + Volunteer
  const project3_6 = await prisma.post.create({
    data: {
      projectName: "River Cleanup and Monitoring Program",
      description:
        "Monthly river cleanup activities and water quality monitoring",
      causes: ["cleanWater", "lifeBelow"],
      location: "Laguna de Bay",
      priority: "High",
      overallStatus: "Unapproved",
      orgId: org3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 120000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 80, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Seeded project 3.6:", project3_6.projectName);

  console.log("\n" + "═".repeat(80));
  console.log("SEED COMPLETE - ALL USER CREDENTIALS");
  console.log("═".repeat(80));

  console.log(
    "\n┌─ ADMIN ACCOUNTS ────────────────────────────────────────────────────────────┐",
  );
  console.log("├─ System Admin");
  console.log(`│  Email:    ${admin.email}`);
  console.log(`│  Password: admin123`);
  console.log(
    "└────────────────────────────────────────────────────────────────────────────┘",
  );

  console.log(
    "\n┌─ DONOR ACCOUNTS ────────────────────────────────────────────────────────────┐",
  );
  console.log("├─ Donor 1 - Demo Donor");
  console.log(`│  Email:    ${donor1.email}`);
  console.log(`│  Password: donor123`);
  console.log(`│  Country:  ${donor1.country}`);
  console.log(`│  Affiliation: ${donor1.affiliation}`);
  console.log("├─ Donor 2 - Margaret Lim");
  console.log(`│  Email:    ${donor2.email}`);
  console.log(`│  Password: margaret2024`);
  console.log(`│  Country:  ${donor2.country}`);
  console.log(`│  Affiliation: ${donor2.affiliation}`);
  console.log("├─ Donor 3 - Carlos Fernandez");
  console.log(`│  Email:    ${donor3.email}`);
  console.log(`│  Password: carlos5050`);
  console.log(`│  Country:  ${donor3.country}`);
  console.log(`│  Affiliation: ${donor3.affiliation}`);
  console.log("├─ Donor 4 - Jessica Teo");
  console.log(`│  Email:    ${donor4.email}`);
  console.log(`│  Password: jessica2025`);
  console.log(`│  Country:  ${donor4.country}`);
  console.log(`│  Affiliation: ${donor4.affiliation}`);
  console.log(
    "└────────────────────────────────────────────────────────────────────────────┘",
  );

  console.log(
    "\n┌─ NGO ORGANIZATION ACCOUNTS ─────────────────────────────────────────────────┐",
  );
  console.log("├─ Organization 1 - Philippine Red Cross");
  console.log(`│  Email:    ${org1.email}`);
  console.log(`│  Password: redcross123`);
  console.log(`│  Contact:  ${org1.firstName} ${org1.surname}`);
  console.log(`│  Country:  ${org1.country}`);
  console.log(`│  Status:   ${org1.status}`);
  console.log(`│  Projects: 6 (5 Approved/Pending, 1 Unapproved/Edited)`);
  console.log("├─ Organization 2 - Action Aid Philippines");
  console.log(`│  Email:    ${org2.email}`);
  console.log(`│  Password: actionaid456`);
  console.log(`│  Contact:  ${org2.firstName} ${org2.surname}`);
  console.log(`│  Country:  ${org2.country}`);
  console.log(`│  Status:   ${org2.status}`);
  console.log(`│  Projects: 6 (3 Approved, 2 Unapproved, 1 Pending)`);
  console.log("├─ Organization 3 - Green Earth Foundation");
  console.log(`│  Email:    ${org3.email}`);
  console.log(`│  Password: greenearth789`);
  console.log(`│  Contact:  ${org3.firstName} ${org3.surname}`);
  console.log(`│  Country:  ${org3.country}`);
  console.log(`│  Status:   ${org3.status}`);
  console.log(`│  Projects: 6 (3 Approved, 2 Unapproved, 1 Pending)`);
  console.log(
    "└────────────────────────────────────────────────────────────────────────────┘",
  );

  console.log(
    "\n┌─ QUICK LOGIN REFERENCE ────────────────────────────────────────────────────┐",
  );
  console.log("├─ Admin Dashboard:");
  console.log("│  admin@bayanihub.local / admin123");
  console.log("├─ Donor Portal:");
  console.log("│  donor@bayanihub.local / donor123");
  console.log("│  margaret.lim@corporate.com / margaret2024");
  console.log("│  carlos.fernandez@philanthropy.org / carlos5050");
  console.log("│  jessica.teo@nonprofit.sg / jessica2025");
  console.log("├─ NGO Organization Portal:");
  console.log("│  mary.angela@redcross.ph / redcross123");
  console.log("│  juan.santos@actionaid.ph / actionaid456");
  console.log("│  rosa.garcia@greenearth.ph / greenearth789");
  console.log(
    "└────────────────────────────────────────────────────────────────────────────┘\n",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
