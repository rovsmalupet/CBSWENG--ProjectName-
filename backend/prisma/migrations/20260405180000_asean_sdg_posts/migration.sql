-- ASEAN seed posts: one approved project per UN SDG (1–17) per organization from migration 20260405_add_international_accounts.
-- Each post has Monetary + Volunteer support options (matches app expectations).
-- Org resolved by email: {country}@gov.org.{cc}

-- === Brunei (brunei@gov.org.bn) ===

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '2a5e9364-57c9-4745-8c1a-e7f1b016c175',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 1: No Poverty — Livelihoods & Emergency Relief',
  'Cash-for-work, savings groups, and emergency assistance for households in extreme poverty. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 1.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['noPoverty']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('2c4de05b-19f4-475a-bbac-c82108e8bd3c', '2a5e9364-57c9-4745-8c1a-e7f1b016c175', 'Monetary', 167300, 0, NULL, 0, 'Open'),
  ('b84ac2af-6e6f-4d31-9906-527d8a8f4723', '2a5e9364-57c9-4745-8c1a-e7f1b016c175', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'a8ae440f-5584-417c-aeff-339a1857e48c',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 2: Zero Hunger — School Meals & Food Security',
  'Nutrition programs, community gardens, and school feeding to reduce hunger and malnutrition. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 2.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['zeroHunger']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('b6baa41c-d3b0-424d-adbf-f366167a04b9', 'a8ae440f-5584-417c-aeff-339a1857e48c', 'Monetary', 179800, 0, NULL, 0, 'Open'),
  ('4c6b807e-74ef-4337-9e77-7559a1b9c902', 'a8ae440f-5584-417c-aeff-339a1857e48c', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'd6599f77-b4fe-4b62-bc0f-61431f5241c1',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 3: Good Health — Clinics & Maternal Care',
  'Mobile health outreach, maternal and child health services, and preventive care campaigns. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 3.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['goodHealth']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('695c3511-470f-44cf-a525-f42375817892', 'd6599f77-b4fe-4b62-bc0f-61431f5241c1', 'Monetary', 192300, 0, NULL, 0, 'Open'),
  ('9f1f48b8-ffea-43c1-9d21-2f949df5b8e9', 'd6599f77-b4fe-4b62-bc0f-61431f5241c1', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '97f79e24-29e8-4d73-8e7f-bfe9f31ea047',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 4: Quality Education — Scholarships & Learning Hubs',
  'Scholarships, after-school learning centers, and teacher training in underserved areas. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 4.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['qualityEducation']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('48e3c0fc-413c-4470-9feb-55d7b966d41b', '97f79e24-29e8-4d73-8e7f-bfe9f31ea047', 'Monetary', 204800, 0, NULL, 0, 'Open'),
  ('50505611-1dcf-41b2-96d0-57cfcc59e932', '97f79e24-29e8-4d73-8e7f-bfe9f31ea047', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '16658dca-0ced-4344-a1dc-51a4c27fe547',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 5: Gender Equality — Leadership & Safe Spaces',
  'Women and girls leadership training, legal literacy, and safe community support programs. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 5.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['genderEquality']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('cb4e8e92-f901-4160-a98c-829a529a189a', '16658dca-0ced-4344-a1dc-51a4c27fe547', 'Monetary', 217300, 0, NULL, 0, 'Open'),
  ('241becc0-63a5-47ab-bf33-faaed54b8c4f', '16658dca-0ced-4344-a1dc-51a4c27fe547', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'ddb7f544-1a41-4a13-8d70-58fc2b5967c2',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 6: Clean Water — Wells & Sanitation',
  'Clean water access, hygiene education, and sanitation infrastructure for rural communities. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 6.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['cleanWater']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('ea85a119-28f7-4af3-84cb-a5dce80508b7', 'ddb7f544-1a41-4a13-8d70-58fc2b5967c2', 'Monetary', 229800, 0, NULL, 0, 'Open'),
  ('59a68cdf-3b03-4027-9261-f48b80816d3d', 'ddb7f544-1a41-4a13-8d70-58fc2b5967c2', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '23418540-4307-485e-a938-3e238b8dcbe3',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 7: Affordable Energy — Solar & Efficient Cookstoves',
  'Distributed solar, efficient stoves, and community energy planning for reliable power. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 7.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":23}]'::jsonb,
  ARRAY['affordableEnergy']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('565e9401-d7d4-4004-9af2-da58708f0aed', '23418540-4307-485e-a938-3e238b8dcbe3', 'Monetary', 242300, 0, NULL, 0, 'Open'),
  ('f52cfe2a-ee05-43a7-8c16-fd7153536d7e', '23418540-4307-485e-a938-3e238b8dcbe3', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'db318e49-5b47-46f2-9d85-bc713d5e85b5',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 8: Decent Work — Skills & Fair Jobs',
  'Vocational training, job placement support, and youth entrepreneurship incubation. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 8.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['decentWork']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('2c64dfe5-9661-4459-898a-179e3b9dfdda', 'db318e49-5b47-46f2-9d85-bc713d5e85b5', 'Monetary', 254800, 0, NULL, 0, 'Open'),
  ('4dbe0cf9-8121-44c9-a73a-1f79a7dfb4bc', 'db318e49-5b47-46f2-9d85-bc713d5e85b5', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'a8b1fd1c-8c48-4d71-9244-b002c8e80c0f',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 9: Industry & Innovation — Makerspaces & Connectivity',
  'Community innovation labs, digital literacy, and small-scale infrastructure upgrades. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 9.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['industry']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('7f73febd-2806-4cad-b70e-2f719d2adaf9', 'a8b1fd1c-8c48-4d71-9244-b002c8e80c0f', 'Monetary', 267300, 0, NULL, 0, 'Open'),
  ('068fd0ab-0cb9-40a0-a541-8364536367d6', 'a8b1fd1c-8c48-4d71-9244-b002c8e80c0f', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'ee1e5343-366f-4c22-977a-f1aab83fbcb6',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 10: Reduced Inequalities — Inclusion & Access',
  'Programs for marginalized groups: disability inclusion, migrant support, and equal access to services. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 10.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['reducedInequalities']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('4b0a2060-e42a-4be3-9bc3-f3212de727b2', 'ee1e5343-366f-4c22-977a-f1aab83fbcb6', 'Monetary', 279800, 0, NULL, 0, 'Open'),
  ('98eee631-5324-4df6-8969-2f017dc1c92e', 'ee1e5343-366f-4c22-977a-f1aab83fbcb6', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '94ab8f73-7bae-4f29-850d-2f2fcab947ec',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 11: Sustainable Cities — Waste & Public Space',
  'Urban greening, community recycling, and safer public spaces in dense neighborhoods. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 11.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":17}]'::jsonb,
  ARRAY['sustainableCities']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('a0d80a69-bd52-45fb-b9b5-08dffac29890', '94ab8f73-7bae-4f29-850d-2f2fcab947ec', 'Monetary', 292300, 0, NULL, 0, 'Open'),
  ('7df419b8-bd98-46da-85c7-283730f92354', '94ab8f73-7bae-4f29-850d-2f2fcab947ec', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '91f8312e-f6a9-4929-ae95-015e987bebc8',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 12: Responsible Consumption — Circular Economy',
  'Waste reduction workshops, repair cafés, and local circular supply chains. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 12.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":24}]'::jsonb,
  ARRAY['responsibleConsumption']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('cea7b695-d5fb-46e2-a43f-349fc43627ae', '91f8312e-f6a9-4929-ae95-015e987bebc8', 'Monetary', 304800, 0, NULL, 0, 'Open'),
  ('d51faa71-1b75-435a-a0b1-f3e0c18d909d', '91f8312e-f6a9-4929-ae95-015e987bebc8', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '84dabda8-159f-48d4-85a4-192e2a6650af',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 13: Climate Action — Reforestation & Resilience',
  'Tree planting, flood preparedness, and climate-smart agriculture with local partners. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 13.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['climateAction']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('805f7d77-d06a-41c2-a7fe-c2c27906a25b', '84dabda8-159f-48d4-85a4-192e2a6650af', 'Monetary', 317300, 0, NULL, 0, 'Open'),
  ('8fc3c596-0608-40b9-a8ba-1833af25e9c4', '84dabda8-159f-48d4-85a4-192e2a6650af', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'fa0767f7-a4b1-463a-904d-5212b90fc893',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 14: Life Below Water — Coastal & River Health',
  'Mangrove restoration, river clean-ups, and sustainable fisheries awareness. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 14.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['lifeBelowWater']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('9e9e883a-c10f-4cc8-b0fa-499278a6cb0e', 'fa0767f7-a4b1-463a-904d-5212b90fc893', 'Monetary', 329800, 0, NULL, 0, 'Open'),
  ('4e9aef63-00c2-4f81-8168-08f8a0a560b5', 'fa0767f7-a4b1-463a-904d-5212b90fc893', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '1b00fc9e-5b14-4893-a8a9-63ed965a712e',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 15: Life On Land — Forests & Biodiversity',
  'Protected area support, anti-illegal logging patrols with communities, and native species planting. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 15.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['lifeOnLand']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('b2c47fad-34cf-42de-bd7d-012ab5ee423b', '1b00fc9e-5b14-4893-a8a9-63ed965a712e', 'Monetary', 342300, 0, NULL, 0, 'Open'),
  ('46108d37-1399-45ac-a763-fbd697958692', '1b00fc9e-5b14-4893-a8a9-63ed965a712e', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'ea61ac43-6a75-4991-bc9c-6d11b0105e82',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 16: Peace & Justice — Dialogue & Legal Aid',
  'Community mediation, legal aid clinics, and civic education for accountable institutions. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 16.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['peaceAndJustice']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('17704d5e-0014-4c95-a6d3-31e3b333c781', 'ea61ac43-6a75-4991-bc9c-6d11b0105e82', 'Monetary', 354800, 0, NULL, 0, 'Open'),
  ('0d21a71c-0edf-4392-891e-48d78babdd9d', 'ea61ac43-6a75-4991-bc9c-6d11b0105e82', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'e10b63ee-2a85-434f-bec9-ac0982743dd0',
  (SELECT "id" FROM "Organization" WHERE "email" = 'brunei@gov.org.bn' LIMIT 1),
  'Brunei — SDG 17: Partnerships — Multi-Stakeholder SDG Coalition',
  'Convening NGOs, local government, and businesses for joint SDG implementation and reporting. Focus: Bandar Seri Begawan and surrounding communities; aligned with UN Sustainable Development Goal 17.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['partnerships']::"CauseEnum"[],
  'Bandar Seri Begawan',
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
  ('085f034c-2489-419b-9b38-91181416a9f8', 'e10b63ee-2a85-434f-bec9-ac0982743dd0', 'Monetary', 367300, 0, NULL, 0, 'Open'),
  ('ef9b79cc-6a79-4f57-8001-a2ef1933ef83', 'e10b63ee-2a85-434f-bec9-ac0982743dd0', 'Volunteer', NULL, 0, 30, 0, 'Open');

-- === Cambodia (cambodia@gov.org.kh) ===

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '82895f3b-1714-4515-8639-e851c1576a6e',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 1: No Poverty — Livelihoods & Emergency Relief',
  'Cash-for-work, savings groups, and emergency assistance for households in extreme poverty. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 1.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['noPoverty']::"CauseEnum"[],
  'Phnom Penh',
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
  ('bd2f298c-f8f7-4858-ba83-58bff5cf44cb', '82895f3b-1714-4515-8639-e851c1576a6e', 'Monetary', 168900, 0, NULL, 0, 'Open'),
  ('d41103b0-0b61-4c01-80b5-a50dc9c4765d', '82895f3b-1714-4515-8639-e851c1576a6e', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '478308fa-dead-43b0-ba47-0e82ba568fed',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 2: Zero Hunger — School Meals & Food Security',
  'Nutrition programs, community gardens, and school feeding to reduce hunger and malnutrition. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 2.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['zeroHunger']::"CauseEnum"[],
  'Phnom Penh',
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
  ('c1266a56-cc95-433d-b1b2-4afcde2e5546', '478308fa-dead-43b0-ba47-0e82ba568fed', 'Monetary', 181400, 0, NULL, 0, 'Open'),
  ('b5f782a8-8935-42bf-975a-5d5efc6948d0', '478308fa-dead-43b0-ba47-0e82ba568fed', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '1d77f5b3-b6db-4240-8211-a9b68900f609',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 3: Good Health — Clinics & Maternal Care',
  'Mobile health outreach, maternal and child health services, and preventive care campaigns. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 3.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['goodHealth']::"CauseEnum"[],
  'Phnom Penh',
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
  ('119a6a7e-e7b0-49af-8eef-f0f9fb2eb94b', '1d77f5b3-b6db-4240-8211-a9b68900f609', 'Monetary', 193900, 0, NULL, 0, 'Open'),
  ('3d65c83a-fc2e-479e-b4fc-0a261baf53ff', '1d77f5b3-b6db-4240-8211-a9b68900f609', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '6771f769-6693-4745-8c4b-7bd6428989c8',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 4: Quality Education — Scholarships & Learning Hubs',
  'Scholarships, after-school learning centers, and teacher training in underserved areas. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 4.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['qualityEducation']::"CauseEnum"[],
  'Phnom Penh',
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
  ('ed349785-0dbd-47ad-b2bd-b82e09ef74d0', '6771f769-6693-4745-8c4b-7bd6428989c8', 'Monetary', 206400, 0, NULL, 0, 'Open'),
  ('32d07e33-7b1e-4e1d-b73c-562a392971a9', '6771f769-6693-4745-8c4b-7bd6428989c8', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'c88f9fae-bc67-4d8d-b3f4-84b333da8aad',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 5: Gender Equality — Leadership & Safe Spaces',
  'Women and girls leadership training, legal literacy, and safe community support programs. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 5.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['genderEquality']::"CauseEnum"[],
  'Phnom Penh',
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
  ('3a02e4f2-25f1-4a6c-986d-67c59acfb772', 'c88f9fae-bc67-4d8d-b3f4-84b333da8aad', 'Monetary', 218900, 0, NULL, 0, 'Open'),
  ('9c60a894-3a0f-4dff-b9c2-348f1bb8e097', 'c88f9fae-bc67-4d8d-b3f4-84b333da8aad', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '0ddcc362-9501-4132-a353-498af5a7d0be',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 6: Clean Water — Wells & Sanitation',
  'Clean water access, hygiene education, and sanitation infrastructure for rural communities. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 6.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['cleanWater']::"CauseEnum"[],
  'Phnom Penh',
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
  ('291c870a-6416-4024-ae44-b9f8f70ac745', '0ddcc362-9501-4132-a353-498af5a7d0be', 'Monetary', 231400, 0, NULL, 0, 'Open'),
  ('ab10cae5-12cd-4ea4-9f9c-a2b4fc81539a', '0ddcc362-9501-4132-a353-498af5a7d0be', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'e9360ae8-5897-458f-8be9-a67a159a362d',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 7: Affordable Energy — Solar & Efficient Cookstoves',
  'Distributed solar, efficient stoves, and community energy planning for reliable power. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 7.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":23}]'::jsonb,
  ARRAY['affordableEnergy']::"CauseEnum"[],
  'Phnom Penh',
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
  ('d2844654-7eb9-4369-a47c-4e412c5d2146', 'e9360ae8-5897-458f-8be9-a67a159a362d', 'Monetary', 243900, 0, NULL, 0, 'Open'),
  ('4ac44d50-af53-49cc-8ed9-2fb02f5c2c72', 'e9360ae8-5897-458f-8be9-a67a159a362d', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'b57ff3bf-985a-4280-8e17-1645e8bdf314',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 8: Decent Work — Skills & Fair Jobs',
  'Vocational training, job placement support, and youth entrepreneurship incubation. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 8.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['decentWork']::"CauseEnum"[],
  'Phnom Penh',
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
  ('f1c52351-b295-408f-a5c5-7a0f3b84a41d', 'b57ff3bf-985a-4280-8e17-1645e8bdf314', 'Monetary', 256400, 0, NULL, 0, 'Open'),
  ('0a3b8c56-3124-4a14-9e1f-73ac8de2b182', 'b57ff3bf-985a-4280-8e17-1645e8bdf314', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'e25b7730-65b3-47be-81dd-84074216de8f',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 9: Industry & Innovation — Makerspaces & Connectivity',
  'Community innovation labs, digital literacy, and small-scale infrastructure upgrades. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 9.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['industry']::"CauseEnum"[],
  'Phnom Penh',
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
  ('27012fb0-afe2-4f24-8142-4a337e13fb7c', 'e25b7730-65b3-47be-81dd-84074216de8f', 'Monetary', 268900, 0, NULL, 0, 'Open'),
  ('da9c7956-f838-4971-a5bb-b1644bf4e82b', 'e25b7730-65b3-47be-81dd-84074216de8f', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '2fc4fa55-4f42-42e8-a692-7ab0aa3b52f5',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 10: Reduced Inequalities — Inclusion & Access',
  'Programs for marginalized groups: disability inclusion, migrant support, and equal access to services. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 10.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['reducedInequalities']::"CauseEnum"[],
  'Phnom Penh',
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
  ('5773bb38-1d98-4bf8-b501-4eb8b073996f', '2fc4fa55-4f42-42e8-a692-7ab0aa3b52f5', 'Monetary', 281400, 0, NULL, 0, 'Open'),
  ('5ac232c5-054f-4bc6-8e71-774c1d449d93', '2fc4fa55-4f42-42e8-a692-7ab0aa3b52f5', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '33456cdc-00b8-4a9c-bbab-2a3c81cb3e35',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 11: Sustainable Cities — Waste & Public Space',
  'Urban greening, community recycling, and safer public spaces in dense neighborhoods. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 11.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":17}]'::jsonb,
  ARRAY['sustainableCities']::"CauseEnum"[],
  'Phnom Penh',
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
  ('4b31548e-80b0-421e-b5e6-211da3d5095f', '33456cdc-00b8-4a9c-bbab-2a3c81cb3e35', 'Monetary', 293900, 0, NULL, 0, 'Open'),
  ('e68f274e-f1eb-4be7-9cc9-006c31b2ec3f', '33456cdc-00b8-4a9c-bbab-2a3c81cb3e35', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'd9e1fe59-9429-456e-91a7-96dedc3bb51d',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 12: Responsible Consumption — Circular Economy',
  'Waste reduction workshops, repair cafés, and local circular supply chains. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 12.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":24}]'::jsonb,
  ARRAY['responsibleConsumption']::"CauseEnum"[],
  'Phnom Penh',
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
  ('402592bb-7632-4645-af74-b3bc97139db5', 'd9e1fe59-9429-456e-91a7-96dedc3bb51d', 'Monetary', 306400, 0, NULL, 0, 'Open'),
  ('8ad49aa4-6f70-4f03-8b0d-818c9618441d', 'd9e1fe59-9429-456e-91a7-96dedc3bb51d', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '12f67103-56f6-4d5d-a8bf-3a8356a72b83',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 13: Climate Action — Reforestation & Resilience',
  'Tree planting, flood preparedness, and climate-smart agriculture with local partners. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 13.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['climateAction']::"CauseEnum"[],
  'Phnom Penh',
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
  ('faf0a368-895a-4952-a4df-f91175786e4b', '12f67103-56f6-4d5d-a8bf-3a8356a72b83', 'Monetary', 318900, 0, NULL, 0, 'Open'),
  ('b2908d42-12b6-43d9-8f76-3cde9c57d45c', '12f67103-56f6-4d5d-a8bf-3a8356a72b83', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '9a34c8a5-09f4-44d4-8da9-74420002bbf8',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 14: Life Below Water — Coastal & River Health',
  'Mangrove restoration, river clean-ups, and sustainable fisheries awareness. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 14.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['lifeBelowWater']::"CauseEnum"[],
  'Phnom Penh',
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
  ('7b67ac24-308d-44cc-a38d-16e184e8ff40', '9a34c8a5-09f4-44d4-8da9-74420002bbf8', 'Monetary', 331400, 0, NULL, 0, 'Open'),
  ('fada24c0-0f1d-4ba9-98bb-c2c053272dab', '9a34c8a5-09f4-44d4-8da9-74420002bbf8', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '39045dad-231c-4339-a782-40cbe1a1ec74',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 15: Life On Land — Forests & Biodiversity',
  'Protected area support, anti-illegal logging patrols with communities, and native species planting. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 15.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['lifeOnLand']::"CauseEnum"[],
  'Phnom Penh',
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
  ('6450b344-2ab0-4e2e-ae57-dfc359b116b2', '39045dad-231c-4339-a782-40cbe1a1ec74', 'Monetary', 343900, 0, NULL, 0, 'Open'),
  ('c30ba869-c03a-457a-b2e5-93038b75c015', '39045dad-231c-4339-a782-40cbe1a1ec74', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '64c01747-ab39-409d-a294-14582d497bcf',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 16: Peace & Justice — Dialogue & Legal Aid',
  'Community mediation, legal aid clinics, and civic education for accountable institutions. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 16.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['peaceAndJustice']::"CauseEnum"[],
  'Phnom Penh',
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
  ('d7141c38-bc9c-465f-bdee-93ba09ee20de', '64c01747-ab39-409d-a294-14582d497bcf', 'Monetary', 356400, 0, NULL, 0, 'Open'),
  ('d372fb5f-658e-4859-904d-b645829b74a7', '64c01747-ab39-409d-a294-14582d497bcf', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '08bdd365-d7eb-441b-8c55-10db3aee3b1c',
  (SELECT "id" FROM "Organization" WHERE "email" = 'cambodia@gov.org.kh' LIMIT 1),
  'Cambodia — SDG 17: Partnerships — Multi-Stakeholder SDG Coalition',
  'Convening NGOs, local government, and businesses for joint SDG implementation and reporting. Focus: Phnom Penh and surrounding communities; aligned with UN Sustainable Development Goal 17.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['partnerships']::"CauseEnum"[],
  'Phnom Penh',
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
  ('6b27c805-53fa-46cf-8e2d-dd8c33405ba5', '08bdd365-d7eb-441b-8c55-10db3aee3b1c', 'Monetary', 368900, 0, NULL, 0, 'Open'),
  ('6e493f81-182a-46ab-a5e5-aa7dd33f8889', '08bdd365-d7eb-441b-8c55-10db3aee3b1c', 'Volunteer', NULL, 0, 30, 0, 'Open');

-- === Indonesia (indonesia@gov.org.id) ===

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'b1651986-0db8-40b6-954e-d2aad9da9ed5',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 1: No Poverty — Livelihoods & Emergency Relief',
  'Cash-for-work, savings groups, and emergency assistance for households in extreme poverty. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 1.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['noPoverty']::"CauseEnum"[],
  'Jakarta',
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
  ('7c51404b-bea0-4612-b16e-f04f9b44ce6c', 'b1651986-0db8-40b6-954e-d2aad9da9ed5', 'Monetary', 169700, 0, NULL, 0, 'Open'),
  ('6f35351c-f732-4dfe-9ba4-1d5419e4b4d9', 'b1651986-0db8-40b6-954e-d2aad9da9ed5', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'fa402743-f3fa-4444-a619-fc053424eef4',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 2: Zero Hunger — School Meals & Food Security',
  'Nutrition programs, community gardens, and school feeding to reduce hunger and malnutrition. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 2.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['zeroHunger']::"CauseEnum"[],
  'Jakarta',
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
  ('71750e2d-8f88-4bc1-9dff-682ed8c8cd72', 'fa402743-f3fa-4444-a619-fc053424eef4', 'Monetary', 182200, 0, NULL, 0, 'Open'),
  ('ee30878d-5132-4009-805b-ae433cb49c3c', 'fa402743-f3fa-4444-a619-fc053424eef4', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'f6f04688-95d8-4696-8084-4ea02b5a3ece',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 3: Good Health — Clinics & Maternal Care',
  'Mobile health outreach, maternal and child health services, and preventive care campaigns. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 3.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['goodHealth']::"CauseEnum"[],
  'Jakarta',
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
  ('3f8087de-57ae-4eae-bea7-c5750374df7b', 'f6f04688-95d8-4696-8084-4ea02b5a3ece', 'Monetary', 194700, 0, NULL, 0, 'Open'),
  ('472da048-d212-4dc2-8510-7ac9b1771b31', 'f6f04688-95d8-4696-8084-4ea02b5a3ece', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '11fa7478-5f36-40aa-a0b0-3775c221bd28',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 4: Quality Education — Scholarships & Learning Hubs',
  'Scholarships, after-school learning centers, and teacher training in underserved areas. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 4.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['qualityEducation']::"CauseEnum"[],
  'Jakarta',
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
  ('2d6c8705-989f-486f-9cc8-8de165e6fd77', '11fa7478-5f36-40aa-a0b0-3775c221bd28', 'Monetary', 207200, 0, NULL, 0, 'Open'),
  ('2021d391-91ac-42ea-9782-c875f330f2b6', '11fa7478-5f36-40aa-a0b0-3775c221bd28', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '62977256-b792-41f1-ada8-e0ef5dc32165',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 5: Gender Equality — Leadership & Safe Spaces',
  'Women and girls leadership training, legal literacy, and safe community support programs. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 5.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['genderEquality']::"CauseEnum"[],
  'Jakarta',
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
  ('e51aceae-3788-4336-8e5f-5d2c0191828d', '62977256-b792-41f1-ada8-e0ef5dc32165', 'Monetary', 219700, 0, NULL, 0, 'Open'),
  ('ccbfd555-7fbf-45d0-9e58-150e11201fd9', '62977256-b792-41f1-ada8-e0ef5dc32165', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '1baf2d62-5940-4406-a13f-f094d662aeec',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 6: Clean Water — Wells & Sanitation',
  'Clean water access, hygiene education, and sanitation infrastructure for rural communities. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 6.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['cleanWater']::"CauseEnum"[],
  'Jakarta',
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
  ('2ab6dfe3-e898-49bc-a635-786e2add27d7', '1baf2d62-5940-4406-a13f-f094d662aeec', 'Monetary', 232200, 0, NULL, 0, 'Open'),
  ('2500a36a-e839-4971-9243-90bd185657b5', '1baf2d62-5940-4406-a13f-f094d662aeec', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '29854ea9-fa15-48b1-9a49-d1f3a85022b2',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 7: Affordable Energy — Solar & Efficient Cookstoves',
  'Distributed solar, efficient stoves, and community energy planning for reliable power. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 7.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":23}]'::jsonb,
  ARRAY['affordableEnergy']::"CauseEnum"[],
  'Jakarta',
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
  ('3d9f1f65-b344-4790-a12d-5b5d5f3ad741', '29854ea9-fa15-48b1-9a49-d1f3a85022b2', 'Monetary', 244700, 0, NULL, 0, 'Open'),
  ('ecdbf5f6-43bd-4db0-8bd0-2b0995f0794d', '29854ea9-fa15-48b1-9a49-d1f3a85022b2', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '91199769-55aa-462e-bff8-8e811d44529b',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 8: Decent Work — Skills & Fair Jobs',
  'Vocational training, job placement support, and youth entrepreneurship incubation. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 8.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['decentWork']::"CauseEnum"[],
  'Jakarta',
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
  ('17126f17-570a-47aa-8ae9-1dac9da1332d', '91199769-55aa-462e-bff8-8e811d44529b', 'Monetary', 257200, 0, NULL, 0, 'Open'),
  ('6cfc295b-8a86-486e-b96c-9a711e777ff1', '91199769-55aa-462e-bff8-8e811d44529b', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '3d01173e-17bf-4155-b65a-a7cd84b9c7f6',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 9: Industry & Innovation — Makerspaces & Connectivity',
  'Community innovation labs, digital literacy, and small-scale infrastructure upgrades. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 9.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['industry']::"CauseEnum"[],
  'Jakarta',
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
  ('16409ef9-4614-4bbb-935c-9a0024426f5d', '3d01173e-17bf-4155-b65a-a7cd84b9c7f6', 'Monetary', 269700, 0, NULL, 0, 'Open'),
  ('14177e57-0ed8-4119-80f6-1afb4c8b4ac6', '3d01173e-17bf-4155-b65a-a7cd84b9c7f6', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'cbe62002-968d-4784-9d50-ad78ce65c107',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 10: Reduced Inequalities — Inclusion & Access',
  'Programs for marginalized groups: disability inclusion, migrant support, and equal access to services. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 10.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['reducedInequalities']::"CauseEnum"[],
  'Jakarta',
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
  ('3a91bf36-03b8-4bd1-bbb2-92b7e22eaa99', 'cbe62002-968d-4784-9d50-ad78ce65c107', 'Monetary', 282200, 0, NULL, 0, 'Open'),
  ('f18e0229-1620-458e-bfef-88a867d28100', 'cbe62002-968d-4784-9d50-ad78ce65c107', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '2beb1621-bb85-44de-a877-395fc6d0900e',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 11: Sustainable Cities — Waste & Public Space',
  'Urban greening, community recycling, and safer public spaces in dense neighborhoods. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 11.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":17}]'::jsonb,
  ARRAY['sustainableCities']::"CauseEnum"[],
  'Jakarta',
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
  ('4e7fd679-22db-4cdd-a309-7bd05f550a17', '2beb1621-bb85-44de-a877-395fc6d0900e', 'Monetary', 294700, 0, NULL, 0, 'Open'),
  ('fd4e3616-5bef-4f2b-91bb-e930dd2c3ab0', '2beb1621-bb85-44de-a877-395fc6d0900e', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '0fafc881-2904-4ebb-b3a7-7d1e5374ad3d',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 12: Responsible Consumption — Circular Economy',
  'Waste reduction workshops, repair cafés, and local circular supply chains. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 12.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":24}]'::jsonb,
  ARRAY['responsibleConsumption']::"CauseEnum"[],
  'Jakarta',
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
  ('5fd7b095-2cc9-44b4-a538-f5f4523dbfc4', '0fafc881-2904-4ebb-b3a7-7d1e5374ad3d', 'Monetary', 307200, 0, NULL, 0, 'Open'),
  ('35c9bf65-be80-4ba6-8d9f-ad114eb2ea87', '0fafc881-2904-4ebb-b3a7-7d1e5374ad3d', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '6dfa843c-94e9-4fb7-aab5-f4c35c55e2c1',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 13: Climate Action — Reforestation & Resilience',
  'Tree planting, flood preparedness, and climate-smart agriculture with local partners. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 13.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['climateAction']::"CauseEnum"[],
  'Jakarta',
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
  ('e0ad562f-44b3-4452-b22d-2e0f03bc2617', '6dfa843c-94e9-4fb7-aab5-f4c35c55e2c1', 'Monetary', 319700, 0, NULL, 0, 'Open'),
  ('55d101b9-be5b-4f53-b409-42b4e8cfa634', '6dfa843c-94e9-4fb7-aab5-f4c35c55e2c1', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'd6b07b50-3889-4a32-a0d1-551dff52dbf0',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 14: Life Below Water — Coastal & River Health',
  'Mangrove restoration, river clean-ups, and sustainable fisheries awareness. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 14.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['lifeBelowWater']::"CauseEnum"[],
  'Jakarta',
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
  ('0fd6648c-59bd-4e31-806f-ae4596be5e03', 'd6b07b50-3889-4a32-a0d1-551dff52dbf0', 'Monetary', 332200, 0, NULL, 0, 'Open'),
  ('bcf76679-3498-45fd-b00e-2145e39dc62a', 'd6b07b50-3889-4a32-a0d1-551dff52dbf0', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '73e7125c-8702-47e8-a1d8-0a700156422d',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 15: Life On Land — Forests & Biodiversity',
  'Protected area support, anti-illegal logging patrols with communities, and native species planting. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 15.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['lifeOnLand']::"CauseEnum"[],
  'Jakarta',
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
  ('97ba8b89-6d63-4cef-b5a9-e6c9fd13bb9e', '73e7125c-8702-47e8-a1d8-0a700156422d', 'Monetary', 344700, 0, NULL, 0, 'Open'),
  ('35c968e0-bc32-4f62-b18f-f271bda09463', '73e7125c-8702-47e8-a1d8-0a700156422d', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '2bcddbb3-7d85-4a8d-a3a3-ad94e70b0e52',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 16: Peace & Justice — Dialogue & Legal Aid',
  'Community mediation, legal aid clinics, and civic education for accountable institutions. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 16.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['peaceAndJustice']::"CauseEnum"[],
  'Jakarta',
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
  ('72924ec7-edba-4d1c-a7d4-09bfdcddfdfc', '2bcddbb3-7d85-4a8d-a3a3-ad94e70b0e52', 'Monetary', 357200, 0, NULL, 0, 'Open'),
  ('b0d4cf66-1059-4d78-aa10-4b42f04b6a6f', '2bcddbb3-7d85-4a8d-a3a3-ad94e70b0e52', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '98feae89-74aa-41cc-a781-a913624f703e',
  (SELECT "id" FROM "Organization" WHERE "email" = 'indonesia@gov.org.id' LIMIT 1),
  'Indonesia — SDG 17: Partnerships — Multi-Stakeholder SDG Coalition',
  'Convening NGOs, local government, and businesses for joint SDG implementation and reporting. Focus: Jakarta and surrounding communities; aligned with UN Sustainable Development Goal 17.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['partnerships']::"CauseEnum"[],
  'Jakarta',
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
  ('4e1138c6-13ca-4f0f-b957-f80fb14a3c17', '98feae89-74aa-41cc-a781-a913624f703e', 'Monetary', 369700, 0, NULL, 0, 'Open'),
  ('e4960d6c-2182-4a69-b221-864429b47ac9', '98feae89-74aa-41cc-a781-a913624f703e', 'Volunteer', NULL, 0, 30, 0, 'Open');

-- === Laos (laos@gov.org.la) ===

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '4f35035b-491f-4698-afb9-32cc84f672f8',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 1: No Poverty — Livelihoods & Emergency Relief',
  'Cash-for-work, savings groups, and emergency assistance for households in extreme poverty. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 1.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['noPoverty']::"CauseEnum"[],
  'Vientiane',
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
  ('978468b5-430e-4bf9-976a-c7f1307003d3', '4f35035b-491f-4698-afb9-32cc84f672f8', 'Monetary', 165700, 0, NULL, 0, 'Open'),
  ('099cdfb6-9a88-40c8-a63c-33e75d4d1877', '4f35035b-491f-4698-afb9-32cc84f672f8', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '2ea22bc5-14a9-45e2-a53e-762f1757509a',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 2: Zero Hunger — School Meals & Food Security',
  'Nutrition programs, community gardens, and school feeding to reduce hunger and malnutrition. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 2.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['zeroHunger']::"CauseEnum"[],
  'Vientiane',
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
  ('7b08fb8e-10f4-472f-8181-120e7462efaa', '2ea22bc5-14a9-45e2-a53e-762f1757509a', 'Monetary', 178200, 0, NULL, 0, 'Open'),
  ('5996a61c-7061-4afb-8332-0ed670eb9768', '2ea22bc5-14a9-45e2-a53e-762f1757509a', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '72ac7afb-4552-4367-930c-0435dfe27f05',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 3: Good Health — Clinics & Maternal Care',
  'Mobile health outreach, maternal and child health services, and preventive care campaigns. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 3.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['goodHealth']::"CauseEnum"[],
  'Vientiane',
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
  ('eea5a194-48cc-4f87-b841-aec2b11404c1', '72ac7afb-4552-4367-930c-0435dfe27f05', 'Monetary', 190700, 0, NULL, 0, 'Open'),
  ('ccf92b92-cbc3-45ef-8282-fd7f443b4b5f', '72ac7afb-4552-4367-930c-0435dfe27f05', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '3cb7d32a-2415-416b-9964-4d518f21e724',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 4: Quality Education — Scholarships & Learning Hubs',
  'Scholarships, after-school learning centers, and teacher training in underserved areas. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 4.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['qualityEducation']::"CauseEnum"[],
  'Vientiane',
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
  ('658556ee-c5a1-489b-987e-17f101284d4c', '3cb7d32a-2415-416b-9964-4d518f21e724', 'Monetary', 203200, 0, NULL, 0, 'Open'),
  ('bff075a5-e91e-4d2b-8e39-3154b4eab6d9', '3cb7d32a-2415-416b-9964-4d518f21e724', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'b132a74d-5776-4115-921c-f589cbaf17f2',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 5: Gender Equality — Leadership & Safe Spaces',
  'Women and girls leadership training, legal literacy, and safe community support programs. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 5.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['genderEquality']::"CauseEnum"[],
  'Vientiane',
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
  ('e2dfd3eb-6719-4996-a8f1-cca28a3b3839', 'b132a74d-5776-4115-921c-f589cbaf17f2', 'Monetary', 215700, 0, NULL, 0, 'Open'),
  ('f9cb59c2-9915-4c8d-9d09-ecc30b4f17e5', 'b132a74d-5776-4115-921c-f589cbaf17f2', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '5ab06ab1-6cb2-4006-bd1d-eea3104fb757',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 6: Clean Water — Wells & Sanitation',
  'Clean water access, hygiene education, and sanitation infrastructure for rural communities. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 6.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['cleanWater']::"CauseEnum"[],
  'Vientiane',
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
  ('5221fb39-d5e4-41f3-9139-31c430e2afbc', '5ab06ab1-6cb2-4006-bd1d-eea3104fb757', 'Monetary', 228200, 0, NULL, 0, 'Open'),
  ('8b465890-784c-4d0a-9778-956fdd533d45', '5ab06ab1-6cb2-4006-bd1d-eea3104fb757', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '90275294-297b-4341-9cbe-1ec97fda33bc',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 7: Affordable Energy — Solar & Efficient Cookstoves',
  'Distributed solar, efficient stoves, and community energy planning for reliable power. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 7.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":23}]'::jsonb,
  ARRAY['affordableEnergy']::"CauseEnum"[],
  'Vientiane',
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
  ('f28defbc-db7e-4c1b-8988-f032cbb7315b', '90275294-297b-4341-9cbe-1ec97fda33bc', 'Monetary', 240700, 0, NULL, 0, 'Open'),
  ('90c7bb04-3d20-4c88-9253-a662f0506078', '90275294-297b-4341-9cbe-1ec97fda33bc', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'f93e698d-6694-40dc-b4b3-531e28525e3b',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 8: Decent Work — Skills & Fair Jobs',
  'Vocational training, job placement support, and youth entrepreneurship incubation. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 8.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['decentWork']::"CauseEnum"[],
  'Vientiane',
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
  ('acca1622-3a70-4a53-956e-4d980c4ade1b', 'f93e698d-6694-40dc-b4b3-531e28525e3b', 'Monetary', 253200, 0, NULL, 0, 'Open'),
  ('49fb6bd8-cac2-4135-859c-27053b272836', 'f93e698d-6694-40dc-b4b3-531e28525e3b', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '378e1e71-edb9-4f9e-9067-1a6f33a127a2',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 9: Industry & Innovation — Makerspaces & Connectivity',
  'Community innovation labs, digital literacy, and small-scale infrastructure upgrades. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 9.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['industry']::"CauseEnum"[],
  'Vientiane',
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
  ('c2113571-e90a-4262-bbd7-d0979b515ebe', '378e1e71-edb9-4f9e-9067-1a6f33a127a2', 'Monetary', 265700, 0, NULL, 0, 'Open'),
  ('4000f614-b324-4a75-9d5c-d3526246b30b', '378e1e71-edb9-4f9e-9067-1a6f33a127a2', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'c94fbe36-03db-4a82-aec2-a80262d778cf',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 10: Reduced Inequalities — Inclusion & Access',
  'Programs for marginalized groups: disability inclusion, migrant support, and equal access to services. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 10.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['reducedInequalities']::"CauseEnum"[],
  'Vientiane',
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
  ('354a6e35-4f7d-403b-8996-e9ec64a0c828', 'c94fbe36-03db-4a82-aec2-a80262d778cf', 'Monetary', 278200, 0, NULL, 0, 'Open'),
  ('6c8602ff-15b8-483a-80e2-7c3212fd6546', 'c94fbe36-03db-4a82-aec2-a80262d778cf', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'c5353c84-a53a-4a95-826f-684a20ab3918',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 11: Sustainable Cities — Waste & Public Space',
  'Urban greening, community recycling, and safer public spaces in dense neighborhoods. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 11.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":17}]'::jsonb,
  ARRAY['sustainableCities']::"CauseEnum"[],
  'Vientiane',
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
  ('3f8ecd1a-cb38-4745-93f4-ffbf3c09444f', 'c5353c84-a53a-4a95-826f-684a20ab3918', 'Monetary', 290700, 0, NULL, 0, 'Open'),
  ('592749dd-de18-4c8f-bf0f-7fa31440a00b', 'c5353c84-a53a-4a95-826f-684a20ab3918', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '0478be40-275a-4372-b36b-38586cfc27b1',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 12: Responsible Consumption — Circular Economy',
  'Waste reduction workshops, repair cafés, and local circular supply chains. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 12.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":24}]'::jsonb,
  ARRAY['responsibleConsumption']::"CauseEnum"[],
  'Vientiane',
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
  ('5645f6d5-0d30-47fb-9b57-d559c178720b', '0478be40-275a-4372-b36b-38586cfc27b1', 'Monetary', 303200, 0, NULL, 0, 'Open'),
  ('1f9c3895-b2df-4874-8bb7-9e75d4ac280a', '0478be40-275a-4372-b36b-38586cfc27b1', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '7f627631-7b07-41d9-888f-2b614e9472ed',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 13: Climate Action — Reforestation & Resilience',
  'Tree planting, flood preparedness, and climate-smart agriculture with local partners. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 13.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['climateAction']::"CauseEnum"[],
  'Vientiane',
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
  ('1e784ede-81a7-47b8-99a6-20771618ecc7', '7f627631-7b07-41d9-888f-2b614e9472ed', 'Monetary', 315700, 0, NULL, 0, 'Open'),
  ('e721e303-ef58-4656-8734-1f2df3b5dc31', '7f627631-7b07-41d9-888f-2b614e9472ed', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'e98e28bf-76ea-442e-b1ff-dc1f8f20568a',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 14: Life Below Water — Coastal & River Health',
  'Mangrove restoration, river clean-ups, and sustainable fisheries awareness. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 14.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['lifeBelowWater']::"CauseEnum"[],
  'Vientiane',
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
  ('0ca0d2b7-7d55-4a44-b016-3171ab9dfcaa', 'e98e28bf-76ea-442e-b1ff-dc1f8f20568a', 'Monetary', 328200, 0, NULL, 0, 'Open'),
  ('44ae1d76-7de9-4bda-ad0a-7716d509d508', 'e98e28bf-76ea-442e-b1ff-dc1f8f20568a', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'e7455028-bbd6-480d-962a-eb8ffd404705',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 15: Life On Land — Forests & Biodiversity',
  'Protected area support, anti-illegal logging patrols with communities, and native species planting. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 15.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['lifeOnLand']::"CauseEnum"[],
  'Vientiane',
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
  ('10313e14-8d8d-4131-97d5-e413234cf30e', 'e7455028-bbd6-480d-962a-eb8ffd404705', 'Monetary', 340700, 0, NULL, 0, 'Open'),
  ('1c1e1bd2-f47f-4c4b-8ff1-1f3562336f52', 'e7455028-bbd6-480d-962a-eb8ffd404705', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '64f5c307-389b-4ca5-a0f8-6726c32bd1c5',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 16: Peace & Justice — Dialogue & Legal Aid',
  'Community mediation, legal aid clinics, and civic education for accountable institutions. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 16.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['peaceAndJustice']::"CauseEnum"[],
  'Vientiane',
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
  ('427acc71-590f-4685-8cd8-82c81a8c9128', '64f5c307-389b-4ca5-a0f8-6726c32bd1c5', 'Monetary', 353200, 0, NULL, 0, 'Open'),
  ('3c9b5b28-e322-48fe-880c-8da28cf508c6', '64f5c307-389b-4ca5-a0f8-6726c32bd1c5', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '2a9006a8-5648-414d-8934-6302eee2c315',
  (SELECT "id" FROM "Organization" WHERE "email" = 'laos@gov.org.la' LIMIT 1),
  'Laos — SDG 17: Partnerships — Multi-Stakeholder SDG Coalition',
  'Convening NGOs, local government, and businesses for joint SDG implementation and reporting. Focus: Vientiane and surrounding communities; aligned with UN Sustainable Development Goal 17.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['partnerships']::"CauseEnum"[],
  'Vientiane',
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
  ('1ae11c2b-4420-4f18-9aef-a4b7ebb1bd9b', '2a9006a8-5648-414d-8934-6302eee2c315', 'Monetary', 365700, 0, NULL, 0, 'Open'),
  ('a8be3dd9-93d9-47b4-a121-207d9ac24613', '2a9006a8-5648-414d-8934-6302eee2c315', 'Volunteer', NULL, 0, 30, 0, 'Open');

-- === Malaysia (malaysia@gov.org.my) ===

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '4a89d5ba-0fb0-4964-b38b-182c0bdd8aeb',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 1: No Poverty — Livelihoods & Emergency Relief',
  'Cash-for-work, savings groups, and emergency assistance for households in extreme poverty. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 1.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['noPoverty']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('d8f45eb8-0b1f-405c-8ba9-80e7f431f594', '4a89d5ba-0fb0-4964-b38b-182c0bdd8aeb', 'Monetary', 168900, 0, NULL, 0, 'Open'),
  ('125aeb56-4fb7-4f4d-9c22-6b7bff6ca756', '4a89d5ba-0fb0-4964-b38b-182c0bdd8aeb', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '13cf352b-fae3-464d-ae7f-584fdb67ef98',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 2: Zero Hunger — School Meals & Food Security',
  'Nutrition programs, community gardens, and school feeding to reduce hunger and malnutrition. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 2.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['zeroHunger']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('b7890af2-bd87-4e9a-8c4b-2b96ae1a8351', '13cf352b-fae3-464d-ae7f-584fdb67ef98', 'Monetary', 181400, 0, NULL, 0, 'Open'),
  ('3102118e-92a7-4c32-8d12-549ba6f3621a', '13cf352b-fae3-464d-ae7f-584fdb67ef98', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '042b4c6d-a675-4b1d-9800-6f797d0b2f6d',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 3: Good Health — Clinics & Maternal Care',
  'Mobile health outreach, maternal and child health services, and preventive care campaigns. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 3.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['goodHealth']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('0f0e08bc-3ff2-487d-9680-b25b6ceab6b6', '042b4c6d-a675-4b1d-9800-6f797d0b2f6d', 'Monetary', 193900, 0, NULL, 0, 'Open'),
  ('13ae56ad-a8b9-4e71-9d0b-b5730da35511', '042b4c6d-a675-4b1d-9800-6f797d0b2f6d', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'a71f9105-4628-458d-97cb-79a28b1c9c57',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 4: Quality Education — Scholarships & Learning Hubs',
  'Scholarships, after-school learning centers, and teacher training in underserved areas. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 4.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['qualityEducation']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('f1bf40c2-faf6-486b-b736-f887e4814937', 'a71f9105-4628-458d-97cb-79a28b1c9c57', 'Monetary', 206400, 0, NULL, 0, 'Open'),
  ('089fe027-a0a8-47df-a255-02ce3faef6a1', 'a71f9105-4628-458d-97cb-79a28b1c9c57', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'e25aa2f0-0579-4f97-9e66-d1ff252c5514',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 5: Gender Equality — Leadership & Safe Spaces',
  'Women and girls leadership training, legal literacy, and safe community support programs. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 5.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['genderEquality']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('5c929d61-d7f4-469a-acb6-f2dc62d129db', 'e25aa2f0-0579-4f97-9e66-d1ff252c5514', 'Monetary', 218900, 0, NULL, 0, 'Open'),
  ('be8576d0-6b7e-47e8-813c-5516a816bc3a', 'e25aa2f0-0579-4f97-9e66-d1ff252c5514', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '4539d93c-57ed-430e-9099-3362df053b8b',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 6: Clean Water — Wells & Sanitation',
  'Clean water access, hygiene education, and sanitation infrastructure for rural communities. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 6.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['cleanWater']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('284ae50b-03b4-416f-8da0-2bbcda0090d0', '4539d93c-57ed-430e-9099-3362df053b8b', 'Monetary', 231400, 0, NULL, 0, 'Open'),
  ('9d2ef84c-2b0f-457f-9112-768dcb44cb1f', '4539d93c-57ed-430e-9099-3362df053b8b', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'a637c592-04e9-4235-af7e-54d3a798fec5',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 7: Affordable Energy — Solar & Efficient Cookstoves',
  'Distributed solar, efficient stoves, and community energy planning for reliable power. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 7.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":23}]'::jsonb,
  ARRAY['affordableEnergy']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('c9846e68-8804-49c5-892f-751d6d1a4376', 'a637c592-04e9-4235-af7e-54d3a798fec5', 'Monetary', 243900, 0, NULL, 0, 'Open'),
  ('90b46b20-e660-47b9-afb2-ae4ac73e0781', 'a637c592-04e9-4235-af7e-54d3a798fec5', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '3cb72350-899d-468e-a540-abcb0d916569',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 8: Decent Work — Skills & Fair Jobs',
  'Vocational training, job placement support, and youth entrepreneurship incubation. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 8.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['decentWork']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('97cf513c-4729-402c-880c-097af62cc085', '3cb72350-899d-468e-a540-abcb0d916569', 'Monetary', 256400, 0, NULL, 0, 'Open'),
  ('46f2b023-c031-4ec3-8f8e-b6207ab37766', '3cb72350-899d-468e-a540-abcb0d916569', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'f0e49573-82ad-450b-9fa6-a283f9969e38',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 9: Industry & Innovation — Makerspaces & Connectivity',
  'Community innovation labs, digital literacy, and small-scale infrastructure upgrades. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 9.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['industry']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('e0681326-d6fd-436b-8514-0a1d733206a2', 'f0e49573-82ad-450b-9fa6-a283f9969e38', 'Monetary', 268900, 0, NULL, 0, 'Open'),
  ('2596125e-8886-45fe-aecd-fd46753ba3c4', 'f0e49573-82ad-450b-9fa6-a283f9969e38', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '12457ec9-70d1-40c5-9c46-f878e3d1de84',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 10: Reduced Inequalities — Inclusion & Access',
  'Programs for marginalized groups: disability inclusion, migrant support, and equal access to services. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 10.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['reducedInequalities']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('21889666-191d-4102-a2da-92419a22a015', '12457ec9-70d1-40c5-9c46-f878e3d1de84', 'Monetary', 281400, 0, NULL, 0, 'Open'),
  ('69ab9c71-63ee-4428-a92a-33eed16520b7', '12457ec9-70d1-40c5-9c46-f878e3d1de84', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '7714acb2-b81b-4c23-b7fe-10b97e51793e',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 11: Sustainable Cities — Waste & Public Space',
  'Urban greening, community recycling, and safer public spaces in dense neighborhoods. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 11.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":17}]'::jsonb,
  ARRAY['sustainableCities']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('eaa040a7-82ec-42ec-9d78-27701af6a138', '7714acb2-b81b-4c23-b7fe-10b97e51793e', 'Monetary', 293900, 0, NULL, 0, 'Open'),
  ('1f9eab91-c31c-4204-a1ce-aa62f11db6ae', '7714acb2-b81b-4c23-b7fe-10b97e51793e', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '1171409c-05c4-4069-b6c0-abb3e995fea5',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 12: Responsible Consumption — Circular Economy',
  'Waste reduction workshops, repair cafés, and local circular supply chains. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 12.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":24}]'::jsonb,
  ARRAY['responsibleConsumption']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('ae88beed-6532-4fff-864e-b815d1261c21', '1171409c-05c4-4069-b6c0-abb3e995fea5', 'Monetary', 306400, 0, NULL, 0, 'Open'),
  ('9d1db00e-1f40-4a9c-bc2b-dda1b4cad601', '1171409c-05c4-4069-b6c0-abb3e995fea5', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'bb57b4c8-d129-4e5b-b236-356b163288cb',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 13: Climate Action — Reforestation & Resilience',
  'Tree planting, flood preparedness, and climate-smart agriculture with local partners. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 13.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['climateAction']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('f25da0b0-f552-4a09-82d2-14be14d440f4', 'bb57b4c8-d129-4e5b-b236-356b163288cb', 'Monetary', 318900, 0, NULL, 0, 'Open'),
  ('959e8e39-353d-4ea4-82b7-4686f6278d39', 'bb57b4c8-d129-4e5b-b236-356b163288cb', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'cf262d52-8e51-45c4-a8aa-f7f42e5cc259',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 14: Life Below Water — Coastal & River Health',
  'Mangrove restoration, river clean-ups, and sustainable fisheries awareness. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 14.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['lifeBelowWater']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('91804cec-38b0-4e51-87f3-13ee71041d37', 'cf262d52-8e51-45c4-a8aa-f7f42e5cc259', 'Monetary', 331400, 0, NULL, 0, 'Open'),
  ('a96372c8-7d7d-4d6b-bb6c-154e9f5ef728', 'cf262d52-8e51-45c4-a8aa-f7f42e5cc259', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '15c740dc-3744-4171-b2cf-84408eb5c6be',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 15: Life On Land — Forests & Biodiversity',
  'Protected area support, anti-illegal logging patrols with communities, and native species planting. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 15.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['lifeOnLand']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('3215de4a-2920-4650-aa30-9192de7a05d0', '15c740dc-3744-4171-b2cf-84408eb5c6be', 'Monetary', 343900, 0, NULL, 0, 'Open'),
  ('74a40a60-87ca-4dc2-ae90-f47c643f6904', '15c740dc-3744-4171-b2cf-84408eb5c6be', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'a9e0ef64-571a-4fe3-993f-c28b2767c6eb',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 16: Peace & Justice — Dialogue & Legal Aid',
  'Community mediation, legal aid clinics, and civic education for accountable institutions. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 16.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['peaceAndJustice']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('99433ec8-d049-4f42-afab-0e2927af17c3', 'a9e0ef64-571a-4fe3-993f-c28b2767c6eb', 'Monetary', 356400, 0, NULL, 0, 'Open'),
  ('d8ab2cc0-baad-4169-bc92-2a196d27a568', 'a9e0ef64-571a-4fe3-993f-c28b2767c6eb', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'fe3697ea-5c12-4c90-a015-437c06d0f330',
  (SELECT "id" FROM "Organization" WHERE "email" = 'malaysia@gov.org.my' LIMIT 1),
  'Malaysia — SDG 17: Partnerships — Multi-Stakeholder SDG Coalition',
  'Convening NGOs, local government, and businesses for joint SDG implementation and reporting. Focus: Kuala Lumpur and surrounding communities; aligned with UN Sustainable Development Goal 17.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['partnerships']::"CauseEnum"[],
  'Kuala Lumpur',
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
  ('87a6fe0e-7ff8-45c6-b668-14f78321c671', 'fe3697ea-5c12-4c90-a015-437c06d0f330', 'Monetary', 368900, 0, NULL, 0, 'Open'),
  ('8cc645f6-7fbe-4ae7-acc5-3d85332b8b49', 'fe3697ea-5c12-4c90-a015-437c06d0f330', 'Volunteer', NULL, 0, 30, 0, 'Open');

-- === Myanmar (myanmar@gov.org.mm) ===

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '273ac697-56f6-4593-bdbf-6455b2831ede',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 1: No Poverty — Livelihoods & Emergency Relief',
  'Cash-for-work, savings groups, and emergency assistance for households in extreme poverty. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 1.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['noPoverty']::"CauseEnum"[],
  'Yangon',
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
  ('9f7fa582-3c4b-41b0-b1e2-c2c776010fcc', '273ac697-56f6-4593-bdbf-6455b2831ede', 'Monetary', 168100, 0, NULL, 0, 'Open'),
  ('318d44bc-d20f-46ef-85f7-331244031263', '273ac697-56f6-4593-bdbf-6455b2831ede', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '7d9beb6d-8a90-453f-84ac-d92b7f2e52cb',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 2: Zero Hunger — School Meals & Food Security',
  'Nutrition programs, community gardens, and school feeding to reduce hunger and malnutrition. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 2.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['zeroHunger']::"CauseEnum"[],
  'Yangon',
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
  ('eaadac37-75ab-41d1-ab3e-fb22d7afe6cb', '7d9beb6d-8a90-453f-84ac-d92b7f2e52cb', 'Monetary', 180600, 0, NULL, 0, 'Open'),
  ('b73514ac-2688-4490-b89a-5b89cf9318e1', '7d9beb6d-8a90-453f-84ac-d92b7f2e52cb', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'fd19fe36-7917-4541-8084-fe7064894c92',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 3: Good Health — Clinics & Maternal Care',
  'Mobile health outreach, maternal and child health services, and preventive care campaigns. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 3.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['goodHealth']::"CauseEnum"[],
  'Yangon',
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
  ('93910fa5-539e-4a99-94e0-feea86fb04fd', 'fd19fe36-7917-4541-8084-fe7064894c92', 'Monetary', 193100, 0, NULL, 0, 'Open'),
  ('75d34f6d-6097-47a5-ba8d-3b3cb8c6b875', 'fd19fe36-7917-4541-8084-fe7064894c92', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '30484e9a-1033-42b6-93b1-0ca8574cda80',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 4: Quality Education — Scholarships & Learning Hubs',
  'Scholarships, after-school learning centers, and teacher training in underserved areas. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 4.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['qualityEducation']::"CauseEnum"[],
  'Yangon',
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
  ('c02f8d3b-d770-494b-a927-ab22679d3082', '30484e9a-1033-42b6-93b1-0ca8574cda80', 'Monetary', 205600, 0, NULL, 0, 'Open'),
  ('555bc4cc-7367-4478-9743-b52c8a59f826', '30484e9a-1033-42b6-93b1-0ca8574cda80', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '710c97e5-abd7-4c2c-82da-517f9fd7114f',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 5: Gender Equality — Leadership & Safe Spaces',
  'Women and girls leadership training, legal literacy, and safe community support programs. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 5.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['genderEquality']::"CauseEnum"[],
  'Yangon',
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
  ('81e0d62c-fb20-4366-8418-b3e79f6ed8c0', '710c97e5-abd7-4c2c-82da-517f9fd7114f', 'Monetary', 218100, 0, NULL, 0, 'Open'),
  ('434187bc-b69a-4727-895a-f0231079c24c', '710c97e5-abd7-4c2c-82da-517f9fd7114f', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'e227011f-d8b1-4ee2-b8e1-c4d479460ba9',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 6: Clean Water — Wells & Sanitation',
  'Clean water access, hygiene education, and sanitation infrastructure for rural communities. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 6.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['cleanWater']::"CauseEnum"[],
  'Yangon',
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
  ('b47e0548-e8aa-4425-8b6f-196914cd0b5e', 'e227011f-d8b1-4ee2-b8e1-c4d479460ba9', 'Monetary', 230600, 0, NULL, 0, 'Open'),
  ('e638c489-3d34-4857-b9f4-324e9479a878', 'e227011f-d8b1-4ee2-b8e1-c4d479460ba9', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '66ceabe6-1faf-4425-bb1b-2da38f2d1f52',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 7: Affordable Energy — Solar & Efficient Cookstoves',
  'Distributed solar, efficient stoves, and community energy planning for reliable power. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 7.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":23}]'::jsonb,
  ARRAY['affordableEnergy']::"CauseEnum"[],
  'Yangon',
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
  ('793f3de5-3344-4e3c-a7fd-c81a4ccfb286', '66ceabe6-1faf-4425-bb1b-2da38f2d1f52', 'Monetary', 243100, 0, NULL, 0, 'Open'),
  ('8730b7e3-b148-4c45-912c-dbef557da201', '66ceabe6-1faf-4425-bb1b-2da38f2d1f52', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '9672cbec-ff64-40e8-8339-96eb86708eb6',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 8: Decent Work — Skills & Fair Jobs',
  'Vocational training, job placement support, and youth entrepreneurship incubation. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 8.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['decentWork']::"CauseEnum"[],
  'Yangon',
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
  ('aa0dd7c9-c3b0-4a45-950a-4b0850c2385a', '9672cbec-ff64-40e8-8339-96eb86708eb6', 'Monetary', 255600, 0, NULL, 0, 'Open'),
  ('654ee4a1-744f-42a8-8af3-1ca8801fe3f0', '9672cbec-ff64-40e8-8339-96eb86708eb6', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'ac6e91ac-a384-4c3a-a644-bb36a196e282',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 9: Industry & Innovation — Makerspaces & Connectivity',
  'Community innovation labs, digital literacy, and small-scale infrastructure upgrades. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 9.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['industry']::"CauseEnum"[],
  'Yangon',
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
  ('4c9b0a11-94cc-4ed4-a2a2-c2ccc304ffcb', 'ac6e91ac-a384-4c3a-a644-bb36a196e282', 'Monetary', 268100, 0, NULL, 0, 'Open'),
  ('70961ec1-43e0-4b0b-a241-c47904fdc137', 'ac6e91ac-a384-4c3a-a644-bb36a196e282', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '623f856e-e850-412d-94ea-bad0ec325df6',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 10: Reduced Inequalities — Inclusion & Access',
  'Programs for marginalized groups: disability inclusion, migrant support, and equal access to services. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 10.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['reducedInequalities']::"CauseEnum"[],
  'Yangon',
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
  ('0d2c7b43-bb49-4432-8e84-5b98634dfb95', '623f856e-e850-412d-94ea-bad0ec325df6', 'Monetary', 280600, 0, NULL, 0, 'Open'),
  ('75fa5c66-fe0d-4e77-8c93-51828e0971d1', '623f856e-e850-412d-94ea-bad0ec325df6', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '67da23f4-787d-4842-9f5b-f2f464c46113',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 11: Sustainable Cities — Waste & Public Space',
  'Urban greening, community recycling, and safer public spaces in dense neighborhoods. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 11.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":17}]'::jsonb,
  ARRAY['sustainableCities']::"CauseEnum"[],
  'Yangon',
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
  ('ffec9252-d3f8-453b-8fbb-3fc6242d4080', '67da23f4-787d-4842-9f5b-f2f464c46113', 'Monetary', 293100, 0, NULL, 0, 'Open'),
  ('489e8bfa-307e-44ad-8209-19f419c24c9d', '67da23f4-787d-4842-9f5b-f2f464c46113', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '44e675a1-1ae8-4fbe-b596-7df4903714ca',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 12: Responsible Consumption — Circular Economy',
  'Waste reduction workshops, repair cafés, and local circular supply chains. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 12.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":24}]'::jsonb,
  ARRAY['responsibleConsumption']::"CauseEnum"[],
  'Yangon',
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
  ('9c61a718-727c-4e12-b4ee-80818d88b168', '44e675a1-1ae8-4fbe-b596-7df4903714ca', 'Monetary', 305600, 0, NULL, 0, 'Open'),
  ('9546f86f-ccdb-45a0-b075-9972ef199459', '44e675a1-1ae8-4fbe-b596-7df4903714ca', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '78182cdc-c8c5-43bf-8f30-f9fe005f6a76',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 13: Climate Action — Reforestation & Resilience',
  'Tree planting, flood preparedness, and climate-smart agriculture with local partners. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 13.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['climateAction']::"CauseEnum"[],
  'Yangon',
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
  ('5fc3004a-7a05-4040-9f47-e6154e36f4f9', '78182cdc-c8c5-43bf-8f30-f9fe005f6a76', 'Monetary', 318100, 0, NULL, 0, 'Open'),
  ('06a80740-3eb6-42f6-86e2-b47b2bd0c9a4', '78182cdc-c8c5-43bf-8f30-f9fe005f6a76', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '579e32d8-c40f-4ced-926a-e3cd55dfc981',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 14: Life Below Water — Coastal & River Health',
  'Mangrove restoration, river clean-ups, and sustainable fisheries awareness. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 14.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['lifeBelowWater']::"CauseEnum"[],
  'Yangon',
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
  ('9b6bf110-482d-412c-bea2-e976ab3e6737', '579e32d8-c40f-4ced-926a-e3cd55dfc981', 'Monetary', 330600, 0, NULL, 0, 'Open'),
  ('47886f7e-b52f-4d4a-945b-542f56de90e4', '579e32d8-c40f-4ced-926a-e3cd55dfc981', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'd3e4c829-84f8-44a1-88ac-5f6c992f4eb8',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 15: Life On Land — Forests & Biodiversity',
  'Protected area support, anti-illegal logging patrols with communities, and native species planting. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 15.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['lifeOnLand']::"CauseEnum"[],
  'Yangon',
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
  ('9016466e-d1bd-410e-9b2e-1b102d67cba9', 'd3e4c829-84f8-44a1-88ac-5f6c992f4eb8', 'Monetary', 343100, 0, NULL, 0, 'Open'),
  ('28ab612f-38e6-4161-a7b1-9ac61fc79407', 'd3e4c829-84f8-44a1-88ac-5f6c992f4eb8', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '61c07ef8-e9e6-4f62-a53e-84062727a5f4',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 16: Peace & Justice — Dialogue & Legal Aid',
  'Community mediation, legal aid clinics, and civic education for accountable institutions. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 16.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['peaceAndJustice']::"CauseEnum"[],
  'Yangon',
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
  ('cc24a0f0-750b-4964-a7d1-d96ebb1dcfa1', '61c07ef8-e9e6-4f62-a53e-84062727a5f4', 'Monetary', 355600, 0, NULL, 0, 'Open'),
  ('512a5861-93da-46a5-b58a-056c0b8d647b', '61c07ef8-e9e6-4f62-a53e-84062727a5f4', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '05c08035-efd6-4959-a53c-c18a04a9dd31',
  (SELECT "id" FROM "Organization" WHERE "email" = 'myanmar@gov.org.mm' LIMIT 1),
  'Myanmar — SDG 17: Partnerships — Multi-Stakeholder SDG Coalition',
  'Convening NGOs, local government, and businesses for joint SDG implementation and reporting. Focus: Yangon and surrounding communities; aligned with UN Sustainable Development Goal 17.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['partnerships']::"CauseEnum"[],
  'Yangon',
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
  ('24e0b789-7717-463b-a0d8-0ca6e2bafeec', '05c08035-efd6-4959-a53c-c18a04a9dd31', 'Monetary', 368100, 0, NULL, 0, 'Open'),
  ('06003e05-82b3-4ee4-8e1e-b617c1d67888', '05c08035-efd6-4959-a53c-c18a04a9dd31', 'Volunteer', NULL, 0, 30, 0, 'Open');

-- === Philippines (philippines@gov.org.ph) ===

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '260d5426-f2f6-4f7f-b333-1cdd79a5853c',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 1: No Poverty — Livelihoods & Emergency Relief',
  'Cash-for-work, savings groups, and emergency assistance for households in extreme poverty. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 1.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['noPoverty']::"CauseEnum"[],
  'Manila',
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
  ('ebfb230b-5afe-4ae7-9179-096025725332', '260d5426-f2f6-4f7f-b333-1cdd79a5853c', 'Monetary', 171300, 0, NULL, 0, 'Open'),
  ('1db48ca5-7f7d-4aab-baf5-5277d244b483', '260d5426-f2f6-4f7f-b333-1cdd79a5853c', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'b9097bba-edf9-4d75-a611-4cdf71d32dcd',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 2: Zero Hunger — School Meals & Food Security',
  'Nutrition programs, community gardens, and school feeding to reduce hunger and malnutrition. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 2.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['zeroHunger']::"CauseEnum"[],
  'Manila',
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
  ('57ad108b-1f07-425a-b432-5275a3c8397d', 'b9097bba-edf9-4d75-a611-4cdf71d32dcd', 'Monetary', 183800, 0, NULL, 0, 'Open'),
  ('a6971b61-62e5-479f-a04c-b6ef807cfabd', 'b9097bba-edf9-4d75-a611-4cdf71d32dcd', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'e000e12d-73ac-468e-877a-92cfc307caa3',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 3: Good Health — Clinics & Maternal Care',
  'Mobile health outreach, maternal and child health services, and preventive care campaigns. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 3.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['goodHealth']::"CauseEnum"[],
  'Manila',
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
  ('9d111eeb-f59e-498b-aa95-bfa7a6c286ca', 'e000e12d-73ac-468e-877a-92cfc307caa3', 'Monetary', 196300, 0, NULL, 0, 'Open'),
  ('a7ebf632-fd9e-4240-9ea5-a8d83ea5da53', 'e000e12d-73ac-468e-877a-92cfc307caa3', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '909ab458-ab23-49db-b890-8025c31d79b9',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 4: Quality Education — Scholarships & Learning Hubs',
  'Scholarships, after-school learning centers, and teacher training in underserved areas. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 4.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['qualityEducation']::"CauseEnum"[],
  'Manila',
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
  ('dd86c644-1ba5-426d-92f1-bb9951a9a6a4', '909ab458-ab23-49db-b890-8025c31d79b9', 'Monetary', 208800, 0, NULL, 0, 'Open'),
  ('b3655a56-d0ba-45bb-9231-8072cf0e49ad', '909ab458-ab23-49db-b890-8025c31d79b9', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'c4d632f3-b645-4551-a3c7-2dd1fe251d05',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 5: Gender Equality — Leadership & Safe Spaces',
  'Women and girls leadership training, legal literacy, and safe community support programs. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 5.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['genderEquality']::"CauseEnum"[],
  'Manila',
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
  ('71ea54df-8dc0-4a2c-8594-da603e997c0c', 'c4d632f3-b645-4551-a3c7-2dd1fe251d05', 'Monetary', 221300, 0, NULL, 0, 'Open'),
  ('be899f79-1589-43de-8973-a7a1cd4af1f8', 'c4d632f3-b645-4551-a3c7-2dd1fe251d05', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'f7ce0bea-29ae-43fa-9c15-64beb7a33cb4',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 6: Clean Water — Wells & Sanitation',
  'Clean water access, hygiene education, and sanitation infrastructure for rural communities. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 6.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['cleanWater']::"CauseEnum"[],
  'Manila',
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
  ('af37db8a-ea12-41bc-a6b8-36af63e3e3d9', 'f7ce0bea-29ae-43fa-9c15-64beb7a33cb4', 'Monetary', 233800, 0, NULL, 0, 'Open'),
  ('d8cff71e-0844-4a22-95d7-4c5b8c6b0c19', 'f7ce0bea-29ae-43fa-9c15-64beb7a33cb4', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '10585358-2c98-4f0c-a179-5ec372dec398',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 7: Affordable Energy — Solar & Efficient Cookstoves',
  'Distributed solar, efficient stoves, and community energy planning for reliable power. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 7.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":23}]'::jsonb,
  ARRAY['affordableEnergy']::"CauseEnum"[],
  'Manila',
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
  ('37166865-b83e-47f3-be8a-b326cb7eb4c5', '10585358-2c98-4f0c-a179-5ec372dec398', 'Monetary', 246300, 0, NULL, 0, 'Open'),
  ('f483eeb4-f6e1-4673-96b9-73f6db0df4ee', '10585358-2c98-4f0c-a179-5ec372dec398', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '853b8c54-f597-405a-8cdd-f6433134f2a3',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 8: Decent Work — Skills & Fair Jobs',
  'Vocational training, job placement support, and youth entrepreneurship incubation. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 8.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['decentWork']::"CauseEnum"[],
  'Manila',
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
  ('c0a9da0e-3431-4c82-b918-229a861ebb64', '853b8c54-f597-405a-8cdd-f6433134f2a3', 'Monetary', 258800, 0, NULL, 0, 'Open'),
  ('370e9186-d793-4be6-a404-9b6e886d7319', '853b8c54-f597-405a-8cdd-f6433134f2a3', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'efe2e211-07d3-4267-b24a-cac9716e3043',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 9: Industry & Innovation — Makerspaces & Connectivity',
  'Community innovation labs, digital literacy, and small-scale infrastructure upgrades. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 9.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['industry']::"CauseEnum"[],
  'Manila',
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
  ('5b0a5070-6ca6-4781-93a0-16abef01bdeb', 'efe2e211-07d3-4267-b24a-cac9716e3043', 'Monetary', 271300, 0, NULL, 0, 'Open'),
  ('3709c1c4-7bf4-483d-a6d6-a26ccfaae6ea', 'efe2e211-07d3-4267-b24a-cac9716e3043', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'be2ad58c-4bcf-4557-9a0d-dcb80b869894',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 10: Reduced Inequalities — Inclusion & Access',
  'Programs for marginalized groups: disability inclusion, migrant support, and equal access to services. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 10.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['reducedInequalities']::"CauseEnum"[],
  'Manila',
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
  ('4f139d89-668d-49f8-9d1b-907888d9d89d', 'be2ad58c-4bcf-4557-9a0d-dcb80b869894', 'Monetary', 283800, 0, NULL, 0, 'Open'),
  ('e65119f3-e0f6-4981-8616-5a082f25d8dc', 'be2ad58c-4bcf-4557-9a0d-dcb80b869894', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '32d70909-4a3f-41f0-9288-85ea65da154e',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 11: Sustainable Cities — Waste & Public Space',
  'Urban greening, community recycling, and safer public spaces in dense neighborhoods. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 11.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":17}]'::jsonb,
  ARRAY['sustainableCities']::"CauseEnum"[],
  'Manila',
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
  ('cdbc84e9-c309-49ea-b441-28b3280e510c', '32d70909-4a3f-41f0-9288-85ea65da154e', 'Monetary', 296300, 0, NULL, 0, 'Open'),
  ('149a9df1-a912-450c-a696-e7ff12b15362', '32d70909-4a3f-41f0-9288-85ea65da154e', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '958b8656-f089-4ab3-b96d-35d7a5f2c9e6',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 12: Responsible Consumption — Circular Economy',
  'Waste reduction workshops, repair cafés, and local circular supply chains. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 12.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":24}]'::jsonb,
  ARRAY['responsibleConsumption']::"CauseEnum"[],
  'Manila',
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
  ('3e7aa824-319a-4238-a5c4-1054f39dd279', '958b8656-f089-4ab3-b96d-35d7a5f2c9e6', 'Monetary', 308800, 0, NULL, 0, 'Open'),
  ('231d3803-2a42-4a77-9e07-e9941dbb8c19', '958b8656-f089-4ab3-b96d-35d7a5f2c9e6', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'c9bd52ce-98d8-4341-bc1f-b44d136acba0',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 13: Climate Action — Reforestation & Resilience',
  'Tree planting, flood preparedness, and climate-smart agriculture with local partners. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 13.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['climateAction']::"CauseEnum"[],
  'Manila',
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
  ('244e3fe7-95da-45c0-ab12-0eca406a21ff', 'c9bd52ce-98d8-4341-bc1f-b44d136acba0', 'Monetary', 321300, 0, NULL, 0, 'Open'),
  ('11157a91-312a-481a-9bbc-af5b35f7da9a', 'c9bd52ce-98d8-4341-bc1f-b44d136acba0', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '3c3d8b49-1fe6-49f8-ba41-be7b7a0e8c74',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 14: Life Below Water — Coastal & River Health',
  'Mangrove restoration, river clean-ups, and sustainable fisheries awareness. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 14.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['lifeBelowWater']::"CauseEnum"[],
  'Manila',
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
  ('c5883126-14d7-4682-a58c-4de2951471ab', '3c3d8b49-1fe6-49f8-ba41-be7b7a0e8c74', 'Monetary', 333800, 0, NULL, 0, 'Open'),
  ('7109dbb7-b48b-4689-954a-aa012c1d6228', '3c3d8b49-1fe6-49f8-ba41-be7b7a0e8c74', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '94ffb828-3822-4798-9e99-ede5911c98b0',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 15: Life On Land — Forests & Biodiversity',
  'Protected area support, anti-illegal logging patrols with communities, and native species planting. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 15.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['lifeOnLand']::"CauseEnum"[],
  'Manila',
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
  ('8658eaf2-bfb6-4c6e-80ff-aebfb6a0123d', '94ffb828-3822-4798-9e99-ede5911c98b0', 'Monetary', 346300, 0, NULL, 0, 'Open'),
  ('1eec0af5-6843-4479-9e1a-6a22dcd9c976', '94ffb828-3822-4798-9e99-ede5911c98b0', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '3b06f74c-feb3-41c4-b174-84caa21f49d3',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 16: Peace & Justice — Dialogue & Legal Aid',
  'Community mediation, legal aid clinics, and civic education for accountable institutions. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 16.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['peaceAndJustice']::"CauseEnum"[],
  'Manila',
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
  ('767dd3b1-7aad-43fa-ac88-d11303a3fecd', '3b06f74c-feb3-41c4-b174-84caa21f49d3', 'Monetary', 358800, 0, NULL, 0, 'Open'),
  ('6dde4f8e-f697-49ea-a038-b15797c35d96', '3b06f74c-feb3-41c4-b174-84caa21f49d3', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '8ba885ac-2398-4280-8dbd-083f7556498c',
  (SELECT "id" FROM "Organization" WHERE "email" = 'philippines@gov.org.ph' LIMIT 1),
  'Philippines — SDG 17: Partnerships — Multi-Stakeholder SDG Coalition',
  'Convening NGOs, local government, and businesses for joint SDG implementation and reporting. Focus: Manila and surrounding communities; aligned with UN Sustainable Development Goal 17.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['partnerships']::"CauseEnum"[],
  'Manila',
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
  ('68e2ea14-b3f5-4898-856c-1919fadd0c2e', '8ba885ac-2398-4280-8dbd-083f7556498c', 'Monetary', 371300, 0, NULL, 0, 'Open'),
  ('3c8fb475-ce69-48db-98e5-02efbab8ef37', '8ba885ac-2398-4280-8dbd-083f7556498c', 'Volunteer', NULL, 0, 30, 0, 'Open');

-- === Singapore (singapore@gov.org.sg) ===

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '6d8ade6c-51a0-4054-b2b0-9a17f2edb4bd',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 1: No Poverty — Livelihoods & Emergency Relief',
  'Cash-for-work, savings groups, and emergency assistance for households in extreme poverty. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 1.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['noPoverty']::"CauseEnum"[],
  'Singapore',
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
  ('9b026fc7-24d7-47d4-ab7f-663c23c2ed7e', '6d8ade6c-51a0-4054-b2b0-9a17f2edb4bd', 'Monetary', 169700, 0, NULL, 0, 'Open'),
  ('7ac879f5-5528-4450-a4a7-34389c3ab4da', '6d8ade6c-51a0-4054-b2b0-9a17f2edb4bd', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '38322c0d-8ca0-4c8d-85bc-7ea2659b6c98',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 2: Zero Hunger — School Meals & Food Security',
  'Nutrition programs, community gardens, and school feeding to reduce hunger and malnutrition. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 2.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['zeroHunger']::"CauseEnum"[],
  'Singapore',
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
  ('01c99d89-d0ef-45c7-a6d0-6f5614db7b30', '38322c0d-8ca0-4c8d-85bc-7ea2659b6c98', 'Monetary', 182200, 0, NULL, 0, 'Open'),
  ('79f34673-2c52-42c9-8ca3-236238d47f21', '38322c0d-8ca0-4c8d-85bc-7ea2659b6c98', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '9f952069-f4b4-41c1-85c4-3fdc7f2b9bf9',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 3: Good Health — Clinics & Maternal Care',
  'Mobile health outreach, maternal and child health services, and preventive care campaigns. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 3.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['goodHealth']::"CauseEnum"[],
  'Singapore',
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
  ('43947797-c157-4baf-a4bd-d930089cf7fe', '9f952069-f4b4-41c1-85c4-3fdc7f2b9bf9', 'Monetary', 194700, 0, NULL, 0, 'Open'),
  ('29281c18-956d-4e82-9dd6-cbd03044f8df', '9f952069-f4b4-41c1-85c4-3fdc7f2b9bf9', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'b8e6ec1b-887a-46f1-98a0-bd94f3606b58',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 4: Quality Education — Scholarships & Learning Hubs',
  'Scholarships, after-school learning centers, and teacher training in underserved areas. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 4.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['qualityEducation']::"CauseEnum"[],
  'Singapore',
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
  ('826cdd6e-ef45-4172-a2a7-96ff22dba961', 'b8e6ec1b-887a-46f1-98a0-bd94f3606b58', 'Monetary', 207200, 0, NULL, 0, 'Open'),
  ('63854098-ac24-4e81-b33d-b76acf217d0a', 'b8e6ec1b-887a-46f1-98a0-bd94f3606b58', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '0190772e-4563-44f1-a03f-346fa018695f',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 5: Gender Equality — Leadership & Safe Spaces',
  'Women and girls leadership training, legal literacy, and safe community support programs. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 5.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['genderEquality']::"CauseEnum"[],
  'Singapore',
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
  ('fff2f2d7-dab9-45a2-8165-36616ed8bf9a', '0190772e-4563-44f1-a03f-346fa018695f', 'Monetary', 219700, 0, NULL, 0, 'Open'),
  ('22667797-04ea-468f-a1be-e1241d397d94', '0190772e-4563-44f1-a03f-346fa018695f', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'ddd3ac5c-9e75-4de3-984d-a6a7b27788cd',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 6: Clean Water — Wells & Sanitation',
  'Clean water access, hygiene education, and sanitation infrastructure for rural communities. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 6.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['cleanWater']::"CauseEnum"[],
  'Singapore',
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
  ('fbba12f4-780a-4aad-9dfc-388aeb3705e7', 'ddd3ac5c-9e75-4de3-984d-a6a7b27788cd', 'Monetary', 232200, 0, NULL, 0, 'Open'),
  ('1cda107c-1b2f-47d1-833e-1b6c62e43957', 'ddd3ac5c-9e75-4de3-984d-a6a7b27788cd', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '8556155d-8c77-4a11-9765-5a5006d11ccf',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 7: Affordable Energy — Solar & Efficient Cookstoves',
  'Distributed solar, efficient stoves, and community energy planning for reliable power. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 7.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":23}]'::jsonb,
  ARRAY['affordableEnergy']::"CauseEnum"[],
  'Singapore',
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
  ('e0624828-94dd-4cf7-b83c-b2dbaefcab2d', '8556155d-8c77-4a11-9765-5a5006d11ccf', 'Monetary', 244700, 0, NULL, 0, 'Open'),
  ('8ae929cd-3523-43b7-8df6-887b00c93270', '8556155d-8c77-4a11-9765-5a5006d11ccf', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '64616d5e-0b0e-42cb-894d-354663f50b37',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 8: Decent Work — Skills & Fair Jobs',
  'Vocational training, job placement support, and youth entrepreneurship incubation. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 8.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['decentWork']::"CauseEnum"[],
  'Singapore',
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
  ('d7fe2e42-7ffb-4f7f-ba4d-41310ba8d4e8', '64616d5e-0b0e-42cb-894d-354663f50b37', 'Monetary', 257200, 0, NULL, 0, 'Open'),
  ('dc48ab08-7451-4034-85b9-8763ae462ece', '64616d5e-0b0e-42cb-894d-354663f50b37', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '47cd243a-9c74-469a-b8d0-0c18a40aa0f9',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 9: Industry & Innovation — Makerspaces & Connectivity',
  'Community innovation labs, digital literacy, and small-scale infrastructure upgrades. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 9.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['industry']::"CauseEnum"[],
  'Singapore',
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
  ('e9ad2b8a-71d3-4088-9eb8-05381eeeee81', '47cd243a-9c74-469a-b8d0-0c18a40aa0f9', 'Monetary', 269700, 0, NULL, 0, 'Open'),
  ('ad26abd4-189d-4a71-87fc-806ccbdac8c3', '47cd243a-9c74-469a-b8d0-0c18a40aa0f9', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '3ffbb719-42b8-4e75-b2fd-bbc50ee499e6',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 10: Reduced Inequalities — Inclusion & Access',
  'Programs for marginalized groups: disability inclusion, migrant support, and equal access to services. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 10.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['reducedInequalities']::"CauseEnum"[],
  'Singapore',
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
  ('deb8214c-a2e3-44e9-a323-3e27134f388c', '3ffbb719-42b8-4e75-b2fd-bbc50ee499e6', 'Monetary', 282200, 0, NULL, 0, 'Open'),
  ('ae0d4e22-eeab-4349-8fd6-b78fada5da03', '3ffbb719-42b8-4e75-b2fd-bbc50ee499e6', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '97ba0e49-da6a-4695-9203-9ec17193569e',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 11: Sustainable Cities — Waste & Public Space',
  'Urban greening, community recycling, and safer public spaces in dense neighborhoods. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 11.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":17}]'::jsonb,
  ARRAY['sustainableCities']::"CauseEnum"[],
  'Singapore',
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
  ('eba1ebea-3c15-4211-b3c9-fa6d3a131425', '97ba0e49-da6a-4695-9203-9ec17193569e', 'Monetary', 294700, 0, NULL, 0, 'Open'),
  ('fdf94c35-2771-4b06-81b9-1418bdadc0cd', '97ba0e49-da6a-4695-9203-9ec17193569e', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '03e9c049-f2ab-41e6-9225-a106f1a64f62',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 12: Responsible Consumption — Circular Economy',
  'Waste reduction workshops, repair cafés, and local circular supply chains. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 12.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":24}]'::jsonb,
  ARRAY['responsibleConsumption']::"CauseEnum"[],
  'Singapore',
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
  ('b4c3439c-58ba-4360-ab27-da02aebd7fd5', '03e9c049-f2ab-41e6-9225-a106f1a64f62', 'Monetary', 307200, 0, NULL, 0, 'Open'),
  ('b7393e48-6a57-48e8-9cb0-03bef35bcc75', '03e9c049-f2ab-41e6-9225-a106f1a64f62', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '7e507688-8b07-43d2-a3df-dee37d9a9e28',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 13: Climate Action — Reforestation & Resilience',
  'Tree planting, flood preparedness, and climate-smart agriculture with local partners. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 13.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['climateAction']::"CauseEnum"[],
  'Singapore',
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
  ('0b46e0ec-cee7-4fad-955c-4d111c0d4ef8', '7e507688-8b07-43d2-a3df-dee37d9a9e28', 'Monetary', 319700, 0, NULL, 0, 'Open'),
  ('5b1b4cbb-38cf-4639-8014-3aff3ee4e045', '7e507688-8b07-43d2-a3df-dee37d9a9e28', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'e26379a1-c2db-494c-86ac-123225755030',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 14: Life Below Water — Coastal & River Health',
  'Mangrove restoration, river clean-ups, and sustainable fisheries awareness. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 14.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['lifeBelowWater']::"CauseEnum"[],
  'Singapore',
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
  ('268200cb-59a2-475b-9d33-0e46dc2402e4', 'e26379a1-c2db-494c-86ac-123225755030', 'Monetary', 332200, 0, NULL, 0, 'Open'),
  ('2c34c3a6-6bde-407c-af08-9e5fd1c207fd', 'e26379a1-c2db-494c-86ac-123225755030', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '97ad22fc-3dcd-468b-b238-f8a989fa0146',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 15: Life On Land — Forests & Biodiversity',
  'Protected area support, anti-illegal logging patrols with communities, and native species planting. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 15.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['lifeOnLand']::"CauseEnum"[],
  'Singapore',
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
  ('b7c255ad-7cb7-4fd2-b92e-45d73812e404', '97ad22fc-3dcd-468b-b238-f8a989fa0146', 'Monetary', 344700, 0, NULL, 0, 'Open'),
  ('d8eb8a46-ff2e-405c-bcbe-145998af727d', '97ad22fc-3dcd-468b-b238-f8a989fa0146', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '3411f785-707e-40f4-88d5-b1492fab9e4c',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 16: Peace & Justice — Dialogue & Legal Aid',
  'Community mediation, legal aid clinics, and civic education for accountable institutions. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 16.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['peaceAndJustice']::"CauseEnum"[],
  'Singapore',
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
  ('283197cf-3a71-4858-9bcb-55c97764425c', '3411f785-707e-40f4-88d5-b1492fab9e4c', 'Monetary', 357200, 0, NULL, 0, 'Open'),
  ('a82c6f5e-04d9-4e9a-8b0b-2b757b4ae8a4', '3411f785-707e-40f4-88d5-b1492fab9e4c', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '61b6fff2-2c8a-47fc-950d-12610c6e3870',
  (SELECT "id" FROM "Organization" WHERE "email" = 'singapore@gov.org.sg' LIMIT 1),
  'Singapore — SDG 17: Partnerships — Multi-Stakeholder SDG Coalition',
  'Convening NGOs, local government, and businesses for joint SDG implementation and reporting. Focus: Singapore and surrounding communities; aligned with UN Sustainable Development Goal 17.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['partnerships']::"CauseEnum"[],
  'Singapore',
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
  ('770e7edc-6331-49c9-a090-6d5edd921133', '61b6fff2-2c8a-47fc-950d-12610c6e3870', 'Monetary', 369700, 0, NULL, 0, 'Open'),
  ('d3be2280-dcc1-4a8e-9f82-65df0eaaf934', '61b6fff2-2c8a-47fc-950d-12610c6e3870', 'Volunteer', NULL, 0, 30, 0, 'Open');

-- === Thailand (thailand@gov.org.th) ===

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'b70e8fd0-d6cb-4267-9183-fc864de44ea7',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 1: No Poverty — Livelihoods & Emergency Relief',
  'Cash-for-work, savings groups, and emergency assistance for households in extreme poverty. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 1.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['noPoverty']::"CauseEnum"[],
  'Bangkok',
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
  ('7fc2a5b5-f340-42c5-8329-a55ef5864487', 'b70e8fd0-d6cb-4267-9183-fc864de44ea7', 'Monetary', 168900, 0, NULL, 0, 'Open'),
  ('13734ab0-10a1-4fbe-aa33-506142343fd8', 'b70e8fd0-d6cb-4267-9183-fc864de44ea7', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '76af0038-71c0-483d-be90-f2834b214ba6',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 2: Zero Hunger — School Meals & Food Security',
  'Nutrition programs, community gardens, and school feeding to reduce hunger and malnutrition. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 2.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['zeroHunger']::"CauseEnum"[],
  'Bangkok',
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
  ('7d317f1c-521f-4a22-aaea-ab16541f17bc', '76af0038-71c0-483d-be90-f2834b214ba6', 'Monetary', 181400, 0, NULL, 0, 'Open'),
  ('af82ce9c-03b0-4983-ab8e-45037fe65298', '76af0038-71c0-483d-be90-f2834b214ba6', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '56e90345-c47c-4ff8-a254-b2ec08d6a7e0',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 3: Good Health — Clinics & Maternal Care',
  'Mobile health outreach, maternal and child health services, and preventive care campaigns. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 3.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['goodHealth']::"CauseEnum"[],
  'Bangkok',
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
  ('19219623-c2fd-4828-8b6b-2a9f85523db0', '56e90345-c47c-4ff8-a254-b2ec08d6a7e0', 'Monetary', 193900, 0, NULL, 0, 'Open'),
  ('dad3fa79-fdc0-401f-8e66-06c656e130b3', '56e90345-c47c-4ff8-a254-b2ec08d6a7e0', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '9130afd7-f612-4674-b4eb-d44f524b4569',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 4: Quality Education — Scholarships & Learning Hubs',
  'Scholarships, after-school learning centers, and teacher training in underserved areas. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 4.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['qualityEducation']::"CauseEnum"[],
  'Bangkok',
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
  ('adee2a2a-d84b-496f-a490-0f9d3f98f49a', '9130afd7-f612-4674-b4eb-d44f524b4569', 'Monetary', 206400, 0, NULL, 0, 'Open'),
  ('cb5e25a2-e89d-4643-9a97-927bc42c24ec', '9130afd7-f612-4674-b4eb-d44f524b4569', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'caca7240-0719-4dfb-bb7b-c23f80668a74',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 5: Gender Equality — Leadership & Safe Spaces',
  'Women and girls leadership training, legal literacy, and safe community support programs. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 5.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['genderEquality']::"CauseEnum"[],
  'Bangkok',
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
  ('e2d9506c-47e8-435c-b5c5-a07d21ff318b', 'caca7240-0719-4dfb-bb7b-c23f80668a74', 'Monetary', 218900, 0, NULL, 0, 'Open'),
  ('c6e61f05-088e-40e6-b5b2-db1c99e4a8fa', 'caca7240-0719-4dfb-bb7b-c23f80668a74', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'ace89b46-e38a-4a42-aac0-ea73d8efbb8a',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 6: Clean Water — Wells & Sanitation',
  'Clean water access, hygiene education, and sanitation infrastructure for rural communities. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 6.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['cleanWater']::"CauseEnum"[],
  'Bangkok',
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
  ('ccda535e-aeb9-44b8-b38d-6712a7384f87', 'ace89b46-e38a-4a42-aac0-ea73d8efbb8a', 'Monetary', 231400, 0, NULL, 0, 'Open'),
  ('b8ebf742-6060-4f12-83c7-ea2bc923e610', 'ace89b46-e38a-4a42-aac0-ea73d8efbb8a', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'a5d050af-bfe8-4db6-857a-214d1db6f660',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 7: Affordable Energy — Solar & Efficient Cookstoves',
  'Distributed solar, efficient stoves, and community energy planning for reliable power. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 7.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":23}]'::jsonb,
  ARRAY['affordableEnergy']::"CauseEnum"[],
  'Bangkok',
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
  ('38ecc68d-496a-4d3a-8440-a9a23f2eef57', 'a5d050af-bfe8-4db6-857a-214d1db6f660', 'Monetary', 243900, 0, NULL, 0, 'Open'),
  ('21a1c8f7-4fa8-4e91-b35d-0f782f4bbc5e', 'a5d050af-bfe8-4db6-857a-214d1db6f660', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'd5133f53-002e-4e50-83c4-8ef95ff2572e',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 8: Decent Work — Skills & Fair Jobs',
  'Vocational training, job placement support, and youth entrepreneurship incubation. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 8.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['decentWork']::"CauseEnum"[],
  'Bangkok',
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
  ('2dcd0650-0a0f-4fae-bc55-76a4d8e7c743', 'd5133f53-002e-4e50-83c4-8ef95ff2572e', 'Monetary', 256400, 0, NULL, 0, 'Open'),
  ('ddf1792e-746a-48e1-a6cd-550d602fb13f', 'd5133f53-002e-4e50-83c4-8ef95ff2572e', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '12d4c058-9257-456b-838d-66d97e2d1d0d',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 9: Industry & Innovation — Makerspaces & Connectivity',
  'Community innovation labs, digital literacy, and small-scale infrastructure upgrades. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 9.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['industry']::"CauseEnum"[],
  'Bangkok',
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
  ('6c2cf9de-757a-4881-b93d-3849018730b4', '12d4c058-9257-456b-838d-66d97e2d1d0d', 'Monetary', 268900, 0, NULL, 0, 'Open'),
  ('1d7a01dd-0c0f-4afb-bb36-d00089db20df', '12d4c058-9257-456b-838d-66d97e2d1d0d', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '0f4f029c-5749-43b8-99fa-e3859493f984',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 10: Reduced Inequalities — Inclusion & Access',
  'Programs for marginalized groups: disability inclusion, migrant support, and equal access to services. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 10.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['reducedInequalities']::"CauseEnum"[],
  'Bangkok',
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
  ('2a71aebf-37c0-401b-a802-122a3cbe7ab7', '0f4f029c-5749-43b8-99fa-e3859493f984', 'Monetary', 281400, 0, NULL, 0, 'Open'),
  ('446b5855-f0b8-4015-9334-f293d93ac7a4', '0f4f029c-5749-43b8-99fa-e3859493f984', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '0fd85188-7f50-4211-9c11-1b215a2b7400',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 11: Sustainable Cities — Waste & Public Space',
  'Urban greening, community recycling, and safer public spaces in dense neighborhoods. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 11.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":17}]'::jsonb,
  ARRAY['sustainableCities']::"CauseEnum"[],
  'Bangkok',
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
  ('7c7285b9-1c06-4f98-97cd-f81767c59052', '0fd85188-7f50-4211-9c11-1b215a2b7400', 'Monetary', 293900, 0, NULL, 0, 'Open'),
  ('b28f1e14-ac3f-4595-9f48-cd0e3c0ff5a6', '0fd85188-7f50-4211-9c11-1b215a2b7400', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '57622038-2967-4c33-bfd6-0b2673b3e640',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 12: Responsible Consumption — Circular Economy',
  'Waste reduction workshops, repair cafés, and local circular supply chains. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 12.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":24}]'::jsonb,
  ARRAY['responsibleConsumption']::"CauseEnum"[],
  'Bangkok',
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
  ('452a4509-0ddd-4718-9ac1-f452df28b77a', '57622038-2967-4c33-bfd6-0b2673b3e640', 'Monetary', 306400, 0, NULL, 0, 'Open'),
  ('005d8f2a-5a80-4728-9548-cf080ead8f11', '57622038-2967-4c33-bfd6-0b2673b3e640', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '5f0ae50d-432e-4807-9b98-181dc223d860',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 13: Climate Action — Reforestation & Resilience',
  'Tree planting, flood preparedness, and climate-smart agriculture with local partners. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 13.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['climateAction']::"CauseEnum"[],
  'Bangkok',
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
  ('68a4ad3e-0870-49c2-991a-e6d0c17103c5', '5f0ae50d-432e-4807-9b98-181dc223d860', 'Monetary', 318900, 0, NULL, 0, 'Open'),
  ('925e9ad8-02f2-4e53-bc1b-64ffd53576f6', '5f0ae50d-432e-4807-9b98-181dc223d860', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '14d852f5-dfd6-46ea-975b-0f202929a1a2',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 14: Life Below Water — Coastal & River Health',
  'Mangrove restoration, river clean-ups, and sustainable fisheries awareness. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 14.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['lifeBelowWater']::"CauseEnum"[],
  'Bangkok',
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
  ('291597d9-b7dd-4b1d-8f6f-7f21b86d76b4', '14d852f5-dfd6-46ea-975b-0f202929a1a2', 'Monetary', 331400, 0, NULL, 0, 'Open'),
  ('2e80aad6-2b28-4728-80b4-b644d29631a8', '14d852f5-dfd6-46ea-975b-0f202929a1a2', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '2203b080-5878-4f6c-9cb3-61640a9a09f9',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 15: Life On Land — Forests & Biodiversity',
  'Protected area support, anti-illegal logging patrols with communities, and native species planting. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 15.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['lifeOnLand']::"CauseEnum"[],
  'Bangkok',
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
  ('61517262-32df-4a49-a3b4-703cf7de0acc', '2203b080-5878-4f6c-9cb3-61640a9a09f9', 'Monetary', 343900, 0, NULL, 0, 'Open'),
  ('94d5a359-f3b6-4b49-8d75-6c60f6be8f74', '2203b080-5878-4f6c-9cb3-61640a9a09f9', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '63edac34-04a1-4c71-ae25-b66da14bb334',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 16: Peace & Justice — Dialogue & Legal Aid',
  'Community mediation, legal aid clinics, and civic education for accountable institutions. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 16.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['peaceAndJustice']::"CauseEnum"[],
  'Bangkok',
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
  ('46f764cd-6b77-49f5-96d4-ea95127fb6a3', '63edac34-04a1-4c71-ae25-b66da14bb334', 'Monetary', 356400, 0, NULL, 0, 'Open'),
  ('cc03e554-d4e9-415b-9032-ffb331e6aeb9', '63edac34-04a1-4c71-ae25-b66da14bb334', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '30c6ff8c-65b5-43cc-b8b6-fa8e338f499b',
  (SELECT "id" FROM "Organization" WHERE "email" = 'thailand@gov.org.th' LIMIT 1),
  'Thailand — SDG 17: Partnerships — Multi-Stakeholder SDG Coalition',
  'Convening NGOs, local government, and businesses for joint SDG implementation and reporting. Focus: Bangkok and surrounding communities; aligned with UN Sustainable Development Goal 17.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['partnerships']::"CauseEnum"[],
  'Bangkok',
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
  ('fba54cc4-4f4d-4739-a104-0f0105434e83', '30c6ff8c-65b5-43cc-b8b6-fa8e338f499b', 'Monetary', 368900, 0, NULL, 0, 'Open'),
  ('69fd3045-b916-4c8e-aab7-38d5f5f786a4', '30c6ff8c-65b5-43cc-b8b6-fa8e338f499b', 'Volunteer', NULL, 0, 30, 0, 'Open');

-- === Vietnam (vietnam@gov.org.vn) ===

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'dcf579f5-00f0-4cf2-8ae7-14d8dc12ad80',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 1: No Poverty — Livelihoods & Emergency Relief',
  'Cash-for-work, savings groups, and emergency assistance for households in extreme poverty. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 1.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['noPoverty']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('e79f39da-685a-476a-8426-fe78872e80cf', 'dcf579f5-00f0-4cf2-8ae7-14d8dc12ad80', 'Monetary', 168100, 0, NULL, 0, 'Open'),
  ('275a24be-fb78-4a9b-8466-2998147a56a1', 'dcf579f5-00f0-4cf2-8ae7-14d8dc12ad80', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '1ef7168e-8820-4a0e-890d-047c54156752',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 2: Zero Hunger — School Meals & Food Security',
  'Nutrition programs, community gardens, and school feeding to reduce hunger and malnutrition. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 2.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['zeroHunger']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('f6b1f1ba-743a-402b-b989-fdf632a3306f', '1ef7168e-8820-4a0e-890d-047c54156752', 'Monetary', 180600, 0, NULL, 0, 'Open'),
  ('1d55a786-6bb1-4b88-b25b-b27b3936158d', '1ef7168e-8820-4a0e-890d-047c54156752', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '25820295-05cd-44a9-bc7e-c21007d09f55',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 3: Good Health — Clinics & Maternal Care',
  'Mobile health outreach, maternal and child health services, and preventive care campaigns. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 3.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['goodHealth']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('331b1a12-b824-495f-a280-7f50c153f116', '25820295-05cd-44a9-bc7e-c21007d09f55', 'Monetary', 193100, 0, NULL, 0, 'Open'),
  ('c6b49d1a-1185-4383-a157-43d4bc73957c', '25820295-05cd-44a9-bc7e-c21007d09f55', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '2bc9a1c1-335c-4745-9a01-49f93504cb59',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 4: Quality Education — Scholarships & Learning Hubs',
  'Scholarships, after-school learning centers, and teacher training in underserved areas. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 4.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['qualityEducation']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('33a9014b-f38f-4cc8-aad0-1550443d1ad2', '2bc9a1c1-335c-4745-9a01-49f93504cb59', 'Monetary', 205600, 0, NULL, 0, 'Open'),
  ('e13dc303-7091-4988-925d-456cb5980555', '2bc9a1c1-335c-4745-9a01-49f93504cb59', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '47e7a996-f566-49e6-a875-b371330d5180',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 5: Gender Equality — Leadership & Safe Spaces',
  'Women and girls leadership training, legal literacy, and safe community support programs. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 5.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['genderEquality']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('e0ed5a62-5a01-4cfe-9341-8ad8a634cd4d', '47e7a996-f566-49e6-a875-b371330d5180', 'Monetary', 218100, 0, NULL, 0, 'Open'),
  ('5b7d1f94-044e-4912-aea1-097d134b5185', '47e7a996-f566-49e6-a875-b371330d5180', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '5127440b-c83b-4014-b836-57db98993154',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 6: Clean Water — Wells & Sanitation',
  'Clean water access, hygiene education, and sanitation infrastructure for rural communities. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 6.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['cleanWater']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('a50d9665-30a0-46f1-8e50-f99d264ff4d7', '5127440b-c83b-4014-b836-57db98993154', 'Monetary', 230600, 0, NULL, 0, 'Open'),
  ('73dee8bf-9aa2-43d9-acd2-656de481dcea', '5127440b-c83b-4014-b836-57db98993154', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '658c2f9c-c326-4a13-abd9-3fc875705aaa',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 7: Affordable Energy — Solar & Efficient Cookstoves',
  'Distributed solar, efficient stoves, and community energy planning for reliable power. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 7.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":23}]'::jsonb,
  ARRAY['affordableEnergy']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('3bc7a79e-aa7c-427c-a2e5-d5f41389db2d', '658c2f9c-c326-4a13-abd9-3fc875705aaa', 'Monetary', 243100, 0, NULL, 0, 'Open'),
  ('8b8f136a-4220-47c9-a6e2-9ecd13f263dc', '658c2f9c-c326-4a13-abd9-3fc875705aaa', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  'f2a437b6-132a-487e-b3e6-bd97a42584b2',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 8: Decent Work — Skills & Fair Jobs',
  'Vocational training, job placement support, and youth entrepreneurship incubation. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 8.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['decentWork']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('1f70d503-b1f4-4eb2-8a36-51f9f2d34bbe', 'f2a437b6-132a-487e-b3e6-bd97a42584b2', 'Monetary', 255600, 0, NULL, 0, 'Open'),
  ('ad45f63c-0bd6-4f25-8db8-7d86610a9514', 'f2a437b6-132a-487e-b3e6-bd97a42584b2', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '2c0ea602-5473-45ae-b94c-f2625f06b015',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 9: Industry & Innovation — Makerspaces & Connectivity',
  'Community innovation labs, digital literacy, and small-scale infrastructure upgrades. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 9.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['industry']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('323b6625-e195-4043-bc71-f20ee3e1e9bf', '2c0ea602-5473-45ae-b94c-f2625f06b015', 'Monetary', 268100, 0, NULL, 0, 'Open'),
  ('5f73ae82-c9ce-4dff-ad5a-029c1fd9d128', '2c0ea602-5473-45ae-b94c-f2625f06b015', 'Volunteer', NULL, 0, 30, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '0e3b7ac8-244f-4035-9039-35e5af648a48',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 10: Reduced Inequalities — Inclusion & Access',
  'Programs for marginalized groups: disability inclusion, migrant support, and equal access to services. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 10.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['reducedInequalities']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('81236130-fbc2-44b3-9d3a-fb6497d9c84c', '0e3b7ac8-244f-4035-9039-35e5af648a48', 'Monetary', 280600, 0, NULL, 0, 'Open'),
  ('6d9fec3d-26f3-4f48-9761-ab7521d74064', '0e3b7ac8-244f-4035-9039-35e5af648a48', 'Volunteer', NULL, 0, 35, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '6be7d975-d89c-4c47-afa6-a6ca55dc5463',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 11: Sustainable Cities — Waste & Public Space',
  'Urban greening, community recycling, and safer public spaces in dense neighborhoods. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 11.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":17}]'::jsonb,
  ARRAY['sustainableCities']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('99f86268-cd1f-4710-883a-759a4154dd6a', '6be7d975-d89c-4c47-afa6-a6ca55dc5463', 'Monetary', 293100, 0, NULL, 0, 'Open'),
  ('bfbae267-cf7b-472e-acb0-082206d7169b', '6be7d975-d89c-4c47-afa6-a6ca55dc5463', 'Volunteer', NULL, 0, 40, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '6003d198-4ed1-4fa8-b079-b30705173786',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 12: Responsible Consumption — Circular Economy',
  'Waste reduction workshops, repair cafés, and local circular supply chains. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 12.',
  '[{"label":"Direct programs","percentage":45},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":24}]'::jsonb,
  ARRAY['responsibleConsumption']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('b5cf1953-b5db-405c-a33e-0adbdedd35ce', '6003d198-4ed1-4fa8-b079-b30705173786', 'Monetary', 305600, 0, NULL, 0, 'Open'),
  ('690e8d15-6c73-4181-a673-6fd0c393efa7', '6003d198-4ed1-4fa8-b079-b30705173786', 'Volunteer', NULL, 0, 45, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '6ebe372e-5c1c-47eb-861d-661cf955a202',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 13: Climate Action — Reforestation & Resilience',
  'Tree planting, flood preparedness, and climate-smart agriculture with local partners. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 13.',
  '[{"label":"Direct programs","percentage":46},{"label":"Local partners","percentage":34},{"label":"Monitoring & admin","percentage":20}]'::jsonb,
  ARRAY['climateAction']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('6cde8f7a-0a1f-48ac-8ad5-ce646ef504b2', '6ebe372e-5c1c-47eb-861d-661cf955a202', 'Monetary', 318100, 0, NULL, 0, 'Open'),
  ('d0173dd6-8d72-4c4b-a908-d4abf8de1755', '6ebe372e-5c1c-47eb-861d-661cf955a202', 'Volunteer', NULL, 0, 50, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '07bf1ded-86b7-40cc-9cc5-6029f48c43e3',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 14: Life Below Water — Coastal & River Health',
  'Mangrove restoration, river clean-ups, and sustainable fisheries awareness. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 14.',
  '[{"label":"Direct programs","percentage":47},{"label":"Local partners","percentage":32},{"label":"Monitoring & admin","percentage":21}]'::jsonb,
  ARRAY['lifeBelowWater']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('754764b1-913e-42ab-874b-4b0504630f55', '07bf1ded-86b7-40cc-9cc5-6029f48c43e3', 'Monetary', 330600, 0, NULL, 0, 'Open'),
  ('dac5f997-5f28-4151-a652-ef049c7fc624', '07bf1ded-86b7-40cc-9cc5-6029f48c43e3', 'Volunteer', NULL, 0, 55, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '33479cae-51d7-4660-be6a-47eecd8c0ae8',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 15: Life On Land — Forests & Biodiversity',
  'Protected area support, anti-illegal logging patrols with communities, and native species planting. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 15.',
  '[{"label":"Direct programs","percentage":48},{"label":"Local partners","percentage":30},{"label":"Monitoring & admin","percentage":22}]'::jsonb,
  ARRAY['lifeOnLand']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('2ea45731-d803-4522-93f5-180f66920bf8', '33479cae-51d7-4660-be6a-47eecd8c0ae8', 'Monetary', 343100, 0, NULL, 0, 'Open'),
  ('1d6496a8-cd18-4869-9d4a-f958695d8d8c', '33479cae-51d7-4660-be6a-47eecd8c0ae8', 'Volunteer', NULL, 0, 60, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '4ad78473-3006-40dc-a083-0ef01736fd71',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 16: Peace & Justice — Dialogue & Legal Aid',
  'Community mediation, legal aid clinics, and civic education for accountable institutions. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 16.',
  '[{"label":"Direct programs","percentage":49},{"label":"Local partners","percentage":33},{"label":"Monitoring & admin","percentage":18}]'::jsonb,
  ARRAY['peaceAndJustice']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('ebabe080-a471-49fb-bd11-9e8636929dfa', '4ad78473-3006-40dc-a083-0ef01736fd71', 'Monetary', 355600, 0, NULL, 0, 'Open'),
  ('e6304c7d-543d-4f4b-bee4-7f901479df33', '4ad78473-3006-40dc-a083-0ef01736fd71', 'Volunteer', NULL, 0, 25, 0, 'Open');

INSERT INTO "Post" ("id", "orgId", "projectName", "description", "budgetBreakdown", "causes", "location", "priority", "overallStatus", "startDate", "endDate", "startTime", "endTime", "createdAt")
VALUES (
  '08352bd3-4ecc-41f3-8edd-10e5e18c0b33',
  (SELECT "id" FROM "Organization" WHERE "email" = 'vietnam@gov.org.vn' LIMIT 1),
  'Vietnam — SDG 17: Partnerships — Multi-Stakeholder SDG Coalition',
  'Convening NGOs, local government, and businesses for joint SDG implementation and reporting. Focus: Ho Chi Minh City and surrounding communities; aligned with UN Sustainable Development Goal 17.',
  '[{"label":"Direct programs","percentage":50},{"label":"Local partners","percentage":31},{"label":"Monitoring & admin","percentage":19}]'::jsonb,
  ARRAY['partnerships']::"CauseEnum"[],
  'Ho Chi Minh City',
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
  ('a810b0af-521b-42ae-99d1-99ed79d2c39d', '08352bd3-4ecc-41f3-8edd-10e5e18c0b33', 'Monetary', 368100, 0, NULL, 0, 'Open'),
  ('ab765dcc-6ff9-4369-b283-bb5c12ed2187', '08352bd3-4ecc-41f3-8edd-10e5e18c0b33', 'Volunteer', NULL, 0, 30, 0, 'Open');

