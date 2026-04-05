#!/usr/bin/env node
/**
 * Generates prisma/migrations/20260405180000_asean_sdg_posts/migration.sql
 * — 17 posts per ASEAN seed org (one per UN SDG, mapped to CauseEnum), with
 *   Monetary + Volunteer PostSupportOption rows.
 *
 * Requires organizations from 20260405_add_international_accounts (emails {country}@gov.org.{cc}).
 *
 * Usage: node generate-asean-sdg-posts-migration.js
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Must match generate-migration.js ASEAN list (email pattern). */
const ASEAN_ORGS = [
  { country: "Brunei", shorthand: "bn", hub: "Bandar Seri Begawan" },
  { country: "Cambodia", shorthand: "kh", hub: "Phnom Penh" },
  { country: "Indonesia", shorthand: "id", hub: "Jakarta" },
  { country: "Laos", shorthand: "la", hub: "Vientiane" },
  { country: "Malaysia", shorthand: "my", hub: "Kuala Lumpur" },
  { country: "Myanmar", shorthand: "mm", hub: "Yangon" },
  { country: "Philippines", shorthand: "ph", hub: "Manila" },
  { country: "Singapore", shorthand: "sg", hub: "Singapore" },
  { country: "Thailand", shorthand: "th", hub: "Bangkok" },
  { country: "Vietnam", shorthand: "vn", hub: "Ho Chi Minh City" },
];

/** One template per UN SDG 1–17; `cause` must match schema CauseEnum. */
const SDG_TEMPLATES = [
  {
    cause: "noPoverty",
    num: 1,
    title: "No Poverty — Livelihoods & Emergency Relief",
    blurb:
      "Cash-for-work, savings groups, and emergency assistance for households in extreme poverty.",
  },
  {
    cause: "zeroHunger",
    num: 2,
    title: "Zero Hunger — School Meals & Food Security",
    blurb:
      "Nutrition programs, community gardens, and school feeding to reduce hunger and malnutrition.",
  },
  {
    cause: "goodHealth",
    num: 3,
    title: "Good Health — Clinics & Maternal Care",
    blurb:
      "Mobile health outreach, maternal and child health services, and preventive care campaigns.",
  },
  {
    cause: "qualityEducation",
    num: 4,
    title: "Quality Education — Scholarships & Learning Hubs",
    blurb:
      "Scholarships, after-school learning centers, and teacher training in underserved areas.",
  },
  {
    cause: "genderEquality",
    num: 5,
    title: "Gender Equality — Leadership & Safe Spaces",
    blurb:
      "Women and girls leadership training, legal literacy, and safe community support programs.",
  },
  {
    cause: "cleanWater",
    num: 6,
    title: "Clean Water — Wells & Sanitation",
    blurb:
      "Clean water access, hygiene education, and sanitation infrastructure for rural communities.",
  },
  {
    cause: "affordableEnergy",
    num: 7,
    title: "Affordable Energy — Solar & Efficient Cookstoves",
    blurb:
      "Distributed solar, efficient stoves, and community energy planning for reliable power.",
  },
  {
    cause: "decentWork",
    num: 8,
    title: "Decent Work — Skills & Fair Jobs",
    blurb:
      "Vocational training, job placement support, and youth entrepreneurship incubation.",
  },
  {
    cause: "industry",
    num: 9,
    title: "Industry & Innovation — Makerspaces & Connectivity",
    blurb:
      "Community innovation labs, digital literacy, and small-scale infrastructure upgrades.",
  },
  {
    cause: "reducedInequalities",
    num: 10,
    title: "Reduced Inequalities — Inclusion & Access",
    blurb:
      "Programs for marginalized groups: disability inclusion, migrant support, and equal access to services.",
  },
  {
    cause: "sustainableCities",
    num: 11,
    title: "Sustainable Cities — Waste & Public Space",
    blurb:
      "Urban greening, community recycling, and safer public spaces in dense neighborhoods.",
  },
  {
    cause: "responsibleConsumption",
    num: 12,
    title: "Responsible Consumption — Circular Economy",
    blurb:
      "Waste reduction workshops, repair cafés, and local circular supply chains.",
  },
  {
    cause: "climateAction",
    num: 13,
    title: "Climate Action — Reforestation & Resilience",
    blurb:
      "Tree planting, flood preparedness, and climate-smart agriculture with local partners.",
  },
  {
    cause: "lifeBelowWater",
    num: 14,
    title: "Life Below Water — Coastal & River Health",
    blurb:
      "Mangrove restoration, river clean-ups, and sustainable fisheries awareness.",
  },
  {
    cause: "lifeOnLand",
    num: 15,
    title: "Life On Land — Forests & Biodiversity",
    blurb:
      "Protected area support, anti-illegal logging patrols with communities, and native species planting.",
  },
  {
    cause: "peaceAndJustice",
    num: 16,
    title: "Peace & Justice — Dialogue & Legal Aid",
    blurb:
      "Community mediation, legal aid clinics, and civic education for accountable institutions.",
  },
  {
    cause: "partnerships",
    num: 17,
    title: "Partnerships — Multi-Stakeholder SDG Coalition",
    blurb:
      "Convening NGOs, local government, and businesses for joint SDG implementation and reporting.",
  },
];

function sqlStr(s) {
  return String(s).replace(/'/g, "''");
}

function budgetJsonForSdg(sdgNum) {
  const p1 = 45 + (sdgNum % 6);
  const p2 = 30 + ((sdgNum * 3) % 5);
  const p3 = Math.max(5, 100 - p1 - p2);
  const arr = [
    { label: "Direct programs", percentage: p1 },
    { label: "Local partners", percentage: p2 },
    { label: "Monitoring & admin", percentage: p3 },
  ];
  return JSON.stringify(arr).replace(/'/g, "''");
}

function generate() {
  let sql = `-- ASEAN seed posts: one approved project per UN SDG (1–17) per organization from migration 20260405_add_international_accounts.
-- Each post has Monetary + Volunteer support options (matches app expectations).
-- Org resolved by email: {country}@gov.org.{cc}

`;

  for (const org of ASEAN_ORGS) {
    const orgEmail = `${org.country.toLowerCase()}@gov.org.${org.shorthand}`;
    sql += `-- === ${org.country} (${orgEmail}) ===\n\n`;

    for (const sdg of SDG_TEMPLATES) {
      const postId = randomUUID();
      const optMoneyId = randomUUID();
      const optVolId = randomUUID();
      const projectName = `${org.country} — SDG ${sdg.num}: ${sdg.title}`;
      const description = `${sdg.blurb} Focus: ${org.hub} and surrounding communities; aligned with UN Sustainable Development Goal ${sdg.num}.`;
      const targetAmount = 150000 + sdg.num * 12500 + org.country.length * 800;
      const targetVolunteers = 25 + (sdg.num % 8) * 5;

      sql += `INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '${postId}',
  (SELECT "id" FROM "Organization" WHERE "email" = '${sqlStr(orgEmail)}' LIMIT 1),
  '${sqlStr(projectName)}',
  '${sqlStr(description)}',
  '${budgetJsonForSdg(sdg.num)}'::jsonb,
  ARRAY['${sdg.cause}']::"CauseEnum"[],
  '${sqlStr(org.hub)}',
  'Medium',
  'Approved',
  TIMESTAMP '2026-01-15 00:00:00',
  TIMESTAMP '2027-12-20 23:59:59',
  NULL,
  NULL,
  NOW()
);

INSERT INTO "PostSupportOption" ("id", "postId", "type", "targetAmount", "currentAmount", "targetCount", "currentCount", "status")
VALUES
  ('${optMoneyId}', '${postId}', 'Monetary', ${targetAmount}, 0, NULL, 0, 'Open'),
  ('${optVolId}', '${postId}', 'Volunteer', NULL, 0, ${targetVolunteers}, 0, 'Open');

`;
    }
  }

  const dir = path.join(
    __dirname,
    "prisma",
    "migrations",
    "20260405180000_asean_sdg_posts",
  );
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "migration.sql");
  fs.writeFileSync(file, sql);
  console.log(`Wrote ${file} (${ASEAN_ORGS.length * SDG_TEMPLATES.length} posts)`);
}

generate();
