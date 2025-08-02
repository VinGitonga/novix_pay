import { IPlan, Plan } from "src/models/plan.model";
import { ObjectId } from "mongodb";

type TCreatePlan = Omit<IPlan, "createdAt" | "updatedAt">;

async function createPlan(body: TCreatePlan) {
	const plan = new Plan(body);

	return await plan.save();
}

async function getPlansByAccount(account: string) {
	return await Plan.find({ account: new ObjectId(account) }).lean();
}

export default { createPlan, getPlansByAccount };
