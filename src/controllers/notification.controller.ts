import { Request, Response } from "express";
import prisma from "../config/prisma";

export const createNotification = async (
  req: Request,
  res: Response
) => {
  try {
    const { title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const pdfUrl = req.file
      ? req.file.path.replace(/\\/g, "/")
      : null;

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: type || "GENERAL",
        isForAll: true,
        pdfUrl,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getAllNotifications = async (
  req: Request,
  res: Response
) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        isForAll: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};