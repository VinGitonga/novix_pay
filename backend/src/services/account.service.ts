import { Account } from "src/models/account.model";
import { ICreateAccount } from "./dto/account.dto";

export const createAccount = async (body: ICreateAccount) => {
	const accountExists = await Account.findOne({
		wallet_address: {
			$regex: `^${body.wallet_address}$`,
			$options: "i",
		},
	}).lean();

	if (accountExists) {
		throw new Error("Account already exists");
	}

	const account = new Account(body);

	return await account.save();
};

export const getAccountByWallet = async (wallet_address: string) => {
	return await Account.findOne({
		wallet_address: {
			$regex: `^${wallet_address}$`,
			$options: "i",
		},
	}).lean();
};
