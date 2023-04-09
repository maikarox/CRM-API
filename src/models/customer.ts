import { Document, Schema, model, Types, ObjectId, SortOrder, RootQuerySelector } from 'mongoose';

export interface Customer extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  surname: string;
  profileImage?: Schema.Types.Buffer | string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedBy?: Types.ObjectId;
  updatedAt?: Date;
  deletedAt?: Date;
}

function updatedByRequired(): boolean {
    return !!this.updatedAt;
}

const customerSchema = new Schema<Customer>({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  profileImage: { type: Schema.Types.Buffer },
  createdAt: { type: Date, required: true, default: new Date() },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: new Date() },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: updatedByRequired,
  },
  deletedAt: { type: Date }
}, { collection: 'customers' });

export const CustomerModel = model<Customer>(
  'Customer',
  customerSchema,
);

export async function findCustomerById (id: ObjectId): Promise<Customer>{
  return await CustomerModel.findById({_id: id});
}

export async function getAllCustomers(sortBy: string | { [key: string]: SortOrder }): Promise<Customer[]> {
  return await CustomerModel.find({}).sort(sortBy);
}

export async function createCustomer(customer: RootQuerySelector<Customer>): Promise<Customer>{
  const { name, surname, profileImage, createdAt, createdBy, updatedAt, updatedBy } = customer;
 
  return await CustomerModel.create({
    name,
    surname,
    profileImage,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
  })
}

export async function findCustomerAndUpdate(args: RootQuerySelector<Customer>): Promise<Customer> {
  return await CustomerModel.findOneAndUpdate(
    { _id: args._id },
    {
      $set: {
        ...args,
        updatedAt: new Date(),
        updatedBy: args.actionUserId,
        profileImage: args.profileImage
      }
    },
    { new: true },
  ).lean();
}

export async function softDeleteCustomer(id: string): Promise<Customer> {
  const now = new Date();

  return await CustomerModel.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        deletedAt: now,
        updatedAt: now,
      },
    },
    { new: true },
  ).lean();
}

export async function hasrdDeleteCustomer(id: string): Promise<Customer> {
  return await CustomerModel.findByIdAndDelete({ _id: id });
}