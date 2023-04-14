import { Document, Schema, model, ObjectId, RootQuerySelector } from 'mongoose';

export interface User extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  surname: string;
  email: string;
  roles: Schema.Types.ObjectId[];
  password: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    roles: { type: [Schema.Types.ObjectId], ref: 'Role', required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, required: true, default: new Date() },
    updatedAt: { type: Date, default: new Date() },
    deletedAt: { type: Date, default: new Date() }
  },
  { collection: 'users' },
);

export const UserModel = model<User>('User', userSchema);

export async function createUser(user: RootQuerySelector<User>): Promise<User>{
  const { name, surname, email, password, roles, createdAt, updatedAt } = user;
 
  return await UserModel.create({
    name,
    surname,
    email,
    password,
    roles,
    createdAt,
    updatedAt,
  })
}

export async function getAllUsers(): Promise<User[]> {
  return await UserModel.find({}, { password: 0 })
  .sort({ updatedAt: -1 })
  .lean();
}

export async function findUserById(id: ObjectId):  Promise<User>{
  return await UserModel.findOne({ _id: id }, { password: 0 }).lean();
}

export async function findUser(args: RootQuerySelector<User>):  Promise<User> {
  return await UserModel.findOne(args, { password: 0 }).lean();
}

export async function findUserAndUpdate(args: RootQuerySelector<User>): Promise<User> {
  const updatedAt = new Date();
  
  return await UserModel.findOneAndUpdate(
    { _id: args._id },
    {
      $set: {
        ...args,
        updatedAt,
      },
    },
    { new: true },
  );
}

export async function addUserRole ({ id, role }: { id: User['_id'], role: Schema.Types.ObjectId }): Promise<User> {
  const updatedAt = new Date();

  return await UserModel.findOneAndUpdate(
    { _id: id },
    {
      $push: { roles: role },
      $set: {
        updatedAt,
      },
    },
    { new: true },
  );
}

export async function removeUserRole ({ id, role }: { id: User['_id'], role: Schema.Types.ObjectId }): Promise<User> {
  const updatedAt = new Date();

  return await UserModel.findOneAndUpdate(
    { _id: id },
    {
      $pull: { roles: role },
      $set: {
        updatedAt
      },
    },
    { new: true },
  );
}

export async function softDeleteUser (id: string): Promise<User> {
  const now = new Date();
  
  return await UserModel.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        deletedAt: now,
        updatedAt: now,
      },
    },
    { new: true },
  );
}

export async function hardDeleteUser (id: string): Promise<User> {
  return await UserModel.findOneAndDelete({ _id: id })
}