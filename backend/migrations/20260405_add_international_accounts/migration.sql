-- Migration: Add International Organization and Donor Accounts
-- This migration adds verified and approved accounts from 10 different countries
-- Generated with proper bcrypt hashing (SALT_ROUNDS=10)

-- India Organization
INSERT INTO "Organization" ("orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'People for Development India',
  'Arun',
  'Kumar',
  'india@gov.org.in',
  '$2b$10$CgI4IrG0l00sYvfeIfvjdODspgHRieTOXg6dnQlUWMS1J3TEWX3qy',
  'India',
  'Dedicated to sustainable development and social welfare programs across India, focusing on education, health, and poverty alleviation.',
  true,
  'Approved',
  NOW()
);

-- India Donor
INSERT INTO "Donor" ("firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  'Divya',
  'Patel',
  'india.donor@gov.org.in',
  '$2b$10$vHn3NhW.CPVFdpN.rNF9geIw/5h/qD8MbM2XVVPPae.9bAifecGcK',
  'India',
  'Global Impact Foundation India',
  true,
  'Approved',
  NOW()
);

-- Brazil Organization
INSERT INTO "Organization" ("orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'Movimento Social Brasil',
  'João',
  'Silva',
  'brazil@gov.org.br',
  '$2b$10$NHoeKHfoqLY8FA1TWWwkQ.FKLrJqY7Kp/FYwApuMv4GUhrjnCwaaS',
  'Brazil',
  'Brazilian social movement committed to community development, environmental conservation, and indigenous rights protection across all regions.',
  true,
  'Approved',
  NOW()
);

-- Brazil Donor
INSERT INTO "Donor" ("firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  'Maria',
  'Santos',
  'brazil.donor@gov.org.br',
  '$2b$10$6JvVjJ6HNC1LI99zwRJIrucWoZdmgpA2.yGczwlhSc.LOEX0AJltK',
  'Brazil',
  'Fundacao Brasileira de Desenvolvimento',
  true,
  'Approved',
  NOW()
);

-- Nigeria Organization
INSERT INTO "Organization" ("orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'Community Action Network Nigeria',
  'Chioma',
  'Okafor',
  'nigeria@gov.org.ng',
  '$2b$10$ePoGJL7FIJckIoc9pLXc/egfroNdAIiZoQ1ihmXbWi3rKzT71eMHG',
  'Nigeria',
  'Nigerian organization working on youth empowerment, economic development, and conflict resolution in communities across the nation.',
  true,
  'Approved',
  NOW()
);

-- Nigeria Donor
INSERT INTO "Donor" ("firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  'Adeyemi',
  'Johnson',
  'nigeria.donor@gov.org.ng',
  '$2b$10$0PpweOLSKd2k0hFHO5AZweUHbLQDrgkrj1Z3/aiKTRC/gar/m97R.',
  'Nigeria',
  'African Growth Initiative',
  true,
  'Approved',
  NOW()
);

-- Egypt Organization
INSERT INTO "Organization" ("orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'Nahda Organisation Egypt',
  'Fatima',
  'Hassan',
  'egypt@gov.org.eg',
  '$2b$10$VKx4zCeRGO5GIkdSb3FXA.rlK9oo49ktX7VJ8b/FQZIBI0p4.sRw.',
  'Egypt',
  'Egyptian civil society organization focused on women empowerment, education reform, and sustainable livelihood development in rural areas.',
  true,
  'Approved',
  NOW()
);

-- Egypt Donor
INSERT INTO "Donor" ("firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  'Ahmed',
  'Mohamed',
  'egypt.donor@gov.org.eg',
  '$2b$10$y.6NBecK.CPvsEpseGNQ2.MWZp4mcIg.HGyUsbpXkrCaN.H/j4PWS',
  'Egypt',
  'Aswan Philanthropic Society',
  true,
  'Approved',
  NOW()
);

-- Japan Organization
INSERT INTO "Organization" ("orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'Good Samaritan Japan',
  'Tanaka',
  'Yuki',
  'japan@gov.org.jp',
  '$2b$10$xAfYRFtfuo09nq1i4G/MGeOHXYmEd7paSgWNpWygoY7Lov6N9hxiu',
  'Japan',
  'Japanese international development organization dedicated to disaster relief, technology transfer, and sustainable rural development projects.',
  true,
  'Approved',
  NOW()
);

-- Japan Donor
INSERT INTO "Donor" ("firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  'Suzuki',
  'Akira',
  'japan.donor@gov.org.jp',
  '$2b$10$i0p/867qLzehrP88o1qL/uRleIj9SkS13QEFn7kI6sP9JwOpYxTMi',
  'Japan',
  'Tokyo International Cooperative',
  true,
  'Approved',
  NOW()
);

-- Canada Organization
INSERT INTO "Organization" ("orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'Maple Community Alliance',
  'John',
  'Smith',
  'canada@gov.org.ca',
  '$2b$10$gO61cl4CUrbkDH.aJnGtie0/kIl.9KtKUcx68uICZF3DzC1jHBiQi',
  'Canada',
  'Canadian organization providing humanitarian aid, disaster relief, and capacity building support to communities in developing regions.',
  true,
  'Approved',
  NOW()
);

-- Canada Donor
INSERT INTO "Donor" ("firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  'Sarah',
  'Johnson',
  'canada.donor@gov.org.ca',
  '$2b$10$2omqUrFFOuaWXaJRKLRhDO8GNK3wHXeDpFqnnwBIYAPYE7xwnTnta',
  'Canada',
  'Vancouver Global Foundation',
  true,
  'Approved',
  NOW()
);

-- Australia Organization
INSERT INTO "Organization" ("orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'Aus Care International',
  'James',
  'Wilson',
  'australia@gov.org.au',
  '$2b$10$.8/fYxKaK2./eoh3He3lIeNm4bPG7hJaFTKDuLe3BZhaowhjooYq2',
  'Australia',
  'Australian international development NGO working on literacy programs, healthcare initiatives, and sustainable agriculture across Asia-Pacific.',
  true,
  'Approved',
  NOW()
);

-- Australia Donor
INSERT INTO "Donor" ("firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  'Emma',
  'Taylor',
  'australia.donor@gov.org.au',
  '$2b$10$ghsG3mpQ7dD2F0bq2DPy1eo/ZWnwIDwFn5ZTlNT.QSExt8L.bZSc.',
  'Australia',
  'Sydney Charitable Trust',
  true,
  'Approved',
  NOW()
);

-- Mexico Organization
INSERT INTO "Organization" ("orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'Fundacion Mexico Solidario',
  'Carlos',
  'Gonzalez',
  'mexico@gov.org.mx',
  '$2b$10$kSnfk4cBElcuPLCTcEpuq.0c1TEhhhafYkLvkvHs3gspchuk5qW76',
  'Mexico',
  'Mexican solidarity foundation focused on indigenous rights, healthcare access, and educational opportunities for marginalized communities.',
  true,
  'Approved',
  NOW()
);

-- Mexico Donor
INSERT INTO "Donor" ("firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  'Maria',
  'Garcia',
  'mexico.donor@gov.org.mx',
  '$2b$10$hAgA9yenQQCcgnke0164VeoMZ3EyOqvnaMfoUpHfuYvrFHx/BxgXS',
  'Mexico',
  'Mexico City Social Initiative',
  true,
  'Approved',
  NOW()
);

-- South Africa Organization
INSERT INTO "Organization" ("orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'Ubuntu Development Initiative',
  'Thabo',
  'Nkosi',
  'south africa@gov.org.za',
  '$2b$10$h3VK.lOAQ5R.nLhGxGyc.uBElpzOBC2rwKHZShlAfXNoWu5Lfhw9e',
  'South Africa',
  'South African organization dedicated to post-conflict reconstruction, youth skills training, and economic empowerment across townships.',
  true,
  'Approved',
  NOW()
);

-- South Africa Donor
INSERT INTO "Donor" ("firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  'Zinhle',
  'Dlamini',
  'south africa.donor@gov.org.za',
  '$2b$10$e8svEQPwpi9WsFA/y1.zreTAE8OboiJVW7S0k9KP8MAsShEaSItqG',
  'South Africa',
  'Cape Town Heritage Foundation',
  true,
  'Approved',
  NOW()
);

