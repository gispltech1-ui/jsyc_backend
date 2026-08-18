import { Request, Response } from "express";
import prisma from "../config/prisma";

/**
 * CREATE SUBJECT
 * Admin only
 */
export const createSubject = async (
  req: Request,
  res: Response
) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Subject name is required",
      });
    }

    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "Subject already exists",
      });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });

  } catch (error) {
    console.error("Create subject error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


/**
 * GET ALL SUBJECTS
 * Public
 */
export const getAllSubjects = async (
  req: Request,
  res: Response
) => {
  try {

    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });

  } catch (error) {
    console.error("Get subjects error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};