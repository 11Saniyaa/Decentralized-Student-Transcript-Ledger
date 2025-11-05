import express from 'express';
import {
  createStudent,
  getStudentByPRN,
  getStudentByWallet,
  getAllStudents,
} from '../controllers/studentController.js';

const router = express.Router();

router.post('/', createStudent);
router.get('/all', getAllStudents);
router.get('/:prn', getStudentByPRN);
router.get('/', getStudentByWallet); // Query by ?walletId=

export default router;

