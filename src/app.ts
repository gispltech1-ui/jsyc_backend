import express from "express";
import cors from "cors";

import studentRoutes from "./route/student.route";
import teacherRoutes from "./route/teacher.route";
import globalLogin from "./route/auth.route";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/auth", globalLogin);

export default app;