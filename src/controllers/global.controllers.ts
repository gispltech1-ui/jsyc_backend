import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getAllData = async (
  req: Request,
  res: Response
) => {
  try {
    const [courses, subjects, centers] = await Promise.all([
      prisma.course.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.subject.findMany(),

      prisma.center.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Master data fetched successfully",
      data: {
        courses,
        subjects,
        centers,
      },
    });
  } catch (error) {
    console.error("Get Master Data Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};