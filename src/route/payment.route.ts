import express from "express";
import {
  initiatePayment,
  paymentSuccess,
  paymentFailure,
  getPayment,
  paymentDashboard,
  getAllPayments,
} from "../controllers/payment.controllers";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/initiate", initiatePayment);

router.post("/success", paymentSuccess);

router.post("/failure", paymentFailure);




// ==========================================
// ADMIN PAYMENT DASHBOARD
// ==========================================

router.get(
  "/admin/dashboard",
  authMiddleware,
  paymentDashboard
);


// ==========================================
// ALL PAYMENTS
// ==========================================

router.get(
  "/admin/all",
  authMiddleware,
  getAllPayments
);



router.get("/:transactionId", getPayment);


export default router;