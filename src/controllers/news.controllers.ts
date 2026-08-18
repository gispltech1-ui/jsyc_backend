import { Request, Response } from "express";
import prisma from "../config/prisma";

/**
 * CREATE NEWS
 * Admin only
 */
export const createNews = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      description,
      content,
      publishDate,
      imageUrl,
      isPublished,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "News title is required",
      });
    }

    const news = await prisma.news.create({
      data: {
        title: title.trim(),

        description: description?.trim() || null,

        content: content?.trim() || null,

        publishDate: publishDate
          ? new Date(publishDate)
          : new Date(),

        imageUrl: imageUrl || null,

        isPublished:
          isPublished !== undefined
            ? Boolean(isPublished)
            : true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "News published successfully",
      data: news,
    });

  } catch (error) {
    console.error("Create news error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


/**
 * GET ALL PUBLISHED NEWS
 * Public
 */
export const getAllNews = async (
  req: Request,
  res: Response
) => {
  try {
    const news = await prisma.news.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        publishDate: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });

  } catch (error) {
    console.error("Get news error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};