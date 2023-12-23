import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { user } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import bcrypt from 'bcrypt';
import { createToken, verifyToken } from './auth.utils';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../utils/sendEmail';

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

  // access token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  // refresh token
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: userData.needsPasswordChange,
  };
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

const refreshToken = async (token: string) => {
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { userId, iat } = decoded;

  // check if the user exist
  const checkUser = await user.isUserExistsByCustomId(userId);

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

  if (
    checkUser.passwordChangeAt &&
    user.isJWTIssuedBeforeChanged(checkUser.passwordChangeAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
  }

  const jwtPayload = {
    userId: checkUser.id,
    role: checkUser.role,
  };

  // access token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return { accessToken };
};

const forgetPassword = async (userId: string) => {
  // check if the user exist
  const checkUser = await user.isUserExistsByCustomId(userId);

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

  const jwtPayload = {
    userId: checkUser.id,
    role: checkUser.role,
  };

  // access token
  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );

  const resetUiLink = `${config.reset_password_ui_link}?id=${checkUser.id}&token=${resetToken}`;
  console.log(resetUiLink);

  sendEmail(checkUser.email, resetUiLink);
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string,
) => {
  const checkUser = await user.isUserExistsByCustomId(payload.id);

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

  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string,
  ) as JwtPayload;

  if (payload.id !== decoded.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'FORBIDDEN.');
  }

  // hash new password
  const newHashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_round),
  );

  await user.findOneAndUpdate(
    {
      id: decoded.userId,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangeAt: new Date(),
    },
  );
};

export const AuthService = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};
