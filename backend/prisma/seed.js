import prisma from "./client.js";

async function main() {
  const org = await prisma.organization.create({
    data: {
      id: "tempID",
      orgName: "Philippine Red Cross",
      firstName: "Mary Angela",
      surname: "Cruz",
      email: "mary.angela@redcross.ph",
      isVerified: false,
      status: "pending",
    },
  });
  console.log("Created organization:", org);

  // Project 1 — Monetary + Volunteer + InKind
  const project1 = await prisma.post.create({
    data: {
      projectName: "Community Medical Mission",
      description: "Free medical checkup and health awareness campaign for the community",
      causes: ["healthAndMedical", "communityDevelopment"],
      location: "Manila",
      priority: "High",
      overallStatus: "Approved",
      orgId: "tempID",
	  
      supportOptions: {
        create: [
          {
            type: "Monetary",
            targetAmount: 50000,
            currentAmount: 0,
          },
          {
            type: "Volunteer",
            targetCount: 20,
            currentCount: 0,
          },
        ],
      },
      inKindItems: {
        create: [
          {
            itemName: "Medical Supplies",
            targetQuantity: 100,
            unit: "boxes",
          },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Created project 1:", project1);

  // Project 2 — Monetary + InKind only (no volunteer)
  const project2 = await prisma.post.create({
    data: {
      projectName: "Batangas Typhoon Support Donation Drive",
      description: "Donate any monetary amount, food, and clothing for the victims of the Batangas Typhoon",
      causes: ["healthAndMedical", "communityDevelopment"],
      location: "Manila",
      priority: "High",
      overallStatus: "Approved",
      startDate: new Date("2026-03-23"),
      endDate: new Date("2026-03-28"),
      orgId: "tempID",
      supportOptions: {
        create: [
          {
            type: "Monetary",
            targetAmount: 50000,
            currentAmount: 0,
          },
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
  console.log("Created project 2:", project2);

  // Project 3 — Monetary only, Pending status
  const project3 = await prisma.post.create({
    data: {
      projectName: "Clean Water Initiative",
      description: "Building water wells in rural areas",
      causes: ["povertyAndHunger", "environmentAndClimate"],
      location: "Mindanao",
      priority: "Medium",
      overallStatus: "Pending",
      orgId: "tempID",
      supportOptions: {
        create: [
          {
            type: "Monetary",
            targetAmount: 75000,
            currentAmount: 0,
          },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Created project 3:", project3);

  // Project 4 — Volunteer only, Edited status
  const project4 = await prisma.post.create({
    data: {
      projectName: "Batangas Typhoon Support Day 1",
      description: "Help us bag our donated materials and deliver them to the victims",
      causes: ["healthAndMedical", "povertyAndHunger"],
      location: "Batangas",
      priority: "High",
      overallStatus: "Edited",
      orgId: "tempID",
      supportOptions: {
        create: [
          {
            type: "Volunteer",
            targetCount: 50,
            currentCount: 0,
          },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Created project 4:", project4);

  // Project 5 — InKind only, Unapproved status
  const project5 = await prisma.post.create({
    data: {
      projectName: "Donate-A-Book",
      description: "Help us collect 200 children's books to be given away during Paaralang Elementarya's back to school program.",
      causes: ["educationAndChildren"],
      location: "Quezon City",
      priority: "High",
      overallStatus: "Unapproved",
      orgId: "tempID",
      inKindItems: {
        create: [
          { itemName: "Children's Book", targetQuantity: 300, unit: "pieces" },
        ],
      },
    },
    include: { inKindItems: true, supportOptions: true },
  });
  console.log("Created project 5:", project5);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });