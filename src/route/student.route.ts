import { Router } from "express";
import {
  registerStudent,
  getStudentById,
  studentDashboard,
  getAllStudent,
} from "../controllers/student.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", registerStudent);
router.get("/panel-student",authMiddleware, studentDashboard);
router.get("/get-all-student",authMiddleware, getAllStudent);


router.get("/:id", getStudentById);




export default router;