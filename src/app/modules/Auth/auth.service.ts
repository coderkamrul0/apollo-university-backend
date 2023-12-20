import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { user } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import jwt from 'jsonwebtoken';
import config from '../../config';

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

  // Access Granted: Send AccessToken , RefreshToken
  const jwtPayload = {
    userId: userData.id,
    role: userData.role,
  };
  const accessToken = jwt.sign(
    {
      data: jwtPayload,
    },
    config.jst_access_secret as string,
    { expiresIn: '10d' },
  );

  return { accessToken, needsPasswordChange: userData?.needsPasswordChange };
};

export const AuthService = {
  loginUser,
};
