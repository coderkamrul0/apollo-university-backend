import config from '../../config';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { user } from './user.model';

const createStudentIntoDB = async (password: string, studentData: TStudent) => {
  const userData: Partial<TUser> = {};

  // if password is not given , use default password
  userData.password = password || config.default_password;

  // set student role
  userData.role = 'student';

  // set manually generated it;
  userData.id = '2023100001';

  // create a user
  const newUser = await user.create(userData);

  // create a student
  if (Object.keys(newUser).length) {
    studentData.id = newUser.id; // embedding
    studentData.user = newUser._id; // referencing

    const newStudent = await Student.create(studentData);
    return newStudent;
  }
};

export const UserService = {
  createStudentIntoDB,
};
