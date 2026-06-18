import { Request, Response } from "express";
import prisma from "../config/prisma";


import bcrypt from "bcryptjs";


export const registerStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      mobileNumber,
      email,
      password,

      personalDetails,
      academicDetails,
      enrollmentDetails,
      documents,
      payment,
    } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { mobileNumber },
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

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const result = await prisma.$transaction(
      async (tx: any) => {
        const user = await tx.user.create({
          data: {
            role: "STUDENT",
            mobileNumber,
            email,
            password: hashedPassword,
            isVerified: true,
          },
        });

        const student = await tx.student.create({
          data: {
            userId: user.id,

            fullName:
              personalDetails.fullName,

            fatherName:
              personalDetails.fatherName,

            motherName:
              personalDetails.motherName,

            dob: new Date(
              personalDetails.dob
            ),

            gender:
              personalDetails.gender,

            address:
              personalDetails.address,

            district:
              personalDetails.district,

            state:
              personalDetails.state,

            highestQualification:
              academicDetails.highestQualification,

            schoolCollege:
              academicDetails.schoolCollege,

            passingYear:
              academicDetails.passingYear,

            category:
              academicDetails.category,

            experience:
              academicDetails.experience,
          },
        });

        await tx.enrollment.create({
          data: {
            studentId: student.id,

            subjectId:enrollmentDetails.subjectId,


            courseId:
              enrollmentDetails.courseId,

            centerId:
              enrollmentDetails.centerId,

            batch:
              enrollmentDetails.batch,

            learningMode:
              enrollmentDetails.learningMode,

            preferredTiming:
              enrollmentDetails.preferredTiming,
          },
        });

        await tx.studentDocument.create({
          data: {
            studentId: student.id,

            passportPhoto:
              documents.passportPhoto,

            signature:
              documents.signature,

            aadhaarCard:
              documents.aadhaarCard,

            academicCertificate:
              documents.academicCertificate,
          },
        });

        await tx.payment.create({
          data: {
            studentId: student.id,

            amount:
              payment.amount,

            paymentMethod:
              payment.paymentMethod,

            transactionId:
              payment.transactionId,

            status: "SUCCESS",
          },
        });

        return {
          user,
          student,
        };
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "Student registered successfully",
      data: result,
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
    const student = await prisma.student.findUnique({
      where: {
        id: req.params.id as any,
      },
    });

    return res.json({
      success: true,
      data: student,
    });
  } catch (error) {
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
        payments:true
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

    const students = await prisma.student.findMany({
      include: {
        user: true,
        enrollment: true,
        documents: true
      }
    });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  }
};