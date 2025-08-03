import type { IAccount } from "./Account";

export interface IDocumentItem {
	_id: string;
	name: string;
	size: number;
	type: string;
	cid: string;
	account: string | IAccount;
	createdAt: string;
	updatedAt: string;
}
