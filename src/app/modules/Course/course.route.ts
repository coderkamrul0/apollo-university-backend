import express from 'express';
import { courseValidation } from './course.validation';
import validateRequest from '../../middlewares/validateRequest';
import { courseController } from './course.controller';

const router = express.Router();

router.post(
  '/create-course',
  validateRequest(courseValidation.createCourseValidationSchema),
  courseController.createCourse,
);

router.get('/:id', courseController.getSingleCourse);

router.get('/', courseController.getAllCourse);

router.delete('/:id', courseController.deleteCourse);

export const CourseRoutes = router;
