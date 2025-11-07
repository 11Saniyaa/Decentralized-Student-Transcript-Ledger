import express from 'express';
import {
  createRequest,
  getAllRequests,
  getRequestsByStudent,
  updateRequestStatus,
} from '../controllers/requestController.js';

const router = express.Router();

router.post('/', createRequest);
router.get('/all', getAllRequests);
router.get('/student/:prn', getRequestsByStudent);
router.put('/:id/status', updateRequestStatus);
router.get('/', getAllRequests);

export default router;


