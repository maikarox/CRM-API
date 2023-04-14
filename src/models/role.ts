import { Document, Schema, model, RootQuerySelector } from 'mongoose';

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

export async function findRoleByName(name: string): Promise<Role>{
  return await RoleModel.findOne({ name }).lean();
}

export async function findRoles(args: RootQuerySelector<Role>): Promise<Role[]>{
  return await RoleModel.find(args);
}
