import express from 'express';
import { courseValidation } from './course.validation';
import validateRequest from '../../middlewares/validateRequest';
import { courseController } from './course.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

router.post(
  '/create-course',
  auth(USER_ROLE.admin),
  validateRequest(courseValidation.createCourseValidationSchema),
  courseController.createCourse,
);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.faculty, USER_ROLE.student),
  courseController.getSingleCourse,
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(courseValidation.updateCourseValidationSchema),
  courseController.updateCourse,
);

router.get('/', courseController.getAllCourse);

router.delete('/:id', auth(USER_ROLE.admin), courseController.deleteCourse);

router.put(
  '/:courseId/assign-faculties',
  auth(USER_ROLE.admin),
  validateRequest(courseValidation.facultiesWithCourseValidationSchema),
  courseController.assignFacultiesWithCourse,
);
router.delete(
  '/:courseId/remove-faculties',
  auth(USER_ROLE.admin),
  validateRequest(courseValidation.facultiesWithCourseValidationSchema),
  courseController.removeFacultiesFromCourse,
);
export const CourseRoutes = router;
