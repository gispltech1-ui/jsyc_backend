import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getAllCourses = async (
  req: Request,
  res: Response
) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};