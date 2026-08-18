import { Router } from "express";
import {
  registerStudent,
  getStudentById,
  studentDashboard,
  getAllStudent,
} from "../controllers/student.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// router.post("/register", registerStudent);
import { upload } from "../middleware/multer.middleware"
import { adminMiddleware } from "../middleware/admin.middleware";

router.post(
  "/register",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "aadhaar", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  registerStudent
);
router.get("/panel-student",authMiddleware, studentDashboard);
router.get("/get-all-student",authMiddleware, getAllStudent);


router.get("/:id", getStudentById);




export default router;