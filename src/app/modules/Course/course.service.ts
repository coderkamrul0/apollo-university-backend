/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { CourseSearchableFields } from './course.constant';
import { TCourse } from './course.interface';
import { Course } from './course.model';

const createCourseIntoDB = async (payload: TCourse) => {
  const result = await Course.create(payload);
  return result;
};

const getAllCourseFromDB = async (query: Record<string, unknown>) => {
  const courseQuery = new QueryBuilder(
    Course.find().populate('preRequisiteCorses.course'),
    query,
  )
    .search(CourseSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await courseQuery.modelQuery;
  return result;
};

const getSingleCourseFromDB = async (id: string) => {
  const result = await Course.findById(id).populate(
    'preRequisiteCorses.course',
  );
  return result;
};

const updateCourseIntoDB = async (id: string, payload: Partial<TCourse>) => {
  const { preRequisiteCorses, ...courseRemaining } = payload;

  // step 1
  const updatedBasicCourseInfo = await Course.findByIdAndUpdate(
    id,
    courseRemaining,
    { new: true, runValidators: true },
  );

  // check if there is any pre requisite courses to update
  if (preRequisiteCorses && preRequisiteCorses.length > 0) {
    // filter out the deleted fields
    const deletedPreRequisites = preRequisiteCorses
      .filter((el) => el.course && el.isDeleted)
      .map((el) => el.course);

    const deletedPreRequisiteCourses = await Course.findByIdAndUpdate(id, {
      $pull: { preRequisiteCorses: { course: { $in: deletedPreRequisites } } },
    });

    // filter out the new course fields
    const newPreRequisiteCourses = preRequisiteCorses.filter(
      (el) => el.course && !el.isDeleted,
    );
    const addPreRequisiteCourses = await Course.findByIdAndUpdate(id, {
      $addToSet: { preRequisiteCorses: { $each: newPreRequisiteCourses } },
    });
  }

  const result = await Course.findById(id).populate(
    'preRequisiteCorses.course',
  );

  return result;
};

const deleteCourseIntoDB = async (id: string) => {
  const result = await Course.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return result;
};

export const courseServices = {
  createCourseIntoDB,
  getAllCourseFromDB,
  getSingleCourseFromDB,
  deleteCourseIntoDB,
  updateCourseIntoDB,
};
