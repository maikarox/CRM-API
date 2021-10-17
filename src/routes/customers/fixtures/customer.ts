import { Schema, Types } from "mongoose";
import { Customer } from "../../../models";
import { userFixtureId } from "../../users/fixtures/users";

export const customerFixtureId = new Types.ObjectId('61616e10fc13ae5c5f001c43') as unknown as Schema.Types.ObjectId;
const createdAt = new Date('2021-06-05');
export const customerFixture: Partial<Customer> = {
  _id: customerFixtureId,
  name: 'Harry',
  surname: 'Smith',
  profileImage: '',
  createdBy: userFixtureId as unknown as Types.ObjectId,
  createdAt 
};
