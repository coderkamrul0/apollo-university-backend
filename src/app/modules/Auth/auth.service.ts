import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { user } from '../user/user.model';
import { TLoginUser } from './auth.interface';

const loginUser = async (payload: TLoginUser) => {
  // check if the user exist
  const isUserExists = await user.findOne({ id: payload?.id });
  console.log(isUserExists);
  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found.');
  }
  // check if the user is already deleted
  const isDeleted = isUserExists?.isDeleted;
  if (isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is deleted.');
  }
  // check if the user is blocked
  const userStatus = isUserExists?.status;
  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is blocked.');
  }

  // Access Granted: Send AccessToken , RefreshToken
  return {};
};

export const AuthService = {
  loginUser,
};
