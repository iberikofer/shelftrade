import { Router } from "express";
import {
  requestExchange,
  getMyRequests,
  updateRequestStatus,
} from "../controllers/exchange.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/request/:bookId", requestExchange);
router.get("/requests", getMyRequests);
router.patch("/requests/:id", updateRequestStatus);

export default router;
