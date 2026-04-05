-- Migration: Add ASEAN sample Organization and Donor accounts
-- One verified org + one verified donor per ASEAN member state (ASEANCountry enum)
-- Generated with proper bcrypt hashing (SALT_ROUNDS=10)

-- Brunei Organization
INSERT INTO "Organization" ("id", "orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  '87927431-8d11-46a1-aa24-cdca200d0fee',
  'Community Care Brunei',
  'Haji',
  'Rahman',
  'brunei@gov.org.bn',
  '$2b$10$.SRlS0pAh2xb4hD4vH92FOMO9RuXdhsLiJA1g2/fPE9zmWg5adaba',
  'Brunei',
  'Bruneian organization supporting education, health, and community welfare initiatives across the nation.',
  true,
  'Approved',
  NOW()
);

-- Brunei Donor
INSERT INTO "Donor" ("id", "firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  '2f37dcaf-df3f-4016-b319-38000498c6ae',
  'Siti',
  'Yusof',
  'brunei.donor@gov.org.bn',
  '$2b$10$K1Q2nprJvkKNdNzrmemrMOp2HUz/bgGKW93QFClQseJBxtViJOmlu',
  'Brunei',
  'Bandar Seri Begawan Foundation',
  true,
  'Approved',
  NOW()
);

-- Cambodia Organization
INSERT INTO "Organization" ("id", "orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  '397e1b65-835e-489e-b641-8d79765dbb92',
  'Khmer Development Initiative',
  'Sokha',
  'Chea',
  'cambodia@gov.org.kh',
  '$2b$10$CNyoE5.TTA9J0U26ZbS11Oa857S28MFGTkWp/Wa8tzEZvr/ipMt5W',
  'Cambodia',
  'Cambodian NGO focused on rural livelihoods, clean water, and youth skills training.',
  true,
  'Approved',
  NOW()
);

-- Cambodia Donor
INSERT INTO "Donor" ("id", "firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  '9f1c3810-0063-413b-9bf2-a25cf86cbc22',
  'Vannak',
  'Lim',
  'cambodia.donor@gov.org.kh',
  '$2b$10$mxb8X97tQSH50US3nmg82OcCwaeQa11tcO0/iEzebQRVLOcFL6mBS',
  'Cambodia',
  'Phnom Penh Social Trust',
  true,
  'Approved',
  NOW()
);

-- Indonesia Organization
INSERT INTO "Organization" ("id", "orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'd1e9c0cf-cb9e-4453-ae00-5661b78ac616',
  'Maju Bersama Indonesia',
  'Budi',
  'Santoso',
  'indonesia@gov.org.id',
  '$2b$10$oRddhPAzikIMFhtq4fPWEe.hqAdYxYk6kq2WyonIjk/xwrMAdf5KS',
  'Indonesia',
  'Indonesian organization working on disaster resilience, education, and sustainable agriculture.',
  true,
  'Approved',
  NOW()
);

-- Indonesia Donor
INSERT INTO "Donor" ("id", "firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  '2c49abed-4883-4d36-97a5-abe802d25ebc',
  'Dewi',
  'Kusuma',
  'indonesia.donor@gov.org.id',
  '$2b$10$FMc52KoPUwfiDqjQX53APO4goS1RwM16yLzMu5nx/AGbNJb24m3NW',
  'Indonesia',
  'Jakarta Impact Collective',
  true,
  'Approved',
  NOW()
);

-- Laos Organization
INSERT INTO "Organization" ("id", "orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'fe8fa00c-3889-423e-be0e-221846610a8a',
  'Lao Community Partners',
  'Kham',
  'Vongsa',
  'laos@gov.org.la',
  '$2b$10$bUHercGGXSUGofNVQwn81urKnkl6Zo4y7SpaW43Po8HNOpm/bm/Xe',
  'Laos',
  'Lao civil society group supporting rural health, nutrition, and smallholder farming programs.',
  true,
  'Approved',
  NOW()
);

-- Laos Donor
INSERT INTO "Donor" ("id", "firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  '59191eac-41c3-49cd-9637-16f9c3bf5818',
  'Noy',
  'Phimmasone',
  'laos.donor@gov.org.la',
  '$2b$10$cYe93wciazGyVQw2fzH2k.IicOAyLCR3OJN15UvHJH4ikNBaCcJoy',
  'Laos',
  'Vientiane Development Circle',
  true,
  'Approved',
  NOW()
);

-- Malaysia Organization
INSERT INTO "Organization" ("id", "orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  '91ba0999-7212-4cc2-bd36-cb4126308717',
  'Harapan Malaysia',
  'Aisha',
  'Razak',
  'malaysia@gov.org.my',
  '$2b$10$SSUyBo/Qj5j4DtkbJdYQOels08BErzTUqrQR4chONwko2okumqVIy',
  'Malaysia',
  'Malaysian organization advancing inclusive education and urban poverty reduction.',
  true,
  'Approved',
  NOW()
);

-- Malaysia Donor
INSERT INTO "Donor" ("id", "firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  '2c4c4721-5188-480a-bfa0-cc7bc77ae3cb',
  'Wei',
  'Tan',
  'malaysia.donor@gov.org.my',
  '$2b$10$iPEGMVRPOTvCytPTZhyIXeSFO/9b8gzNbDjc.I6S5i2e2xUxy89Eq',
  'Malaysia',
  'Kuala Lumpur Giving Network',
  true,
  'Approved',
  NOW()
);

-- Myanmar Organization
INSERT INTO "Organization" ("id", "orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'ec1d66a8-0059-4235-a299-36135d26ce1e',
  'Golden Land Relief',
  'Kyaw',
  'Min',
  'myanmar@gov.org.mm',
  '$2b$10$/oodCIpoAT1xzixK/rZW/uv3.K7vPoCL9tVwkFz1v4FMwAsJtgmKG',
  'Myanmar',
  'Myanmar-based initiative focused on humanitarian relief and community-led recovery.',
  true,
  'Approved',
  NOW()
);

-- Myanmar Donor
INSERT INTO "Donor" ("id", "firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  '657368f8-6b58-4e3e-9e3a-fe466b596a0f',
  'Thida',
  'Aung',
  'myanmar.donor@gov.org.mm',
  '$2b$10$o/3kL4cZBVOfxsELTuaoQeQZb0iPvtafm4PvZQ/vmhUeN771mNVPC',
  'Myanmar',
  'Yangon Humanitarian Alliance',
  true,
  'Approved',
  NOW()
);

-- Philippines Organization
INSERT INTO "Organization" ("id", "orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  '2ff03894-b07a-480b-8bed-606126cd6a25',
  'Bayanihan Projects PH',
  'Maria',
  'Reyes',
  'philippines@gov.org.ph',
  '$2b$10$DXOl4LBmoGiUwBqbKNTMouOovVvq2qIZn8Yl49hxBcK6Lv7l4oSVO',
  'Philippines',
  'Philippine organization supporting coastal communities, livelihoods, and disaster preparedness.',
  true,
  'Approved',
  NOW()
);

-- Philippines Donor
INSERT INTO "Donor" ("id", "firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  '6ff11aad-5d62-421a-ad28-663f27407c4e',
  'Juan',
  'Dela Cruz',
  'philippines.donor@gov.org.ph',
  '$2b$10$Izw5sniq/WUgqVZucudwReQVeQzepIPSMmq/EsCy3kygrzQx8TzOq',
  'Philippines',
  'Manila Bay Community Fund',
  true,
  'Approved',
  NOW()
);

-- Singapore Organization
INSERT INTO "Organization" ("id", "orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  '341be417-41ec-469d-9784-edc5eeebe976',
  'Lion City Impact',
  'Wei',
  'Lim',
  'singapore@gov.org.sg',
  '$2b$10$6fYl7zGuPrP1/PuPe/s7yuOqEa59LgBXW9J0rUsqxgZZTx1aQMI16',
  'Singapore',
  'Singapore-based organization funding regional development and cross-border partnerships.',
  true,
  'Approved',
  NOW()
);

-- Singapore Donor
INSERT INTO "Donor" ("id", "firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  '6175ae64-4021-4a54-a038-79e39f1b465c',
  'Priya',
  'Sharma',
  'singapore.donor@gov.org.sg',
  '$2b$10$t49z.vuSCBDAO8eFJjzCVOF6dIfuQm26SAdFyPwzpttDmb3LKbup.',
  'Singapore',
  'Singapore Giving Hub',
  true,
  'Approved',
  NOW()
);

-- Thailand Organization
INSERT INTO "Organization" ("id", "orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  'b61f3fba-6e4a-4cb3-a008-686ab60a727a',
  'Siam Community Trust',
  'Nattaya',
  'Srisai',
  'thailand@gov.org.th',
  '$2b$10$/QhVSauawVuqlDLuc7QzvuZAAWM3l6h9wUyTmoq1YrHR3fePjhyTC',
  'Thailand',
  'Thai NGO working on health access, education, and rural infrastructure development.',
  true,
  'Approved',
  NOW()
);

-- Thailand Donor
INSERT INTO "Donor" ("id", "firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  'f91c5042-8478-4835-b99d-3b4515701f51',
  'Somchai',
  'Prasert',
  'thailand.donor@gov.org.th',
  '$2b$10$EhrRSY/x0EY0Y/OM6fNYDOOKM0BqMiJLBqXSHIU5Vl/PGnRlQDegO',
  'Thailand',
  'Bangkok Social Impact Lab',
  true,
  'Approved',
  NOW()
);

-- Vietnam Organization
INSERT INTO "Organization" ("id", "orgName", "firstName", "surname", "email", "password", "country", "bio", "isVerified", "status", "createdAt")
VALUES (
  '2f1de0b0-8b50-4a48-b827-511dd46f12fe',
  'Viet Solidarity Network',
  'Lan',
  'Nguyen',
  'vietnam@gov.org.vn',
  '$2b$10$nmygso7VyrwzbiexuvEjkOXZDAFqY86clQJVUxrjINwKfgP.9.lAm',
  'Vietnam',
  'Vietnamese organization supporting climate-smart agriculture and community health.',
  true,
  'Approved',
  NOW()
);

-- Vietnam Donor
INSERT INTO "Donor" ("id", "firstName", "lastName", "email", "password", "country", "affiliation", "isVerified", "status", "createdAt")
VALUES (
  'abdd1abd-68e3-4e43-8c2a-0ca0b4390fea',
  'Minh',
  'Tran',
  'vietnam.donor@gov.org.vn',
  '$2b$10$DBCzc/irP7I42F.rWBOGKOrSiBdj5byoDmLbtzdzKl3/wkhiccxxi',
  'Vietnam',
  'Ho Chi Minh City Development Fund',
  true,
  'Approved',
  NOW()
);

