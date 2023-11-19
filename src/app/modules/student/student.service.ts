import { TStudent } from './student.interface';
import { Student } from './student.model';

const createStudentIntoDB = async (student: TStudent) => {
  if (await Student.isUserExist(student.id)) {
    throw new Error('User already exists!');
  }
  const result = await Student.create(student); // static method

  // const studentInstance = new Student(student); // built in instance  method
  // if (await studentInstance.isUserExist(student.id)) {
  //   throw new Error('User already exists!');
  // }
  // const result = await studentInstance.save();

  
  return result;
};

const getAllStudentsFromDB = async () => {
  const result = await Student.find();
  return result;
};

const getSingleStudentFromDB = async (id: string) => {
  const result = await Student.findOne({ id });
  return result;
};

export const StudentServices = {
  createStudentIntoDB,
  getAllStudentsFromDB,
  getSingleStudentFromDB,
};
