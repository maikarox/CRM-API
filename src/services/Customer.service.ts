/* eslint-disable no-empty */
import { Schema, Types } from 'mongoose';

import { base64ToBinary, binaryToBase64 } from '../helpers/encoding';
import {
  createCustomer,
  Customer,
  findCustomerAndUpdate,
  findCustomerById,
  getAllCustomers as getCustomers,
  hasrdDeleteCustomer as hardDeleteCustomer,
  softDeleteCustomer as setCustomerAsDeleted
} from '../models';

export async function getCustomerById(customerId: string): Promise<Customer>{
  const _id = customerId as unknown as Schema.Types.ObjectId;
  return await findCustomerById(_id);
}

export async function getAllCustomers(): Promise<Partial<Customer>[]> {
  const customers = await getCustomers({ updatedAt: -1 });

  return customers.map(customer => {
    let image: string = null;
    const {
      _id,
      name,
      surname,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      deletedAt,
      profileImage,
    } = customer;

    if (profileImage) {
      try {
        image = binaryToBase64(Buffer.isBuffer(profileImage) ? profileImage: null);
      } catch {}
    }

    return {
      _id,
      name,
      surname,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      deletedAt,
      profileImage: image,
    };
  });
}

export async function createCustomerProfile(
  customer: Partial<Customer> & { actionUser: Types.ObjectId },
): Promise<Partial<Customer>> {
  const { name, surname, profileImage, actionUser } = customer;

  let image: Buffer = null;
  if (profileImage) {
    try {
      image = base64ToBinary(String(profileImage));
    } catch (err) {
      throw new Error('Error converting image to binary.');
    }
  }

  const now = new Date();
  const actionUserId = new Types.ObjectId(actionUser);
  const newCustomer = {
    name,
    surname,
    profileImage: image,
    createdAt: now,
    createdBy: actionUserId,
    updatedAt: now,
    updatedBy: actionUserId,
  };

  const customerRecord = await createCustomer(newCustomer);

  return {
    ...newCustomer,
    _id: customerRecord._id,
    profileImage,
  };
}

export async function updateCustomerProfile(
  customer: Partial<Customer> & {
    customerId: string;
    actionUser: Types.ObjectId;
  },
): Promise<Partial<Customer>> {
  const { customerId, name, surname, profileImage, actionUser } = customer;
  const customerData: Record<string, unknown> = {};

  if (name) {
    customerData.name = name;
  }

  if (surname) {
    customerData.surname = surname;
  }

  let image: Buffer = null;
  if (profileImage) {
    try {
      image = base64ToBinary(String(profileImage));
    } catch (err) {
      throw new Error('Error converting image to binary.');
    }
  }

  const actionUserId = new Types.ObjectId(actionUser);
  const _id = customerId as unknown as Schema.Types.ObjectId;

  const updatedUser = await findCustomerAndUpdate(
    { 
      _id, 
      ...customerData,
      updatedBy: actionUserId,
      profileImage: image 
    },
  );

  const { profileImage: storedImage } = updatedUser;

  let storedProfileImage: string;
  if (!profileImage && storedImage) {
    try {
      storedProfileImage = binaryToBase64(Buffer.from(Buffer.isBuffer(storedImage) ? storedImage : null));
    } catch (err) {
      throw new Error('Error converting binary to base64.');
    }
  }

  return {
    ...customerData,
    profileImage: profileImage || storedProfileImage,
  };
}

export async function softDeleteCustomer(
  customerId: string,
): Promise<Partial<Customer>> {
  return await setCustomerAsDeleted(customerId);
}

export async function removeCustomer(customerId: string): Promise<void> {
  await hardDeleteCustomer(customerId);
}
