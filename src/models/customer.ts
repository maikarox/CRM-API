import { Document, Schema, model } from 'mongoose';

export interface Customer extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  surname: string;
  profileImage?: string;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedBy?: Schema.Types.ObjectId;
  updatedAt?: Date;
  deletedAt?: Date;
}

function updatedByRequired(): boolean {
    return !!this.updatedAt;
}

const customerSchema = new Schema<Customer>({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  profileImage: String,
  createdAt: { type: Date, required: true, default: new Date() },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: new Date() },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: updatedByRequired,
  },
  deletedAt: { type: Date, default: new Date() }
}, { collection: 'customers' });

export const CustomerModel = model<Customer>(
  'Customer',
  customerSchema,
);
