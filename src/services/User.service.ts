import { createHash } from 'crypto';
import { Schema } from 'mongoose';

import { RoleModel, User, UserModel } from '../models';

export async function getUserByEmail(email: string): Promise<User> {
  const user = await UserModel.findOne({ email });
  return user;
}

export async function getUser(email: string, password: string): Promise<User> {
  const shaPass = createHash('sha256').update(password).digest('hex');

  return await UserModel.findOne(
    {
      email,
      password: shaPass,
    },
    { password: 0 },
  ).lean();
}

export async function getAllUsers(): Promise<User[]> {
  return await UserModel.find({}, { password: 0 })
    .sort({ updatedAt: -1 })
    .lean();
}

export async function createUser(user: Partial<User>): Promise<User> {
  const { name, surname, email, password } = user;
  const shaPass = createHash('sha256').update(password).digest('hex');

  const userRole = await RoleModel.findOne({ name: 'User' }).lean();

  const now = new Date();
  const newUser = await UserModel.create({
    name,
    surname,
    email,
    password: shaPass,
    roles: [userRole],
    createdAt: now,
    updatedAt: now,
  });

  return newUser;
}

export async function updateUserProfile(
  user: Partial<User> & { userId: string },
): Promise<User> {
  const { userId, name, surname, email, password } = user;
  const _id = userId as unknown as Schema.Types.ObjectId;
  const userData: Record<string, unknown> = {};

  if (name) {
    userData.name = name;
  }

  if (surname) {
    userData.surname = surname;
  }

  if (email) {
    const userWithEmail = await UserModel.findOne({
      _id: { $ne: _id },
      email,
    }).lean();

    if (userWithEmail) {
      throw new Error(`The email ${email} already exists.`);
    }

    userData.email = email;
  }

  if (password) {
    const shaPass = createHash('sha256').update(password).digest('hex');
    userData.password = shaPass;
  }

  const updatedUser = await UserModel.findOneAndUpdate(
    { _id },
    {
      $set: {
        ...userData,
        updatedAt: new Date(),
      },
    },
    { new: true },
  );

  return updatedUser;
}

export async function softDeleteUser(userId: string): Promise<User> {
  const _id = userId as unknown as Schema.Types.ObjectId;
  const now = new Date();
  const deletedUser = await UserModel.findOneAndUpdate(
    { _id },
    {
      $set: {
        deletedAt: now,
        updatedAt: now,
      },
    },
    { new: true },
  );

  return deletedUser;
}

export async function removeUser(userId: string): Promise<void> {
  const _id = userId as unknown as Schema.Types.ObjectId;
  await UserModel.findOneAndDelete({ _id });
}

export async function grantAdminRole(userId: string): Promise<User> {
  const _id = userId as unknown as Schema.Types.ObjectId;

  const adminRole = await RoleModel.findOne({ name: 'Admin' }).lean();

  const userFoundWithRole = await UserModel.findOne({
    _id,
    roles: { $in: [adminRole._id] },
  }).lean();

  if (userFoundWithRole) {
    throw new Error('User is already an admin.');
  }

  const updatedUser = await UserModel.findOneAndUpdate(
    { _id },
    {
      $push: { roles: adminRole._id },
      $set: {
        updatedAt: new Date(),
      },
    },
    { new: true },
  );

  return updatedUser;
}

export async function revokeAdminRole(userId: string): Promise<User> {
  const _id = userId as unknown as Schema.Types.ObjectId;

  const adminRole = await RoleModel.findOne({ name: 'Admin' }).lean();

  const updatedUser = await UserModel.findOneAndUpdate(
    { _id },
    {
      $pull: { roles: adminRole._id },
      $set: {
        updatedAt: new Date(),
      },
    },
    { new: true },
  );

  return updatedUser;
}
