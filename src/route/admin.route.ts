import express from "express";
import { adminDashboard, registerAdmin } from "../controllers/admin.controllers";

import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import {
  createCenter,
  getAllCenters,
  getCenterById,
  updateCenter,
  deleteCenter,
  createCourse,
  getAllCourses,
  getCourseById} from "../controllers/center.controllers";
import { createTender, getAllTenders } from "../controllers/tender.controller";
import { upload } from "../middleware/multer.middleware"
import { createSubject, getAllSubjects } from "../controllers/subject.controllers";
import { createNews, getAllNews } from "../controllers/news.controllers";
import { createNotification, getAllNotifications } from "../controllers/notification.controller";


const router = express.Router();

router.get(
  "/dashboard",
  adminDashboard
);
router.post("/dashboard", registerAdmin);




// ===============================
// PUBLIC
// ===============================

router.post(
  "/center",
  authMiddleware,
  adminMiddleware,
  createCenter
);


router.get(
  "/center",
  getAllCenters
);


router.post(
  "/course",
  authMiddleware,
  adminMiddleware,
  createCourse
);

// ADMIN - Create Tender
router.post(
  "/tender",
  authMiddleware,
  adminMiddleware,
  upload.single("pdf"),
  createTender
);


// PUBLIC - Get All Tenders
router.get(
  "/tender",
  getAllTenders
);

router.post(
  "/subject",
  authMiddleware,
  adminMiddleware,
  createSubject
);

router.post(
  "/news",
  authMiddleware,
  adminMiddleware,
  createNews
);

// PUBLIC
router.get(
  "/news",
  getAllNews
);

router.get(
  "/courses",
  getAllCourses
);

// Public can see subjects
router.get(
  "/",
  getAllSubjects
);

router.post(
  "/notification",
  authMiddleware,
  adminMiddleware,
  upload.single("pdf"),
  createNotification
);

// PUBLIC / USERS - Get notifications
router.get(
  "/notification",
  getAllNotifications
);

router.get(
  "/:id",
  getCenterById
);


// ===============================
// ADMIN
// ===============================


router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateCenter
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteCenter
);


export default router;

