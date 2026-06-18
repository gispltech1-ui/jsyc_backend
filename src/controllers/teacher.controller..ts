import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";

export const registerTeacher = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      mobileNumber,
      email,
      password,

      personalDetails,
      professionalDetails,
      documents,
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
            role: "TEACHER",

            mobileNumber,
            email,

            password: hashedPassword,

            isVerified: true,

          },
        });

        const teacher = await tx.teacher.create({
          data: {
            userId: user.id,

            fullName:
              personalDetails.fullName,

            dob: personalDetails.dob
              ? new Date(personalDetails.dob)
              : null,

            gender:
              personalDetails.gender,

            address:
              personalDetails.address,

            district:
              personalDetails.district,

            state:
              personalDetails.state,

            qualification:
              professionalDetails.qualification,

            specialization:
              professionalDetails.specialization,

            teachingExperience:
              professionalDetails.teachingExperience,

            expertiseSubjects:
              professionalDetails.expertiseSubjects,

            skills:
              professionalDetails.skills,

            certifications:
              professionalDetails.certifications,

            preferredCenter1:
              professionalDetails.preferredCenter1,

            preferredCenter2:
              professionalDetails.preferredCenter2,

            subjectsCanTeach:
              professionalDetails.subjectsCanTeach,
          },
        });

        if (documents) {
          await tx.teacherDocument.create({
            data: {
              teacherId: teacher.id,

              photo:
                documents.photo,

              resumeCV:
                documents.resumeCV,

              educationalCertificates:
                documents.educationalCertificates,

              idProof:
                documents.idProof,
            },
          });
        }

        return {
          user,
          teacher,
        };
      }
    );

    return res.status(201).json({
      success: true,
      message: "Teacher registered successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
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
        payments:true
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