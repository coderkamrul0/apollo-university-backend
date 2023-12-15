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

router.patch(
  '/:id',
  validateRequest(courseValidation.updateCourseValidationSchema),
  courseController.updateCourse,
);

router.get('/', courseController.getAllCourse);

router.delete('/:id', courseController.deleteCourse);

router.put(
  '/:courseId/assign-faculties',
  validateRequest(courseValidation.facultiesWithCourseValidationSchema),
  courseController.assignFacultiesWithCourse,
);
router.delete(
  '/:courseId/remove-faculties',
  validateRequest(courseValidation.facultiesWithCourseValidationSchema),
  courseController.removeFacultiesFromCourse,
);
export const CourseRoutes = router;
