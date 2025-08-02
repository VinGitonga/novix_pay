import mongoose, { model, Model, Schema } from "mongoose";
import { IPlan } from "./plan.model";

export interface IPayment {
	amount: number;
	payer: string;
	plan?: string | IPlan;
	createdAt: string;
	updatedAt: string;
	transaction: string;
	payTo: string;
}

type PaymentModel = Model<IPayment>;

const paymentSchema = new Schema<IPayment, PaymentModel>(
	{
		amount: { type: Number, required: true },
		payer: { type: String },
		plan: { type: mongoose.Types.ObjectId, ref: "Plan" },
		transaction: { type: String },
		payTo: { type: String },
	},
	{ timestamps: true }
);

export const Payment: PaymentModel = model<IPayment, PaymentModel>("Payment", paymentSchema);
