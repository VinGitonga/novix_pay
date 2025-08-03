import { model, Model, Schema } from "mongoose";

export interface ISubscription {
	payer: string;
	provider: string;
	amount: number;
	token: string;
	dueDate: Date;
	isRecurring: boolean;
	interval: number;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	executed: boolean;
}

type SubscriptionModel = Model<ISubscription>;

const subscriptionSchema = new Schema<ISubscription, SubscriptionModel>(
	{
		payer: { type: String, required: true },
		provider: { type: String, required: true },
		amount: { type: Number, required: true },
		token: { type: String, required: true },
		dueDate: { type: Date, required: true },
		isRecurring: { type: Boolean, default: true },
		interval: { type: Number }, // interval in milliseconds
		active: { type: Boolean, default: true },
		executed: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

export const Subscription: SubscriptionModel = model<ISubscription, SubscriptionModel>("Subscription", subscriptionSchema);
