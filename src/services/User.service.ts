import { createHash } from 'crypto';
import { Schema } from 'mongoose';
import { Role } from '../constants/roles';

import { 
  addUserRole,
  createUser as addUser,
  findRoleByName,
  findUser,
  findUserAndUpdate,
  findUserById,
  getAllUsers as getUsers,
  hardDeleteUser,
  removeUserRole,
  softDeleteUser as setUserAsDeleted,
  User,
} from '../models';

export async function getUserByEmail(email: string): Promise<User> {
  const user = await findUser({email});
  return user;
}

export async function getUserById(userId: string): Promise<User> {
  const _id = userId as unknown as Schema.Types.ObjectId;
  const user = await findUserById(_id);
  return user;
}

export async function getUser(email: string, password: string): Promise<User> {
  const shaPass = createHash('sha256').update(password).digest('hex');

  return await findUser(
    {
      email,
      password: shaPass,
    },
  );
}

export async function getAllUsers(): Promise<User[]> {
  return await getUsers();
}

export async function createUser(user: Partial<User>): Promise<Partial<User>> {
  const { name, surname, email, password } = user;
  const shaPass = createHash('sha256').update(password).digest('hex');

  const userRole = await findRoleByName(Role.USER);

  const now = new Date();
  const newUser = await addUser({
    name,
    surname,
    email,
    password: shaPass,
    roles: [userRole._id],
    createdAt: now,
    updatedAt: now,
  });

  return {
    _id: newUser._id,
    name,
    surname,
    email,
    createdAt: now,
    updatedAt: now,
    roles: [userRole._id]
  };
}

export async function updateUserProfile(
  user: Partial<User> & { userId: string },
): Promise<Partial<User>> {
  const { userId, name ='', surname = '', email = '', password = ''} = user;
  const _id = userId as unknown as Schema.Types.ObjectId;
  const userData: Record<string, unknown> = {};

  if (name) {
    userData.name = name;
  }

  if (surname) {
    userData.surname = surname;
  }

  if (email) {
    const userWithEmail = await findUser({
      _id: { $ne: _id },
      email,
    });

    if (userWithEmail) {
      throw new Error(`The email ${email} already exists.`);
    }

    userData.email = email;
  }

  if (password) {
    const shaPass = createHash('sha256').update(password).digest('hex');
    userData.password = shaPass;
  }

  const updatedUser = await findUserAndUpdate(
    { _id, ...userData},
  );

  return {
    _id,
    name: updatedUser.name,
    surname: updatedUser.surname,
    email: updatedUser.email,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
    roles: updatedUser.roles,
  };
}

export async function softDeleteUser(userId: string): Promise<Partial<User>> {
  const deletedUser = await setUserAsDeleted(userId);

  return {
    _id: deletedUser._id,
    name: deletedUser.name,
    surname: deletedUser.surname,
    createdAt: deletedUser.createdAt,
    updatedAt: deletedUser.updatedAt,
    deletedAt: deletedUser.deletedAt,
    roles: deletedUser.roles,
  };
}

export async function removeUser(userId: string): Promise<void> {
  await hardDeleteUser(userId);
}

export async function grantAdminRole(userId: string): Promise<Partial<User>> {
  const _id = userId as unknown as Schema.Types.ObjectId;

  const adminRole = await await findRoleByName(Role.ADMIN);

  const userFoundWithRole = await findUser({
    _id,
    roles: { $in: [adminRole._id] },
  });

  if (userFoundWithRole) {
    throw new Error('User is already an admin.');
  }

  const updatedAt = new Date();
  const updatedUser = await addUserRole(
    { id: _id, role: adminRole._id },
  );

  return {
    _id,
    name: updatedUser.name,
    surname: updatedUser.surname,
    email: updatedUser.email,
    createdAt: updatedUser.createdAt,
    updatedAt,
    roles: updatedUser.roles,
  };
}

export async function revokeAdminRole(userId: string): Promise<Partial<User>> {
  const _id = userId as unknown as Schema.Types.ObjectId;

  const adminRole = await findRoleByName(Role.ADMIN);

  const updatedAt = new Date();
  const updatedUser = await removeUserRole(
    { id: _id, role: adminRole._id },
  );

  return {
    _id,
    name: updatedUser.name,
    surname: updatedUser.surname,
    createdAt: updatedUser.createdAt,
    updatedAt,
    roles: updatedUser.roles,
  };
}
