import { Request } from "express";
import { tryCatch } from "src/helpers/try-catch";
import paymentService from "src/services/payment.service";
import { ExpressResponse } from "src/types/Api";

async function getPaymentsByPayTo(req: Request, res: ExpressResponse) {
	const { data, error } = await tryCatch(paymentService.getPaymentsByPayTo(req.params.pay_to));

	if (error) {
		res.status(400).json({ status: "error", msg: error.message ?? "An error occured" });
	}

	res.status(200).json({ status: "success", data: data, msg: "Payments retrieved successfully" });
}

export default { getPaymentsByPayTo };
