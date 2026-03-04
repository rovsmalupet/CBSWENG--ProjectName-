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

  // Create dummy Approved project
  const approvedProject = await prisma.post.create({
    data: {
      projectName: "Community Medical Mission",
      description:
        "Free medical checkup and health awareness campaign for the community",
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

  console.log("Created approved project:", approvedProject);

  // Create dummy Rejected project
  const rejectedProject = await prisma.post.create({
    data: {
      projectName: "Clean Water Initiative",
      description: "Building water wells in rural areas",
      causes: ["povertyAndHunger", "environmentAndClimate"],
      location: "Mindanao",
      priority: "Medium",
      overallStatus: "Unapproved",
      orgId: "tempID",
      monetaryEnabled: true,
      monetaryTargetAmount: 75000,
      volunteerEnabled: false,
      inKindItems: {
        create: [],
      },
    },
    include: { inKindItems: true },
  });

  console.log("Created unapproved project:", rejectedProject);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
