import express from 'express';
import {
  getPendingOrganizations,
  approveOrganization,
  rejectOrganization
} from '../controllers/organizationController.js';

const router = express.Router();

// GET /organizations/pending - Get all pending organizations
router.get('/pending', getPendingOrganizations);

// PATCH /organizations/:id/approve - Approve an organization
router.patch('/:id/approve', approveOrganization);

// PATCH /organizations/:id/reject - Reject an organization
router.patch('/:id/reject', rejectOrganization);

export default router;
