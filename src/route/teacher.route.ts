import { Router } from "express";
import { getAllTeachers, getTeacherById, registerTeacher, teacherDashboard } from "../controllers/teacher.controller.";
import { upload } from "../middleware/multer.middleware";

const router = Router();

// router.post("/register", registerTeacher);
router.post(
  "/register",
  upload.fields([
    {
      name: "photo",
      maxCount: 1,
    },
    {
      name: "resumeCV",
      maxCount: 1,
    },
    {
      name: "educationalCertificates",
      maxCount: 1,
    },
    {
      name: "idProof",
      maxCount: 1,
    },
  ]),
  registerTeacher
);
router.get("/panel-teacher", teacherDashboard);
router.get("/get-all-teacher", getAllTeachers);


router.get("/:id", getTeacherById);

export default router;