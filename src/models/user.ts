import { Document, Schema, model } from 'mongoose';

export interface User extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  surname: string;
  email: string;
  roles: Schema.Types.ObjectId[];
  password: string;
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
    updatedAt: { type: Date, default: new Date() },
    deletedAt: { type: Date, default: new Date() }
  },
  { collection: 'users' },
);

export const UserModel = model<User>('User', userSchema);
