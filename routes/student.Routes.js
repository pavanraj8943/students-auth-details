
import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from '../controllers/student.Controller.js';
import { verifyToken } from '../middleware/auth.Middleware.js';

const router = express.Router();

router.get('/', verifyToken, getAllStudents);
router.get('/:id', verifyToken, getStudentById);
router.post('/', verifyToken, createStudent);
router.put('/:id', verifyToken, updateStudent);
router.delete('/:id', verifyToken, deleteStudent);

export default router;

