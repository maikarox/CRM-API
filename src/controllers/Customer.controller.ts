import { RequestHandler } from 'express';

import {
  createCustomerProfile,
  getAllCustomers,
  getCustomerById,
  removeCustomer,
  softDeleteCustomer,
  updateCustomerProfile,
} from '../services/Customer.service';

export const getCustomers: RequestHandler = async (_req, res) => {
  const customers = await getAllCustomers();

  res.status(200).json({ customers });
};

export const createCustomer: RequestHandler = async (req, res) => {
  const { name, surname, profileImage, actionUser } = req.body;

  if (!name || !surname) {
    return res.status(400).json({
      message: 'Name and surname are required.',
    });
  }

  try {
    const customer = await createCustomerProfile({
      name,
      surname,
      profileImage,
      actionUser,
    });

    return res.status(201).json({ customer });
  } catch (err) {
    return res.status(500).json({
      message: `Error creating customer: ${err.message}`,
    });
  }
};

export const updateCustomer: RequestHandler = async (req, res) => {
  const { name, surname, profileImage, actionUser } = req.body;
  const { customerId } = req.params;

  if (!name && !surname && !profileImage) {
    return res.status(400).json({
      message:
        'Nothing to update, send at least one: name, surname or profileImage.',
    });
  }

  try {
    const customerExists = await getCustomerById(customerId);
    if (!customerExists) {
      return res.status(404).json({ message: 'Customer does not exist.' });
    }

    const customer = await updateCustomerProfile({
      customerId,
      name,
      surname,
      profileImage,
      actionUser,
    });

    return res.status(200).json({ customer });
  } catch (err) {
    return res.status(500).json(`Error updating customer: ${err.message}`);
  }
};

export const disableCustomer: RequestHandler = async (req, res) => {
  const { customerId } = req.params;

  try {
    const customerExists = await getCustomerById(customerId);
    if (!customerExists) {
      return res.status(404).json({ message: 'Customer does not exist.' });
    }

    const customer = await softDeleteCustomer(customerId);
    return res.status(200).json({ customer });
  } catch (err) {
    return res.status(500).json(`Error soft-deleting customer: ${err.message}`);
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  const { customerId } = req.params;

  try {
    const customerExists = await getCustomerById(customerId);
    if (!customerExists) {
      return res.status(404).json({ message: 'Customer does not exist.' });
    }

    await removeCustomer(customerId);
    return res.sendStatus(204);
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Couldn't remove customer: ${err.message}` });
  }
};
