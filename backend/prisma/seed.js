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
      causes: ["qualityEducation", "peaceAndJustice"],
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
      causes: ["climateAction", "lifeBelowWater", "sustainableCities"],
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
      causes: ["affordableEnergy", "sustainableCities"],
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
      causes: ["zeroHunger", "goodHealth", "responsibleConsumption"],
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
      causes: ["cleanWater", "lifeBelowWater"],
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

  // ═══════════════════════════════════════════════════════════════════════════
  // THAILAND - Organizations, Donors, and Projects
  // ═══════════════════════════════════════════════════════════════════════════

  const thaiOrg1 = await prisma.organization.upsert({
    where: { email: "somchai.thailand@savechildren.th" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Save the Children Thailand",
      firstName: "Somchai",
      surname: "Thawinchai",
      email: "somchai.thailand@savechildren.th",
      password: await bcrypt.hash("thailand123", SALT_ROUNDS),
      country: "Thailand",
      isVerified: true,
      status: "Approved",
    },
  });

  const thaiOrg2 = await prisma.organization.upsert({
    where: { email: "niran.bangkok@oxfam.th" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Oxfam Thailand",
      firstName: "Niran",
      surname: "Pattana",
      email: "niran.bangkok@oxfam.th",
      password: await bcrypt.hash("oxfam456", SALT_ROUNDS),
      country: "Thailand",
      isVerified: true,
      status: "Approved",
    },
  });

  const thaiOrg3 = await prisma.organization.upsert({
    where: { email: "pim.chiang@greenplanet.th" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Green Planet Thailand",
      firstName: "Pim",
      surname: "Siriporn",
      email: "pim.chiang@greenplanet.th",
      password: await bcrypt.hash("green789", SALT_ROUNDS),
      country: "Thailand",
      isVerified: true,
      status: "Approved",
    },
  });

  const thaiDonor1 = await prisma.donor.upsert({
    where: { email: "anida.bangkok@business.th" },
    update: {},
    create: {
      firstName: "Anida",
      lastName: "Chakri",
      email: "anida.bangkok@business.th",
      password: await bcrypt.hash("anida2024", SALT_ROUNDS),
      country: "Thailand",
      affiliation: "Bangkok Corporate Alliance",
      isVerified: true,
      status: "Approved",
    },
  });

  const thaiDonor2 = await prisma.donor.upsert({
    where: { email: "sakchai.phuket@trade.th" },
    update: {},
    create: {
      firstName: "Sakchai",
      lastName: "Monthian",
      email: "sakchai.phuket@trade.th",
      password: await bcrypt.hash("sakchai2025", SALT_ROUNDS),
      country: "Thailand",
      affiliation: "Phuket Tourism Foundation",
      isVerified: true,
      status: "Approved",
    },
  });

  const thaiDonor3 = await prisma.donor.upsert({
    where: { email: "kunthea.chang@philanthropy.th" },
    update: {},
    create: {
      firstName: "Kunthea",
      lastName: "Chukaew",
      email: "kunthea.chang@philanthropy.th",
      password: await bcrypt.hash("kunthea456", SALT_ROUNDS),
      country: "Thailand",
      affiliation: "Mekong Development Fund",
      isVerified: true,
      status: "Approved",
    },
  });

  // Thailand Projects
  await prisma.post.create({
    data: {
      projectName: "Child Protection and Education in Northern Thailand",
      description:
        "Provide safe spaces and quality education for at-risk children in rural Northern Thailand",
      causes: ["qualityEducation", "noPoverty", "peaceAndJustice"],
      location: "Chiang Rai",
      priority: "High",
      overallStatus: "Approved",
      orgId: thaiOrg1.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 80000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 30, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "School Supplies", targetQuantity: 500, unit: "packs" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Women's Empowerment and Skills Training",
      description:
        "Economic empowerment for 300 women through vocational skills training in Bangkok",
      causes: ["genderEquality", "noPoverty", "qualityEducation"],
      location: "Bangkok",
      priority: "High",
      overallStatus: "Approved",
      orgId: thaiOrg2.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 120000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Mangrove Restoration and Coastal Protection",
      description:
        "Restore 5000 hectares of mangrove forests to protect coastal communities",
      causes: ["climateAction", "lifeBelowWater", "sustainableCities"],
      location: "Phang Nga",
      priority: "High",
      overallStatus: "Approved",
      orgId: thaiOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 200000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 100, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Healthcare Access in Rural Areas",
      description:
        "Mobile health clinics providing medical services to remote communities",
      causes: ["goodHealth", "sustainableCities"],
      location: "Ubon Ratchathani",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: thaiOrg1.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 95000, currentAmount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Medical Equipment", targetQuantity: 50, unit: "units" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Food Security and Agricultural Development",
      description:
        "Support small farmers with sustainable agriculture techniques and equipment",
      causes: ["zeroHunger", "responsibleConsumption"],
      location: "Nakhon Sawan",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: thaiOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 110000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 40, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "Farming Seeds", targetQuantity: 2000, unit: "packs" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Clean Water Initiative for Mountain Villages",
      description:
        "Install water purification systems in 30 mountain communities",
      causes: ["cleanWater", "goodHealth"],
      location: "Mae Hong Son",
      priority: "High",
      overallStatus: "Approved",
      orgId: thaiOrg3.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 150000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VIETNAM - Organizations, Donors, and Projects
  // ═══════════════════════════════════════════════════════════════════════════

  const vnOrg1 = await prisma.organization.upsert({
    where: { email: "thanh.hanoi@viethope.vn" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Vietnam Hope Foundation",
      firstName: "Thanh",
      surname: "Nguyen",
      email: "thanh.hanoi@viethope.vn",
      password: await bcrypt.hash("vnhope456", SALT_ROUNDS),
      country: "Vietnam",
      isVerified: true,
      status: "Approved",
    },
  });

  const vnOrg2 = await prisma.organization.upsert({
    where: { email: "linh.saigon@greenasia.vn" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Green Asia Vietnam",
      firstName: "Linh",
      surname: "Tran",
      email: "linh.saigon@greenasia.vn",
      password: await bcrypt.hash("green123", SALT_ROUNDS),
      country: "Vietnam",
      isVerified: true,
      status: "Approved",
    },
  });

  const vnOrg3 = await prisma.organization.upsert({
    where: { email: "hoa.danang@communitycare.vn" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Community Care Vietnam",
      firstName: "Hoa",
      surname: "Pham",
      email: "hoa.danang@communitycare.vn",
      password: await bcrypt.hash("care789", SALT_ROUNDS),
      country: "Vietnam",
      isVerified: true,
      status: "Approved",
    },
  });

  const vnDonor1 = await prisma.donor.upsert({
    where: { email: "minh.hanoi@export.vn" },
    update: {},
    create: {
      firstName: "Minh",
      lastName: "Hoang",
      email: "minh.hanoi@export.vn",
      password: await bcrypt.hash("minh2024", SALT_ROUNDS),
      country: "Vietnam",
      affiliation: "Hanoi Trade Association",
      isVerified: true,
      status: "Approved",
    },
  });

  const vnDonor2 = await prisma.donor.upsert({
    where: { email: "quang.hcmc@textile.vn" },
    update: {},
    create: {
      firstName: "Quang",
      lastName: "Dang",
      email: "quang.hcmc@textile.vn",
      password: await bcrypt.hash("quang2025", SALT_ROUNDS),
      country: "Vietnam",
      affiliation: "HCMC Textile Industry",
      isVerified: true,
      status: "Approved",
    },
  });

  const vnDonor3 = await prisma.donor.upsert({
    where: { email: "ly.mekong@tourism.vn" },
    update: {},
    create: {
      firstName: "Ly",
      lastName: "Nguyen",
      email: "ly.mekong@tourism.vn",
      password: await bcrypt.hash("ly456", SALT_ROUNDS),
      country: "Vietnam",
      affiliation: "Mekong Delta Tourism Council",
      isVerified: true,
      status: "Approved",
    },
  });

  // Vietnam Projects
  await prisma.post.create({
    data: {
      projectName: "Sustainable Mekong Delta Farming",
      description:
        "Support farmers with sustainable agriculture and climate-resilient crops in Mekong Delta",
      causes: ["zeroHunger", "climateAction", "responsibleConsumption"],
      location: "Can Tho",
      priority: "High",
      overallStatus: "Approved",
      orgId: vnOrg1.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 140000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 50, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "Organic Seeds", targetQuantity: 3000, unit: "packs" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Urban Waste Management and Recycling Program",
      description:
        "Implement waste segregation and recycling in 8 Vietnamese cities",
      causes: ["cleanWater", "responsibleConsumption", "sustainableCities"],
      location: "Ho Chi Minh City",
      priority: "High",
      overallStatus: "Approved",
      orgId: vnOrg2.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 180000, currentAmount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Recycling Bins", targetQuantity: 1000, unit: "pieces" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Healthcare and Nutrition for Street Children",
      description:
        "Comprehensive healthcare and nutritional support for 500 street children in Hanoi",
      causes: ["goodHealth", "noPoverty", "qualityEducation"],
      location: "Hanoi",
      priority: "High",
      overallStatus: "Approved",
      orgId: vnOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 100000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 35, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Disaster Risk Reduction in Coastal Communities",
      description:
        "Build resilience against typhoons and flooding in coastal provinces",
      causes: ["climateAction", "sustainableCities", "peaceAndJustice"],
      location: "Quang Nam",
      priority: "High",
      overallStatus: "Approved",
      orgId: vnOrg1.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 160000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Women's Cooperative Development",
      description:
        "Establish 15 women's cooperatives for income generation and empowerment",
      causes: ["genderEquality", "noPoverty"],
      location: "Da Nang",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: vnOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 125000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 25, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Forests and Biodiversity Conservation",
      description:
        "Protect and restore 20000 hectares of rainforests and wetlands",
      causes: ["lifeBelowWater", "climateAction"],
      location: "Kon Tum",
      priority: "High",
      overallStatus: "Approved",
      orgId: vnOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 210000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 75, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INDONESIA - Organizations, Donors, and Projects
  // ═══════════════════════════════════════════════════════════════════════════

  const idOrg1 = await prisma.organization.upsert({
    where: { email: "budi.jakarta@indonesiakasih.id" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Indonesia Kasih Foundation",
      firstName: "Budi",
      surname: "Santoso",
      email: "budi.jakarta@indonesiakasih.id",
      password: await bcrypt.hash("indo123", SALT_ROUNDS),
      country: "Indonesia",
      isVerified: true,
      status: "Approved",
    },
  });

  const idOrg2 = await prisma.organization.upsert({
    where: { email: "siti.bandung@ecoindo.id" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Eco Indonesia Network",
      firstName: "Siti",
      surname: "Wijaya",
      email: "siti.bandung@ecoindo.id",
      password: await bcrypt.hash("eco456", SALT_ROUNDS),
      country: "Indonesia",
      isVerified: true,
      status: "Approved",
    },
  });

  const idOrg3 = await prisma.organization.upsert({
    where: { email: "yuni.surabaya@healthindia.id" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Health for All Indonesia",
      firstName: "Yuni",
      surname: "Kusuma",
      email: "yuni.surabaya@healthindia.id",
      password: await bcrypt.hash("health789", SALT_ROUNDS),
      country: "Indonesia",
      isVerified: true,
      status: "Approved",
    },
  });

  const idDonor1 = await prisma.donor.upsert({
    where: { email: "ahmad.jakarta@mining.id" },
    update: {},
    create: {
      firstName: "Ahmad",
      lastName: "Rahman",
      email: "ahmad.jakarta@mining.id",
      password: await bcrypt.hash("ahmad2024", SALT_ROUNDS),
      country: "Indonesia",
      affiliation: "Jakarta Mining Consortium",
      isVerified: true,
      status: "Approved",
    },
  });

  const idDonor2 = await prisma.donor.upsert({
    where: { email: "dewi.medan@palm.id" },
    update: {},
    create: {
      firstName: "Dewi",
      lastName: "Lestari",
      email: "dewi.medan@palm.id",
      password: await bcrypt.hash("dewi2025", SALT_ROUNDS),
      country: "Indonesia",
      affiliation: "Sustainable Palm Association",
      isVerified: true,
      status: "Approved",
    },
  });

  const idDonor3 = await prisma.donor.upsert({
    where: { email: "hari.yogya@batik.id" },
    update: {},
    create: {
      firstName: "Hari",
      lastName: "Wijoto",
      email: "hari.yogya@batik.id",
      password: await bcrypt.hash("hari456", SALT_ROUNDS),
      country: "Indonesia",
      affiliation: "Yogyakarta Batik Craftsmen",
      isVerified: true,
      status: "Approved",
    },
  });

  // Indonesia Projects
  await prisma.post.create({
    data: {
      projectName: "Education for Rural Children in Java",
      description:
        "Build 20 schools and provide quality education for 5000 children in rural Java",
      causes: ["qualityEducation", "noPoverty"],
      location: "East Java",
      priority: "High",
      overallStatus: "Approved",
      orgId: idOrg1.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 200000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 60, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "School Materials", targetQuantity: 2000, unit: "packs" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Rainforest Protection in Sumatra",
      description:
        "Protect 30000 hectares of Sumatran rainforest from deforestation",
      causes: ["climateAction", "lifeBelowWater"],
      location: "Sumatra",
      priority: "High",
      overallStatus: "Approved",
      orgId: idOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 250000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 100, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Maternal and Child Health Program",
      description:
        "Improve healthcare outcomes for mothers and children in 50 villages across Indonesia",
      causes: ["goodHealth", "noPoverty", "genderEquality"],
      location: "West Nusa Tenggara",
      priority: "High",
      overallStatus: "Approved",
      orgId: idOrg3.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 150000, currentAmount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Medical Supplies", targetQuantity: 500, unit: "boxes" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Sustainable Fisheries Development",
      description:
        "Support fishing communities with sustainable practices and market access",
      causes: ["zeroHunger", "lifeBelowWater", "responsibleConsumption"],
      location: "South Sulawesi",
      priority: "High",
      overallStatus: "Approved",
      orgId: idOrg1.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 120000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 40, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Clean Water and Sanitation for Island Communities",
      description:
        "Provide clean water systems and sanitation facilities to 40 island communities",
      causes: ["cleanWater", "goodHealth", "sustainableCities"],
      location: "Maluku",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: idOrg2.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 180000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Women Artisan Cooperative Support",
      description:
        "Establish and support 25 women's craft cooperatives across Indonesia",
      causes: ["genderEquality", "noPoverty"],
      location: "Bali",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: idOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 110000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 30, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MALAYSIA - Organizations, Donors, and Projects
  // ═══════════════════════════════════════════════════════════════════════════

  const myOrg1 = await prisma.organization.upsert({
    where: { email: "jaya.kualalumpur@myasia.my" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "My Asia Foundation Malaysia",
      firstName: "Jaya",
      surname: "Kumar",
      email: "jaya.kualalumpur@myasia.my",
      password: await bcrypt.hash("myasia456", SALT_ROUNDS),
      country: "Malaysia",
      isVerified: true,
      status: "Approved",
    },
  });

  const myOrg2 = await prisma.organization.upsert({
    where: { email: "lim.penang@conservation.my" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Conservation Malaysia Network",
      firstName: "Lim",
      surname: "Teh",
      email: "lim.penang@conservation.my",
      password: await bcrypt.hash("conserve123", SALT_ROUNDS),
      country: "Malaysia",
      isVerified: true,
      status: "Approved",
    },
  });

  const myOrg3 = await prisma.organization.upsert({
    where: { email: "farah.selangor@kidshope.my" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Kids Hope Malaysia",
      firstName: "Farah",
      surname: "Mohd",
      email: "farah.selangor@kidshope.my",
      password: await bcrypt.hash("kids789", SALT_ROUNDS),
      country: "Malaysia",
      isVerified: true,
      status: "Approved",
    },
  });

  const myDonor1 = await prisma.donor.upsert({
    where: { email: "rajesh.kl@banking.my" },
    update: {},
    create: {
      firstName: "Rajesh",
      lastName: "Singh",
      email: "rajesh.kl@banking.my",
      password: await bcrypt.hash("rajesh2024", SALT_ROUNDS),
      country: "Malaysia",
      affiliation: "Kuala Lumpur Financial Group",
      isVerified: true,
      status: "Approved",
    },
  });

  const myDonor2 = await prisma.donor.upsert({
    where: { email: "nurul.ipoh@technology.my" },
    update: {},
    create: {
      firstName: "Nurul",
      lastName: "Hassan",
      email: "nurul.ipoh@technology.my",
      password: await bcrypt.hash("nurul2025", SALT_ROUNDS),
      country: "Malaysia",
      affiliation: "Ipoh Tech Innovation Hub",
      isVerified: true,
      status: "Approved",
    },
  });

  const myDonor3 = await prisma.donor.upsert({
    where: { email: "tan.johor@manufacturing.my" },
    update: {},
    create: {
      firstName: "Tan",
      lastName: "Wei",
      email: "tan.johor@manufacturing.my",
      password: await bcrypt.hash("tan456", SALT_ROUNDS),
      country: "Malaysia",
      affiliation: "Johor Industrial Association",
      isVerified: true,
      status: "Approved",
    },
  });

  // Malaysia Projects
  await prisma.post.create({
    data: {
      projectName: "Indigenous Community Development in Sarawak",
      description:
        "Support indigenous communities with education and sustainable livelihood opportunities",
      causes: ["qualityEducation", "noPoverty"],
      location: "Sarawak",
      priority: "High",
      overallStatus: "Approved",
      orgId: myOrg1.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 140000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 35, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "Educational Tools", targetQuantity: 1000, unit: "sets" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Orangutan and Rainforest Conservation",
      description:
        "Protect rainforests and orangutan habitats in Malaysian Borneo",
      causes: ["climateAction", "lifeBelowWater"],
      location: "Sabah",
      priority: "High",
      overallStatus: "Approved",
      orgId: myOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 220000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 80, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Child Welfare and Orphan Care",
      description:
        "Provide care, education, and support for 300 orphaned and vulnerable children",
      causes: ["goodHealth", "qualityEducation", "noPoverty"],
      location: "Kuala Lumpur",
      priority: "High",
      overallStatus: "Approved",
      orgId: myOrg3.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 130000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Urban Mental Health and Counseling Services",
      description:
        "Provide mental health support and counseling for low-income urban families",
      causes: ["goodHealth", "noPoverty"],
      location: "Klang Valley",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: myOrg1.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 95000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 25, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Renewable Energy for Rural Schools",
      description:
        "Install solar panels and renewable energy systems in 30 rural schools",
      causes: ["affordableEnergy", "qualityEducation", "sustainableCities"],
      location: "Pahang",
      priority: "High",
      overallStatus: "Approved",
      orgId: myOrg2.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 180000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Food Security and Urban Farming",
      description:
        "Promote urban farming and food security in Kuala Lumpur through community gardens",
      causes: ["zeroHunger", "responsibleConsumption"],
      location: "Kuala Lumpur",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: myOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 100000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 40, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "Seeds and Tools", targetQuantity: 800, unit: "sets" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SINGAPORE - Organizations, Donors, and Projects
  // ═══════════════════════════════════════════════════════════════════════════

  const sgOrg1 = await prisma.organization.upsert({
    where: { email: "rachel.singapore@crisisaid.sg" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Crisis Aid Singapore",
      firstName: "Rachel",
      surname: "Tan",
      email: "rachel.singapore@crisisaid.sg",
      password: await bcrypt.hash("crisis123", SALT_ROUNDS),
      country: "Singapore",
      isVerified: true,
      status: "Approved",
    },
  });

  const sgOrg2 = await prisma.organization.upsert({
    where: { email: "david.singapore@seacare.sg" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "SeaCare Foundation Singapore",
      firstName: "David",
      surname: "Lim",
      email: "david.singapore@seacare.sg",
      password: await bcrypt.hash("seacare456", SALT_ROUNDS),
      country: "Singapore",
      isVerified: true,
      status: "Approved",
    },
  });

  const sgOrg3 = await prisma.organization.upsert({
    where: { email: "melissa.singapore@youthdev.sg" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Youth Development Singapore",
      firstName: "Melissa",
      surname: "Wong",
      email: "melissa.singapore@youthdev.sg",
      password: await bcrypt.hash("youth789", SALT_ROUNDS),
      country: "Singapore",
      isVerified: true,
      status: "Approved",
    },
  });

  const sgDonor1 = await prisma.donor.upsert({
    where: { email: "patrick.singapore@finance.sg" },
    update: {},
    create: {
      firstName: "Patrick",
      lastName: "Lee",
      email: "patrick.singapore@finance.sg",
      password: await bcrypt.hash("patrick2024", SALT_ROUNDS),
      country: "Singapore",
      affiliation: "Singapore Finance Leadership Council",
      isVerified: true,
      status: "Approved",
    },
  });

  const sgDonor2 = await prisma.donor.upsert({
    where: { email: "isabelle.singapore@shipping.sg" },
    update: {},
    create: {
      firstName: "Isabelle",
      lastName: "Ng",
      email: "isabelle.singapore@shipping.sg",
      password: await bcrypt.hash("isabelle2025", SALT_ROUNDS),
      country: "Singapore",
      affiliation: "Port of Singapore Maritime Group",
      isVerified: true,
      status: "Approved",
    },
  });

  const sgDonor3 = await prisma.donor.upsert({
    where: { email: "kevin.singapore@retail.sg" },
    update: {},
    create: {
      firstName: "Kevin",
      lastName: "Goh",
      email: "kevin.singapore@retail.sg",
      password: await bcrypt.hash("kevin456", SALT_ROUNDS),
      country: "Singapore",
      affiliation: "Singapore Retail Association",
      isVerified: true,
      status: "Approved",
    },
  });

  // Singapore Projects
  await prisma.post.create({
    data: {
      projectName: "Migrant Worker Support and Integration Program",
      description:
        "Support 5000 migrant workers with skills training and integration services",
      causes: ["noPoverty", "genderEquality", "peaceAndJustice"],
      location: "Singapore",
      priority: "High",
      overallStatus: "Approved",
      orgId: sgOrg1.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 160000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 50, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Marine Ecosystem Protection and Restoration",
      description:
        "Restore coral reefs and mangrove ecosystems around Singapore and Southeast Asia",
      causes: ["lifeBelowWater", "climateAction"],
      location: "Singapore",
      priority: "High",
      overallStatus: "Approved",
      orgId: sgOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 200000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 75, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Youth Leadership and Mentorship Program",
      description:
        "Develop 1000 underprivileged youth through mentorship and skill development",
      causes: ["qualityEducation", "noPoverty"],
      location: "Singapore",
      priority: "High",
      overallStatus: "Approved",
      orgId: sgOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 120000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 60, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Sustainability and Green Building Initiative",
      description:
        "Promote green buildings and sustainable practices in commercial real estate sector",
      causes: ["sustainableCities", "responsibleConsumption"],
      location: "Singapore",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: sgOrg1.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 140000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Food Waste Reduction and Community Feeding",
      description:
        "Collect excess food from businesses and provide nutritious meals to low-income families",
      causes: ["zeroHunger", "responsibleConsumption", "noPoverty"],
      location: "Singapore",
      priority: "High",
      overallStatus: "Approved",
      orgId: sgOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 100000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 40, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Mental Health Awareness and Support Services",
      description:
        "Provide mental health services and awareness campaigns for diverse communities",
      causes: ["goodHealth", "peaceAndJustice"],
      location: "Singapore",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: sgOrg3.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 110000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CAMBODIA - Organizations, Donors, and Projects
  // ═══════════════════════════════════════════════════════════════════════════

  const khOrg1 = await prisma.organization.upsert({
    where: { email: "sophea.phnom@cambodiacare.kh" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Cambodia Care Foundation",
      firstName: "Sophea",
      surname: "Chhim",
      email: "sophea.phnom@cambodiacare.kh",
      password: await bcrypt.hash("cambodia123", SALT_ROUNDS),
      country: "Cambodia",
      isVerified: true,
      status: "Approved",
    },
  });

  const khOrg2 = await prisma.organization.upsert({
    where: { email: "dara.siem@khmergreen.kh" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Khmer Green Initiative",
      firstName: "Dara",
      surname: "Sophal",
      email: "dara.siem@khmergreen.kh",
      password: await bcrypt.hash("khmer456", SALT_ROUNDS),
      country: "Cambodia",
      isVerified: true,
      status: "Approved",
    },
  });

  const khOrg3 = await prisma.organization.upsert({
    where: { email: "nary.battambang@womenpower.kh" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Women Power Cambodia",
      firstName: "Nary",
      surname: "Heang",
      email: "nary.battambang@womenpower.kh",
      password: await bcrypt.hash("women789", SALT_ROUNDS),
      country: "Cambodia",
      isVerified: true,
      status: "Approved",
    },
  });

  const khDonor1 = await prisma.donor.upsert({
    where: { email: "sokha.phnom@garment.kh" },
    update: {},
    create: {
      firstName: "Sokha",
      lastName: "Kunthy",
      email: "sokha.phnom@garment.kh",
      password: await bcrypt.hash("sokha2024", SALT_ROUNDS),
      country: "Cambodia",
      affiliation: "Phnom Penh Garment Manufacturers",
      isVerified: true,
      status: "Approved",
    },
  });

  const khDonor2 = await prisma.donor.upsert({
    where: { email: "vanna.siem@tourism.kh" },
    update: {},
    create: {
      firstName: "Vanna",
      lastName: "Mey",
      email: "vanna.siem@tourism.kh",
      password: await bcrypt.hash("vanna2025", SALT_ROUNDS),
      country: "Cambodia",
      affiliation: "Siem Reap Tourism Board",
      isVerified: true,
      status: "Approved",
    },
  });

  const khDonor3 = await prisma.donor.upsert({
    where: { email: "channy.kompong@trade.kh" },
    update: {},
    create: {
      firstName: "Channy",
      lastName: "Phirun",
      email: "channy.kompong@trade.kh",
      password: await bcrypt.hash("channy456", SALT_ROUNDS),
      country: "Cambodia",
      affiliation: "Kompong Cham Trade Association",
      isVerified: true,
      status: "Approved",
    },
  });

  // Cambodia Projects
  await prisma.post.create({
    data: {
      projectName: "Education and Skills for Rural Children",
      description:
        "Build schools and provide quality education for 3000 children in rural Cambodia",
      causes: ["qualityEducation", "noPoverty"],
      location: "Mondulkiri",
      priority: "High",
      overallStatus: "Approved",
      orgId: khOrg1.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 130000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 45, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          {
            itemName: "Learning Materials",
            targetQuantity: 1500,
            unit: "sets",
          },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Tonle Sap Lake Ecosystem Protection",
      description:
        "Protect and restore the world's largest freshwater system supporting 2 million people",
      causes: ["lifeBelowWater", "climateAction", "zeroHunger"],
      location: "Kampong Chhnang",
      priority: "High",
      overallStatus: "Approved",
      orgId: khOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 190000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 70, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Women's Garment Workers' Rights and Welfare",
      description:
        "Improve working conditions and skills for 2000 women garment workers",
      causes: ["genderEquality", "noPoverty", "peaceAndJustice"],
      location: "Phnom Penh",
      priority: "High",
      overallStatus: "Approved",
      orgId: khOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 110000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 30, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Healthcare Access in Remote Communities",
      description:
        "Establish mobile clinics and healthcare services in 30 remote villages",
      causes: ["goodHealth", "sustainableCities"],
      location: "Ratanakiri",
      priority: "High",
      overallStatus: "Approved",
      orgId: khOrg1.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 100000, currentAmount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Medical Kits", targetQuantity: 40, unit: "units" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Agriculture Transformation and Food Security",
      description:
        "Support farmers with sustainable agriculture and market linkages",
      causes: ["zeroHunger", "responsibleConsumption"],
      location: "Kampong Thom",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: khOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 95000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 35, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "Seeds and Tools", targetQuantity: 1000, unit: "sets" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Child Protection and Trafficking Prevention",
      description:
        "Protect vulnerable children from trafficking and exploitation through education and support",
      causes: ["noPoverty", "qualityEducation", "peaceAndJustice"],
      location: "Sihanoukville",
      priority: "High",
      overallStatus: "Approved",
      orgId: khOrg3.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 120000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LAOS - Organizations, Donors, and Projects
  // ═══════════════════════════════════════════════════════════════════════════

  const laOrg1 = await prisma.organization.upsert({
    where: { email: "khamphoui.vientiane@laocare.la" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Lao Care Foundation",
      firstName: "Khamphoui",
      surname: "Sikhammavanh",
      email: "khamphoui.vientiane@laocare.la",
      password: await bcrypt.hash("laocare123", SALT_ROUNDS),
      country: "Laos",
      isVerified: true,
      status: "Approved",
    },
  });

  const laOrg2 = await prisma.organization.upsert({
    where: { email: "bounmy.luang@mekonggreen.la" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Mekong Green Laos",
      firstName: "Bounmy",
      surname: "Khongdara",
      email: "bounmy.luang@mekonggreen.la",
      password: await bcrypt.hash("mekong456", SALT_ROUNDS),
      country: "Laos",
      isVerified: true,
      status: "Approved",
    },
  });

  const laOrg3 = await prisma.organization.upsert({
    where: { email: "nouaLy.pakse@lao-youth.la" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Lao Youth Empowerment",
      firstName: "Noualy",
      surname: "Vongboupha",
      email: "nouaLy.pakse@lao-youth.la",
      password: await bcrypt.hash("youth789", SALT_ROUNDS),
      country: "Laos",
      isVerified: true,
      status: "Approved",
    },
  });

  const laDonor1 = await prisma.donor.upsert({
    where: { email: "xayphet.vientiane@hydro.la" },
    update: {},
    create: {
      firstName: "Xayphet",
      lastName: "Souvannavichith",
      email: "xayphet.vientiane@hydro.la",
      password: await bcrypt.hash("xayphet2024", SALT_ROUNDS),
      country: "Laos",
      affiliation: "Hydropower Development Company",
      isVerified: true,
      status: "Approved",
    },
  });

  const laDonor2 = await prisma.donor.upsert({
    where: { email: "somxay.luang@textile.la" },
    update: {},
    create: {
      firstName: "Somxay",
      lastName: "Phongsavanh",
      email: "somxay.luang@textile.la",
      password: await bcrypt.hash("somxay2025", SALT_ROUNDS),
      country: "Laos",
      affiliation: "Luang Prabang Textile Industry",
      isVerified: true,
      status: "Approved",
    },
  });

  const laDonor3 = await prisma.donor.upsert({
    where: { email: "kham.pakse@agriculture.la" },
    update: {},
    create: {
      firstName: "Kham",
      lastName: "Sihalath",
      email: "kham.pakse@agriculture.la",
      password: await bcrypt.hash("kham456", SALT_ROUNDS),
      country: "Laos",
      affiliation: "Champasak Agriculture Cooperative",
      isVerified: true,
      status: "Approved",
    },
  });

  // Laos Projects
  await prisma.post.create({
    data: {
      projectName: "Quality Education in Rural Northern Laos",
      description:
        "Provide quality education and teacher training for 2000 students in remote villages",
      causes: ["qualityEducation", "noPoverty"],
      location: "Luang Prabang",
      priority: "High",
      overallStatus: "Approved",
      orgId: laOrg1.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 115000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 40, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          {
            itemName: "Teaching Materials",
            targetQuantity: 1200,
            unit: "sets",
          },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Mekong River Restoration and Fisheries Development",
      description:
        "Restore Mekong ecosystems and support sustainable fishing practices for 1500 families",
      causes: ["lifeBelowWater", "zeroHunger", "climateAction"],
      location: "Khong Waterfront",
      priority: "High",
      overallStatus: "Approved",
      orgId: laOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 170000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 55, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Youth Employment and Skills Development",
      description:
        "Train 800 unemployed youth with vocational and entrepreneurship skills",
      causes: ["noPoverty", "qualityEducation"],
      location: "Vientiane",
      priority: "High",
      overallStatus: "Approved",
      orgId: laOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 100000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 30, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Healthcare Expansion in Rural Areas",
      description:
        "Build clinics and provide medical services to 25 remote villages",
      causes: ["goodHealth", "sustainableCities"],
      location: "Oudomxay",
      priority: "High",
      overallStatus: "Approved",
      orgId: laOrg1.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 90000, currentAmount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Medical Supplies", targetQuantity: 35, unit: "boxes" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Sustainable Agriculture and Food Security",
      description:
        "Support 500 farmers with sustainable techniques and market-ready crops",
      causes: ["zeroHunger", "responsibleConsumption"],
      location: "Savannakhet",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: laOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 85000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 25, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          {
            itemName: "Seeds and Equipment",
            targetQuantity: 600,
            unit: "sets",
          },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Environmental Education and Conservation",
      description:
        "Teach environmental conservation and sustainable practices in 20 schools",
      causes: ["climateAction", "qualityEducation"],
      location: "Bolaven Plateau",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: laOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 75000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 20, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // MYANMAR - Organizations, Donors, and Projects
  // ═══════════════════════════════════════════════════════════════════════════

  const mmOrg1 = await prisma.organization.upsert({
    where: { email: "aye.yangon@myanmarcare.mm" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Myanmar Care Network",
      firstName: "Aye",
      surname: "Kyaw",
      email: "aye.yangon@myanmarcare.mm",
      password: await bcrypt.hash("myanmar123", SALT_ROUNDS),
      country: "Myanmar",
      isVerified: true,
      status: "Approved",
    },
  });

  const mmOrg2 = await prisma.organization.upsert({
    where: { email: "soe.mandalay@irrawa.mm" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Irrawaddy Green Initiative",
      firstName: "Soe",
      surname: "Myanmar",
      email: "soe.mandalay@irrawa.mm",
      password: await bcrypt.hash("green456", SALT_ROUNDS),
      country: "Myanmar",
      isVerified: true,
      status: "Approved",
    },
  });

  const mmOrg3 = await prisma.organization.upsert({
    where: { email: "thein.naypyidaw@peacemm.mm" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Myanmar Peace and Development",
      firstName: "Thein",
      surname: "Oo",
      email: "thein.naypyidaw@peacemm.mm",
      password: await bcrypt.hash("peace789", SALT_ROUNDS),
      country: "Myanmar",
      isVerified: true,
      status: "Approved",
    },
  });

  const mmDonor1 = await prisma.donor.upsert({
    where: { email: "tun.yangon@gems.mm" },
    update: {},
    create: {
      firstName: "Tun",
      lastName: "Thein",
      email: "tun.yangon@gems.mm",
      password: await bcrypt.hash("tun2024", SALT_ROUNDS),
      country: "Myanmar",
      affiliation: "Myanmar Gem Traders Association",
      isVerified: true,
      status: "Approved",
    },
  });

  const mmDonor2 = await prisma.donor.upsert({
    where: { email: "nyein.mandalay@teak.mm" },
    update: {},
    create: {
      firstName: "Nyein",
      lastName: "Htway",
      email: "nyein.mandalay@teak.mm",
      password: await bcrypt.hash("nyein2025", SALT_ROUNDS),
      country: "Myanmar",
      affiliation: "Teak Timber Association",
      isVerified: true,
      status: "Approved",
    },
  });

  const mmDonor3 = await prisma.donor.upsert({
    where: { email: "aung.bagan@tourism.mm" },
    update: {},
    create: {
      firstName: "Aung",
      lastName: "Win",
      email: "aung.bagan@tourism.mm",
      password: await bcrypt.hash("aung456", SALT_ROUNDS),
      country: "Myanmar",
      affiliation: "Bagan Tourism Preservation Society",
      isVerified: true,
      status: "Approved",
    },
  });

  // Myanmar Projects
  await prisma.post.create({
    data: {
      projectName: "Education Access for Internally Displaced Children",
      description:
        "Provide education and support for 2500 internally displaced children",
      causes: ["qualityEducation", "noPoverty", "peaceAndJustice"],
      location: "Yangon",
      priority: "High",
      overallStatus: "Approved",
      orgId: mmOrg1.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 135000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 45, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "Educational Kits", targetQuantity: 1600, unit: "sets" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Irrawaddy River Basin Conservation",
      description:
        "Protect and restore the Irrawaddy River ecosystem supporting 32 million people",
      causes: ["lifeBelowWater", "cleanWater", "climateAction"],
      location: "Sagaing Region",
      priority: "High",
      overallStatus: "Approved",
      orgId: mmOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 195000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 65, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Community Peacebuilding and Conflict Resolution",
      description:
        "Promote peace and reconciliation in conflict-affected communities",
      causes: ["peaceAndJustice", "noPoverty"],
      location: "Shan State",
      priority: "High",
      overallStatus: "Approved",
      orgId: mmOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 105000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 30, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Primary Healthcare Services in Rural Regions",
      description:
        "Establish healthcare clinics in 30 remote rural communities",
      causes: ["goodHealth", "sustainableCities"],
      location: "Magwe Region",
      priority: "High",
      overallStatus: "Approved",
      orgId: mmOrg1.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 110000, currentAmount: 0 }],
      },
      inKindItems: {
        create: [
          { itemName: "Medical Supplies", targetQuantity: 45, unit: "boxes" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Sustainable Smallholder Farming Program",
      description:
        "Support 600 smallholder farmers with sustainable crops and market linkages",
      causes: ["zeroHunger", "responsibleConsumption"],
      location: "Ayeyarwady Region",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: mmOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 92000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 28, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          { itemName: "Seeds and Tools", targetQuantity: 700, unit: "sets" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Women's Economic Empowerment and Livelihoods",
      description:
        "Empower 800 women through business skills and microfinance access",
      causes: ["genderEquality", "noPoverty"],
      location: "Mandalay",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: mmOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 102000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 32, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BRUNEI - Organizations, Donors, and Projects
  // ═══════════════════════════════════════════════════════════════════════════

  const bnOrg1 = await prisma.organization.upsert({
    where: { email: "raja.bandarsg@bruneicare.bn" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Brunei Care Foundation",
      firstName: "Raja",
      surname: "Brunei",
      email: "raja.bandarsg@bruneicare.bn",
      password: await bcrypt.hash("brunei123", SALT_ROUNDS),
      country: "Brunei",
      isVerified: true,
      status: "Approved",
    },
  });

  const bnOrg2 = await prisma.organization.upsert({
    where: { email: "ismail.bandarsg@environet.bn" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "EnvironeT Brunei Network",
      firstName: "Ismail",
      surname: "Rahman",
      email: "ismail.bandarsg@environet.bn",
      password: await bcrypt.hash("environ456", SALT_ROUNDS),
      country: "Brunei",
      isVerified: true,
      status: "Approved",
    },
  });

  const bnOrg3 = await prisma.organization.upsert({
    where: { email: "safiah.bandarsg@youthbn.bn" },
    update: { isVerified: true, status: "Approved" },
    create: {
      orgName: "Brunei Youth Foundation",
      firstName: "Safiah",
      surname: "Abdullah",
      email: "safiah.bandarsg@youthbn.bn",
      password: await bcrypt.hash("youth789", SALT_ROUNDS),
      country: "Brunei",
      isVerified: true,
      status: "Approved",
    },
  });

  const bnDonor1 = await prisma.donor.upsert({
    where: { email: "haji.bandar@petroleum.bn" },
    update: {},
    create: {
      firstName: "Haji",
      lastName: "Mohammad",
      email: "haji.bandar@petroleum.bn",
      password: await bcrypt.hash("haji2024", SALT_ROUNDS),
      country: "Brunei",
      affiliation: "Brunei Petroleum Corporation",
      isVerified: true,
      status: "Approved",
    },
  });

  const bnDonor2 = await prisma.donor.upsert({
    where: { email: "nurul.bandar@banking.bn" },
    update: {},
    create: {
      firstName: "Nurul",
      lastName: "Aini",
      email: "nurul.bandar@banking.bn",
      password: await bcrypt.hash("nurul2025", SALT_ROUNDS),
      country: "Brunei",
      affiliation: "Brunei Islamic Bank",
      isVerified: true,
      status: "Approved",
    },
  });

  const bnDonor3 = await prisma.donor.upsert({
    where: { email: "azmi.bandar@trade.bn" },
    update: {},
    create: {
      firstName: "Azmi",
      lastName: "Hassan",
      email: "azmi.bandar@trade.bn",
      password: await bcrypt.hash("azmi456", SALT_ROUNDS),
      country: "Brunei",
      affiliation: "Brunei Import-Export Chamber",
      isVerified: true,
      status: "Approved",
    },
  });

  // Brunei Projects
  await prisma.post.create({
    data: {
      projectName: "Education Quality Enhancement Program",
      description:
        "Enhance educational infrastructure and learning outcomes across 15 schools",
      causes: ["qualityEducation"],
      location: "Bandar Seri Begawan",
      priority: "High",
      overallStatus: "Approved",
      orgId: bnOrg1.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 105000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 25, currentCount: 0 },
        ],
      },
      inKindItems: {
        create: [
          {
            itemName: "Educational Technology",
            targetQuantity: 500,
            unit: "units",
          },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Rainforest and Biodiversity Conservation",
      description:
        "Protect Bruneian rainforests and ensure sustainable eco-tourism development",
      causes: ["climateAction", "sustainableCities"],
      location: "Temburong",
      priority: "High",
      overallStatus: "Approved",
      orgId: bnOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 140000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 40, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Youth Entrepreneurship and Leadership Initiative",
      description:
        "Develop 500 young entrepreneurs with business and digital skills",
      causes: ["noPoverty", "qualityEducation"],
      location: "Bandar Seri Begawan",
      priority: "High",
      overallStatus: "Approved",
      orgId: bnOrg3.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 95000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 30, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Community Health and Wellness Program",
      description:
        "Promote health awareness and wellness services in all districts",
      causes: ["goodHealth"],
      location: "Brunei",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: bnOrg1.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 85000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Marine Conservation and Blue Economy",
      description:
        "Protect marine ecosystems while supporting sustainable blue economy initiatives",
      causes: ["lifeBelowWater", "sustainableCities"],
      location: "Brunei Bay",
      priority: "High",
      overallStatus: "Approved",
      orgId: bnOrg2.id,
      supportOptions: {
        create: [
          { type: "Monetary", targetAmount: 130000, currentAmount: 0 },
          { type: "Volunteer", targetCount: 50, currentCount: 0 },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

  await prisma.post.create({
    data: {
      projectName: "Sustainable Development and Green City Initiative",
      description:
        "Build Brunei as a green city with sustainable urban development practices",
      causes: ["sustainableCities", "responsibleConsumption"],
      location: "Bandar Seri Begawan",
      priority: "Medium",
      overallStatus: "Approved",
      orgId: bnOrg3.id,
      supportOptions: {
        create: [{ type: "Monetary", targetAmount: 110000, currentAmount: 0 }],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });

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
