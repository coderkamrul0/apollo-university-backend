import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TUserRole } from '../modules/user/user.interface';
import { user } from '../modules/user/user.model';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
    }

    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;

    const { role, userId, iat } = decoded;

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

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
