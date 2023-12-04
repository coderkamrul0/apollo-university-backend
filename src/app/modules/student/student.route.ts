import express from 'express';
import { StudentControllers } from './student.controller';
import validateRequest from '../../middlewares/validateRequest';
import { updateStudentValidationSchema } from './student.validation';

const router = express.Router();

router.get('/', StudentControllers.getAllStudents);
router.get(
  '/:studentId',
  validateRequest(updateStudentValidationSchema),
  StudentControllers.getSingleStudent,
);
router.patch('/:studentId', StudentControllers.updateStudent);
router.delete('/:studentId', StudentControllers.deleteStudent);

export const StudentRoutes = router;
