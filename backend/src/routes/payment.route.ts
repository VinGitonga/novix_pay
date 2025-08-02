import { Router } from "express";
import paymentService from "src/services/payment.service";
// import { paymentMiddleware } from "x402-express";

const paymentRouter = Router();

// const payTo = "0x68EcA16c451C55fC4613a2f982090b65234C8D8a";
// const facilitatorUrl = "http://localhost:6099";

// paymentRouter.use(
// 	paymentMiddleware(
// 		payTo,
// 		{
// 			"GET /api/payments/test": {
// 				price: "$1.00",
// 				network: "etherlink-testnet",
// 			},
// 		},
// 		{ url: facilitatorUrl }
// 	)
// );

// paymentRouter.get("/test", (req, res) => {
// 	res.json({
// 		status: "success",
// 		msg: "Payment made successfully",
// 	});
// });

paymentRouter.get("/get/by-pay-to/:pay_to", paymentService.getPaymentsByPayTo);

export default paymentRouter;
