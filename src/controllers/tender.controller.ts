import { Request, Response } from "express";
import prisma from "../config/prisma";


// ==========================================
// CREATE TENDER
// ==========================================

export const createTender = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      description,
      tenderNo,
      publishDate,
      closingDate,
    } = req.body;

    // Validate title
    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tender title is required",
      });
    }

    // Validate PDF
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Tender PDF is required",
      });
    }

    const tender = await prisma.tender.create({
      data: {
        title: title.trim(),

        description:
          description?.trim() || null,

        tenderNo:
          tenderNo?.trim() || null,

        publishDate: publishDate
          ? new Date(publishDate)
          : new Date(),

        closingDate: closingDate
          ? new Date(closingDate)
          : null,

        pdfUrl: req.file.path,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Tender created successfully",
      data: tender,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ==========================================
// GET ALL TENDERS
// ==========================================

export const getAllTenders = async (
  req: Request,
  res: Response
) => {
  try {

    const tenders = await prisma.tender.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: tenders.length,
      data: tenders,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

