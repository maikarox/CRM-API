import { Document, Schema, model, Types } from 'mongoose';

export interface Customer extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  surname: string;
  profileImage?: Buffer | string;
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
