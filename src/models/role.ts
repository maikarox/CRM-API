import { Document, Schema, model } from 'mongoose';

export interface Role extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  permissions: string[];
}

const roleSchema = new Schema<Role>({
  name: { type: String, required: true },
  permissions: { type: [String], required: true },
}, { collection: 'roles' });

export const RoleModel = model<Role>('Role', roleSchema);
