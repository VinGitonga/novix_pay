import type { IAccount } from "./Account";

export interface IDocumentItem {
	_id: string;
	name: string;
	size: number;
	type: string;
	cid: string;
	account: string | IAccount;
	price: number;
	createdAt: string;
	updatedAt: string;
}
