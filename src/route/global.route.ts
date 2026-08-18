import express from "express";
import {
  getAllData,
} from "../controllers/global.controllers";

const router = express.Router();

router.get("/", getAllData);


export default router;