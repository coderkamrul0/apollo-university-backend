import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { user } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import bcrypt from 'bcrypt';

const loginUser = async (payload: TLoginUser) => {
  // check if the user exist
  const userData = await user.isUserExistsByCustomId(payload?.id);

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found.');
  }
  // check if the user is already deleted
  const isDeleted = userData?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is deleted.');
  }
  // check if the user is blocked
  const userStatus = userData?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is blocked.');
  }
  // check if the password is correct

  if (!(await user.isPasswordMatch(payload?.password, userData?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match.');
  }

  const jwtPayload = {
    userId: userData.id,
    role: userData.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '10d',
  });

  return { accessToken, needsPasswordChange: userData.needsPasswordChange };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  // check if the user exist
  const checkUser = await user.isUserExistsByCustomId(userData?.userId);

  if (!checkUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found.');
  }
  // check if the user is already deleted
  const isDeleted = checkUser?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is deleted.');
  }
  // check if the user is blocked
  const userStatus = checkUser?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is blocked.');
  }
  // check if the password is correct

  if (
    !(await user.isPasswordMatch(payload?.oldPassword, checkUser?.password))
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match.');
  }

  // hash new password
  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_round),
  );

  await user.findOneAndUpdate(
    {
      id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangeAt: new Date(),
    },
  );

  return null;
};

export const AuthService = {
  loginUser,
  changePassword,
};
