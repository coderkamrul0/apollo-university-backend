import config from '../../config';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser } from './user.interface';
import { user } from './user.model';
import { generateStudentId } from './user.utils';

const createStudentIntoDB = async (password: string, payload: TStudent) => {
  const userData: Partial<TUser> = {};

  // if password is not given , use default password
  userData.password = password || config.default_password;

  // set student role
  userData.role = 'student';


  // find academic semester info
  const admissionSemester = await AcademicSemester.findById(
    payload.admissionSemester,
  );
  if (!admissionSemester) {
    // handle the error or return accordingly
    throw new Error('Admission semester not found');
  }

  //set  generated id
  userData.id = await generateStudentId(admissionSemester);

  // create a user
  const newUser = await user.create(userData);

  // create a student
  if (Object.keys(newUser).length) {
    payload.id = newUser.id; // embedding
    payload.user = newUser._id; // referencing

    const newStudent = await Student.create(payload);
    return newStudent;
  }
};

export const UserService = {
  createStudentIntoDB,
};
