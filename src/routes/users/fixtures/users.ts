import { Types, Schema } from 'mongoose';
import { User } from '../../../models';
import { roleId1, roleId3 } from './roles';

export const userFixtureId = new Types.ObjectId(
  '61616e10fc13ae4d5f000c32',
) as unknown as Schema.Types.ObjectId;

export const user2FixtureId = new Types.ObjectId(
  '61616e10fc13ae4d5f000c66',
) as unknown as Schema.Types.ObjectId;

export const userFixture: Partial<User> = {
  _id: userFixtureId,
  name: 'Chanda',
  surname: 'Langstone',
  email: 'user.test1@example.com',
  password: 'ee250b9faa440d344ddebcb27abe9eaac87f8aca7b0584d95bc2cc3d94c9e250',
  roles: [roleId1],
};

export const user2Fixture: Partial<User> = {
  _id: user2FixtureId,
  name: 'Alice',
  surname: 'Stone',
  email: 'alice.stone@example.com',
  password: 'ee250b9faa440d344ddebcb27abe9eaac87f8aca7b0584d95bc2cc3d94c9e250',
  roles: [roleId3],
};
