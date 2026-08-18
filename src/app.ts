import express from "express";
import cors from "cors";

import studentRoutes from "./route/student.route";
import teacherRoutes from "./route/teacher.route";
import adminRoutes from "./route/admin.route";
import globalLogin from "./route/auth.route";
import paymentRoutes from "./route/payment.route";
import globalRoutes from "./route/global.route";
import path from "path";

const app = express();
// test
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploaded files
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", globalLogin);

app.use("/api/payment", paymentRoutes);
app.use("/api/global", globalRoutes);
// app.use("/api/global", globalRoutes);

export default app;