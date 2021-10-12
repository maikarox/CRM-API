import { Schema, Types } from 'mongoose';

export const roleId1 = new Types.ObjectId(
  '616191c1fc13ae60130001e5',
) as unknown as Schema.Types.ObjectId;
export const roleId2 = new Types.ObjectId(
  '616191c1fc13ae60130001f6',
) as unknown as Schema.Types.ObjectId;

export const rolesFixture = [
  {
    _id: roleId1,
    name: 'Role-1',
    permissions: ['permission1', 'permission2', 'permission3'],
  },
  {
    _id: roleId2,
    name: 'Role-2',
    permissions: ['permission4', 'permission5', 'permission6'],
  },
];
