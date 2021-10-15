import { RequestHandler } from 'express';

import {
  createUser,
  grantAdminRole,
  getAllUsers,
  getUserByEmail,
  getUserById,
  removeUser,
  revokeAdminRole,
  softDeleteUser,
  updateUserProfile,
} from '../services/User.service';

export const getUsers: RequestHandler = async (_req, res) => {
  const users = await getAllUsers();

  res.status(200).json({ users });
};

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

  try {
    const newUser = await createUser({ name, surname, email, password });
    return res.status(201).json({ user: newUser });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error creating user: ${err.message}` });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  const { userId } = req.params;
  const { name, surname, email, password } = req.body;

  try {
    const userExists = await getUserById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found.' });
    }

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

export const disableUser: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    const userExists = await getUserById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = await softDeleteUser(userId);
    return res.status(200).json({ user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error soft-deleting user: ${err.message}` });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    const userExists = await getUserById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    await removeUser(userId);
    return res.sendStatus(204);
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Couldn't remove user: ${err.message}` });
  }
};

export const revokeUserAdminRole: RequestHandler = async (req, res) => {
  const { userId } = req.params;

  try {
    const userExists = await getUserById(userId);
    if (!userExists) {
      return res.status(404).json({ message: `User not found.` });
    }

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
    const userExists = await getUserById(userId);
    if (!userExists) {
      return res.status(404).json({ message: `User not found.` });
    }

    const user = await grantAdminRole(userId);
    return res.status(200).json({ user });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error changing admin status: ${err.message}` });
  }
};
