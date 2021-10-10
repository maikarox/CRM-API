import { RequestHandler } from 'express';

import { User } from '../models';
import {
  createUser,
  grantAdminRole,
  getAllUsers,
  getUserByEmail,
  removeUser,
  revokeAdminRole,
  softDeleteUser,
  updateUserProfile,
} from '../services/User.service';

export const registerUser: RequestHandler = async (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!name || !surname || !email || !password) {
    return res.status(400).json({
      message: 'Name, surname, email and password are required.',
    });
  }

  const user = await getUserByEmail(email);

  if (user) {
    return res
      .status(400)
      .json({ message: `User with email ${email} already exists.` });
  }

  let newUser: User;
  try {
    newUser = await createUser({ name, surname, email, password });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error creating user: ${err.message}` });
  }

  return res.status(201).json({ user: newUser });
};

export const updateUser: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  const { name, surname, email, password } = req.body;

  try {
    const user = await updateUserProfile({
      userId,
      name,
      surname,
      email,
      password,
    });

    return res.status(200).json({ user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error updating user: ${err.message}` });
  }
};

export const getUsers: RequestHandler = async (_req, res) => {
  const users = (await getAllUsers()) || [];

  res.status(200).json({ users });
};

export const deleteUser: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    await removeUser(userId);
    return res.sendStatus(204);
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Couldn't remove user: ${err.message}` });
  }
};

export const disableUser: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await softDeleteUser(userId);
    return res.status(200).json({ user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error disabling user: ${err.message}` });
  }
};

export const revokeUserAdminRole: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await revokeAdminRole(userId);
    return res.status(200).json({ user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error changing admin status: ${err.message}` });
  }
};

export const grantUserAdminRole: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await grantAdminRole(userId);
    return res.status(200).json({ user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error changing admin status: ${err.message}` });
  }
};
