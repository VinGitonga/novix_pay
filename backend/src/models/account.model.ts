import { model, Model, Schema } from "mongoose";

export interface IAccount {
	username?: string;
	isProvider: boolean;
	tg_username?: string;
	wallet_address: string;
	createdAt: string;
	updatedAt: string;
}

type AccountModel = Model<IAccount>;

const accountSchema = new Schema<IAccount, AccountModel>(
	{
		username: { type: String },
		isProvider: { type: Boolean, default: false },
		tg_username: { type: String },
		wallet_address: { type: String, required: true },
	},
	{ timestamps: true }
);

export const Account: AccountModel = model<IAccount, AccountModel>("Account", accountSchema);
