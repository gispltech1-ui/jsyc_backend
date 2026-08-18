import { Request, Response } from "express";
import prisma from "../config/prisma";


import bcrypt from "bcryptjs";


export const registerStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      mobile,
      otp,

      firstName,
      fatherName,
      motherName,

      gender,
      dob,

      email,
      address,
      district,

      academicQualification,
      schoolCollegeName,
      passingYear,
      category,
      experience,

      courseId,
      subjectId,
      centerId,
      batchId,

      learningMode,
      preferredTiming,

      declarationAccepted,
      paymentMethod,
    } = req.body;


    const files = req.files as {
      photo?: Express.Multer.File[];
      signature?: Express.Multer.File[];
      aadhaar?: Express.Multer.File[];
      certificate?: Express.Multer.File[];
    };

    const passportPhoto =
      files?.photo?.[0]?.path ?? "";

    const signature =
      files?.signature?.[0]?.path ?? "";

    const aadhaarCard =
      files?.aadhaar?.[0]?.path ?? "";

    const academicCertificate =
      files?.certificate?.[0]?.path ?? "";

    // const {
    //   mobileNumber,
    //   email,
    //   password,
    //   personalDetails,
    //   academicDetails,
    //   enrollmentDetails,
    //   documents
    // } = req.body;

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

    const defaultPassword = mobile;

    const hashedPassword = await bcrypt.hash(
      defaultPassword,
      10
    );

    // const hashedPassword = await bcrypt.hash(
    //   password,
    //   10
    // );

    const transactionId = `JSYC-STD-${Date.now()}`;
    const STUDENT_REGISTRATION_FEE = 100;

    const result = await prisma.$transaction(
      async (tx: any) => {
        const user = await tx.user.create({
          data: {
            role: "STUDENT",
            mobileNumber: mobile,
            email,
            password: hashedPassword,
            isVerified: true,
          },
        });

        const student = await tx.student.create({
          data: {
            userId: user.id,

            fullName: firstName,

            fatherName,

            motherName,

            dob: new Date(dob),

            gender,

            address,

            district,

            state: "Jharkhand",

            highestQualification:
              academicQualification,

            schoolCollege:
              schoolCollegeName,

            passingYear: Number(passingYear),

            category,

            experience,
          },
        });

        await tx.enrollment.create({
          data: {
            studentId: student.id,

            courseId,

            subjectId,

            centerId,

            batch: batchId,

            learningMode,

            preferredTiming,
          },
        });

        await tx.studentDocument.create({
          data: {
            studentId: student.id,

            passportPhoto,

            signature,

            aadhaarCard,

            academicCertificate,
          },
        });

        //         await tx.payment.create({
        //   data: {
        //     studentId: student.id,

        //     paymentFor: "STUDENT_REGISTRATION",

        //     amount: STUDENT_REGISTRATION_FEE,

        //     paymentMethod: "PAYU",

        //     transactionId,

        //     status: "PENDING",
        //   },
        // });


        const paymentRecord = await tx.payment.create({
          data: {
            studentId: student.id,

            paymentFor: "STUDENT_REGISTRATION",

            amount: STUDENT_REGISTRATION_FEE,

            paymentMethod: paymentMethod || "PAYU",

            transactionId,

            status: "PENDING",
          },
        });
        return {
          studentId: student.id,
          transactionId: paymentRecord.transactionId,
          amount: paymentRecord.amount,
        };
      }
    );

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: {
        studentId: result.studentId,
        transactionId: result.transactionId,
        amount: result.amount,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};


export const getStudentById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id }:any = req.params;

    const student = await prisma.student.findUnique({
      where: {
        userId:id,
      },
      include: {
        user: true,

        documents: true,

        enrollment: {
          include: {
            course: true,
            subject: true,
            center: true,
          },
        },

        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const studentDashboard = async (
  req: any,
  res: Response
) => {
  try {

    const student = await prisma.student.findUnique({
      where: {
        userId: req.user.userId
      },
      include: {
        user: true,
        enrollment: true,
        payments: true
      }
    });

    return res.json({
      success: true,
      data: student
    });

  } catch (error) {
    return res.status(500).json({
      success: false
    });
  }
};


export const getAllStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;

    const skip = (page - 1) * limit;

    const [students, totalStudents] =
      await prisma.$transaction([
        prisma.student.findMany({
          skip,
          take: limit,

          include: {
            user: true,

            enrollment: {
              include: {
                course: true,
                subject: true,
                center: true,
              },
            },

            documents: true,
            payments: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.student.count(),
      ]);

    const totalPages = Math.ceil(
      totalStudents / limit
    );

    return res.status(200).json({
      success: true,

      data: students,

      pagination: {
        currentPage: page,
        perPage: limit,
        totalStudents,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
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