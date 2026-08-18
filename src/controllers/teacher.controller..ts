import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";

export const registerTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      mobile,
      email,

      fullName,
      dob,
      gender,
      address,

      highestQualification,
      teachingExperience,
      expertiseSubjects,
      skills,
      certifications,

      preferredCenter1,
      preferredCenter2,
      subjectsCanTeach,

      paymentMethod,
    } = req.body;

    const files = req.files as {
      photo?: Express.Multer.File[];
      resumeCV?: Express.Multer.File[];
      educationalCertificates?: Express.Multer.File[];
      idProof?: Express.Multer.File[];
    };

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { mobileNumber: mobile },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Temporary password (replace later with OTP/password flow)
    const password = mobile
    const hashedPassword = await bcrypt.hash(password, 10);

    const transactionId = `JSYC-TEA-${Date.now()}`;

    const TEACHER_REGISTRATION_FEE = 100;

    const result = await prisma.$transaction(async (tx: any) => {
      // Create User
      const user = await tx.user.create({
        data: {
          role: "TEACHER",

          mobileNumber: mobile,

          email,

          password: hashedPassword,

          isVerified: true,
        },
      });

      // Create Teacher
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,

          fullName,

          dob: dob ? new Date(dob) : null,

          gender,

          address,

          highestQualification,

          teachingExperience: teachingExperience
            ? Number(teachingExperience)
            : null,

          expertiseSubjects,

          skills,

          certifications,

          preferredCenter1,

          preferredCenter2,

          subjectsCanTeach,
        },
      });

      // Documents
      await tx.teacherDocument.create({
        data: {
          teacherId: teacher.id,

          photo: files.photo?.[0]?.path || null,

          resumeCV: files.resumeCV?.[0]?.path || null,

          educationalCertificates:
            files.educationalCertificates?.[0]?.path || null,

          idProof:
            files.idProof?.[0]?.path || null,
        },
      });

      // Payment
      const payment = await tx.payment.create({
        data: {
          teacherId: teacher.id,

          paymentFor: "TEACHER_REGISTRATION",

          amount: TEACHER_REGISTRATION_FEE,

          paymentMethod: paymentMethod || "PAYU",

          transactionId,

          status: "PENDING",
        },
      });

      return {
        user,
        teacher,
        payment,
      };
    });

    return res.status(201).json({
      success: true,
      message: "Teacher registered successfully",
      data: {
        user: result.user,
        teacher: result.teacher,
        transactionId:
          result.payment.transactionId,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const teacherDashboard = async (
  req: any,
  res: Response
) => {
  try {

    const teacher = await prisma.teacher.findUnique({
      where: {
        userId: req.user.userId
      },
      include: {
        user: true,
        payments: true
      }
    });

    return res.json({
      success: true,
      data: teacher
    });

  } catch (error) {
    return res.status(500).json({
      success: false
    });
  }
};

export const getTeacherById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id }:any = req.params;

    const teacher = await prisma.teacher.findFirst({
      where: {
        userId: id,
      },
      include: {
        user: true,

        documents: true,

        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: teacher,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};

export const getAllTeachers = async (
  req: Request,
  res: Response
) => {
  try {
    // ==============================
    // PAGINATION
    // ==============================

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = 10;

    const skip = (page - 1) * limit;

    // ==============================
    // GET TEACHERS + TOTAL COUNT
    // ==============================

    const [teachers, totalTeachers] =
      await prisma.$transaction([
        prisma.teacher.findMany({
          skip,
          take: limit,

          include: {
            user: true,

            documents: true,

            payments: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.teacher.count(),
      ]);

    // ==============================
    // TOTAL PAGES
    // ==============================

    const totalPages = Math.ceil(
      totalTeachers / limit
    );

    // ==============================
    // RESPONSE
    // ==============================

    return res.status(200).json({
      success: true,

      data: teachers,

      pagination: {
        currentPage: page,
        perPage: limit,

        totalTeachers,
        totalPages,

        hasNextPage: page < totalPages,

        hasPreviousPage: page > 1,
      },
    });

  } catch (error) {

    console.error(
      "Get all teachers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};