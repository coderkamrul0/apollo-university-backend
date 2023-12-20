/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';
import { TUser, UserModel } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../config';

const userSchema = new Schema<TUser, UserModel>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['admin', 'student', 'faculty'],
    },
    status: {
      type: String,
      enum: ['in-progress', 'blocked'],
      default: 'in-progress',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_round),
  );
  next();
});

userSchema.post('save', function (doc, next) {
  (doc.password = ''), next();
});

// check id match or not
userSchema.statics.isUserExistsByCustomId = async function (id: string) {
  return await user.findOne({ id });
};
// check password match or not
userSchema.statics.isPasswordMatch = async function (
  plainTextPassWord,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassWord, hashedPassword);
};

export const user = model<TUser, UserModel>('User', userSchema);
