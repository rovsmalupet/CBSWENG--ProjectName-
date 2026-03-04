import prisma from "./client.js";

async function main() {
  // Create default organization
  const org = await prisma.organization.create({
    data: {
      id: "tempID",
      orgName: "Philippine Red Cross",
      email: "mary.angela@redcross.ph",
      representativePerson: "Mary Angela Cruz",
      isVerified: false,
    },
  });
  console.log("Created organization:", org);

  // Create mock posted project
  const project1 = await prisma.post.create({
    data: {
      projectName: "Community Medical Mission",
      description: "Free medical checkup and health awareness campaign for the community",
      causes: ["healthAndMedical", "communityDevelopment"],
      location: "Manila",
      priority: "High",
      overallStatus: "Approved",
      orgId: "tempID",
      monetaryEnabled: true,
      monetaryTargetAmount: 50000,
      volunteerEnabled: true,
      volunteerTargetCount: 20,
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
    include: { inKindItems: true },
  });
  console.log("Created project 1:", project1);

  // Create mock posted project
  const project2 = await prisma.post.create({
    data: {
      projectName: "Batangas Typhoon Support Donation Drive",
      description: "Donate any monetary amount, food, and clothing for the victims of the Batangas Typhoon",
      causes: ["healthAndMedical", "communityDevelopment"],
      location: "Manila",
      priority: "High",
      overallStatus: "Approved",
      startDate: "2026-03-23",
      endDate: "2026-03-28",
      orgId: "tempID",
      monetaryEnabled: true,
      monetaryTargetAmount: 50000,
      volunteerEnabled: false,
      inKindItems: {
        create: [
          { itemName: "Biogesic", targetQuantity: 500, unit: "pills" },
          { itemName: "150g Canned Tuna", targetQuantity: 250, unit: "pieces" },
          { itemName: "Instant Cup Noodles", targetQuantity: 250, unit: "pieces" },
          { itemName: "1kg Rice", targetQuantity: 250, unit: "bags" },
        ],
      },
    },
    include: { inKindItems: true },
  });
  console.log("Created project 2:", project2);

  // Create mock pending project
  const project3 = await prisma.post.create({
    data: {
      projectName: "Clean Water Initiative",
      description: "Building water wells in rural areas",
      causes: ["povertyAndHunger", "environmentAndClimate"],
      location: "Mindanao",
      priority: "Medium",
      overallStatus: "Pending",
      orgId: "tempID",
      monetaryEnabled: true,
      monetaryTargetAmount: 75000,
      volunteerEnabled: false,
      inKindItems: { create: [] },
    },
    include: { inKindItems: true },
  });
  console.log("Created project 3:", project3);

  // Create mock edited project 4
  const project4 = await prisma.post.create({
    data: {
      projectName: "Batangas Typhoon Support Day 1",
      description: "Help us bag our donated materials and deliver them to the victims",
      causes: ["healthAndMedical", "povertyAndHunger"],
      location: "Batangas",
      priority: "High",
      overallStatus: "Edited",
      orgId: "tempID",
      monetaryEnabled: false,
      volunteerEnabled: true,
      volunteerTargetCount: 50,
      inKindItems: { create: [] },
    },
    include: { inKindItems: true },
  });
  console.log("Created project 4:", project4);
  
  const project5 = await prisma.post.create({
    data: {
      projectName: "Donate-A-Book",
      description: "Help us collect 200 chgildren's books to be given away during Paaralang Elementarya's back to school program.",
      causes: ["healthAndMedical"],
      location: "Quezon City",
      priority: "High",
      overallStatus: "Unapproved",
      orgId: "tempID",
      monetaryEnabled: false,
      volunteerEnabled: false,
      inKindItems: {
        create: [
          { itemName: "Children's Book", targetQuantity: 300, unit: "pieces" },
        ],
      },
    },
    include: { inKindItems: true },
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