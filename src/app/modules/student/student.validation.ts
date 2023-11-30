import { z } from 'zod';

// Guardian schema
export const GuardianValidationSchema = z.object({
  fatherName: z.string().min(1).max(100),
  fatherOccupation: z.string().min(1).max(100),
  fatherContactNo: z.string().min(1).max(15),
  motherName: z.string().min(1).max(100),
  motherOccupation: z.string().min(1).max(100),
  motherContactNo: z.string().min(1).max(15),
});

// UserName Validationschema
export const UserNameValidationSchema = z.object({
  firstName: z.string().min(1).max(20),
  middleName: z.string().min(1).max(20).optional(),
  lastName: z.string().min(1).max(20),
});

// LocalGuardian Validationschema
export const LocalGuardianValidationSchema = z.object({
  name: z.string().min(1).max(100),
  occupation: z.string().min(1).max(100),
  contactNo: z.string().min(1).max(15),
  address: z.string().min(1).max(255),
});

// Student Validationschema
export const createStudentValidationSchema = z.object({
  body: z.object({
    password: z.string(),
    student: z.object({
      name: UserNameValidationSchema,
      gender: z.enum(['male', 'female', 'other']),
      dateOfBirth: z.string().optional(),
      email: z.string().email(),
      contactNo: z.string().min(1).max(15),
      emergencyContactNo: z.string().min(1).max(15),
      bloodGroup: z
        .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .optional(),
      presentAddress: z.string().min(1).max(255),
      permanentAddress: z.string().min(1).max(255),
      guardian: GuardianValidationSchema,
      localGuardian: LocalGuardianValidationSchema,
      admissionSemester: z.string(),
      profileImg: z.string().optional(),
    }),
  }),
});

export const studentValidations = {
  createStudentValidationSchema,
};
