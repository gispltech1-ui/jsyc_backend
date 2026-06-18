import { Router } from "express";
import { registerTeacher, teacherDashboard } from "../controllers/teacher.controller.";

const router = Router();

router.post("/register", registerTeacher);
router.get("/panel-teacher", teacherDashboard);


export default router;