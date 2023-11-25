import { Student } from './student.model';
const getAllStudentsFromDB = async () => {
  const result = Student.find();
  return result;
};

const getSingleStudentFromDB = async (id: string) => {
  const result = Student.aggregate([{ $match: { id } }]);
  return result;
};

const deleteStudentFromDB = async (id: string) => {
  const result = Student.updateOne({ id }, { isDeleted: true });
  return result;
};

export const StudentServices = {
  getAllStudentsFromDB,
  getSingleStudentFromDB,
  deleteStudentFromDB,
};
