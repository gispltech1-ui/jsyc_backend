import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcryptjs";

export const registerAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      mobileNumber,
      email,
      password,
      name,
      designation,
      department,
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
            role: "ADMIN",
            mobileNumber,
            email,
            password: hashedPassword,
            isVerified: true,
          },
        });

        const admin = await tx.admin.create({
          data: {
            userId: user.id,
            name,
            designation,
            department,
          },
        });

        return {
          user,
          admin,
        };
      }
    );

    return res.status(201).json({
      success: true,
      message: "Admin Registered Successfully",
      data: result,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const adminDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      totalSubjects,
      totalCenters,

      totalStudentPayments,
      totalTeacherPayments,

      recentStudents,
      recentTeachers,

      pendingPayments,
      successPayments,

      coursePopularity,
    ] = await Promise.all([

      // =========================
      // COUNTS
      // =========================

      prisma.student.count(),

      prisma.teacher.count(),

      prisma.course.count(),

      prisma.subject.count(),

      prisma.center.count(),


      // =========================
      // STUDENT REVENUE
      // =========================

      prisma.payment.aggregate({
        where: {
          paymentFor: "STUDENT_REGISTRATION",
          status: "SUCCESS",
        },
        _sum: {
          amount: true,
        },
      }),


      // =========================
      // TEACHER REVENUE
      // =========================

      prisma.payment.aggregate({
        where: {
          paymentFor: "TEACHER_REGISTRATION",
          status: "SUCCESS",
        },
        _sum: {
          amount: true,
        },
      }),


      // =========================
      // RECENT STUDENTS
      // =========================

      prisma.student.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 5,

        include: {
          user: {
            select: {
              id: true,
              role: true,
              mobileNumber: true,
              email: true,
              isVerified: true,
              createdAt: true,
            },
          },
        },
      }),


      // =========================
      // RECENT TEACHERS
      // =========================

      prisma.teacher.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 5,

        include: {
          user: {
            select: {
              id: true,
              role: true,
              mobileNumber: true,
              email: true,
              isVerified: true,
              createdAt: true,
            },
          },
        },
      }),


      // =========================
      // PENDING PAYMENTS
      // =========================

      prisma.payment.count({
        where: {
          status: "PENDING",
        },
      }),


      // =========================
      // SUCCESS PAYMENTS
      // =========================

      prisma.payment.count({
        where: {
          status: "SUCCESS",
        },
      }),


      // =========================
      // COURSE POPULARITY
      // =========================

      prisma.course.findMany({
        select: {
          id: true,
          name: true,

          _count: {
            select: {
              enrollments: true,
            },
          },
        },

        orderBy: {
          enrollments: {
            _count: "desc",
          },
        },
      }),
    ]);


    // =========================
    // TOTAL REVENUE
    // =========================

    const totalRevenue =
      Number(totalStudentPayments._sum.amount || 0) +
      Number(totalTeacherPayments._sum.amount || 0);


    // =========================
    // COURSE POPULARITY FORMAT
    // =========================

    const coursePopularityData =
      coursePopularity.map((course) => ({
        course: course.name,
        students: course._count.enrollments,
      }));


    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({

      success: true,

      data: {

        cards: {

          totalStudents,

          totalTeachers,

          totalCourses,

          totalSubjects,

          totalCenters,

          totalRevenue,

          pendingPayments,

          successPayments,

        },

        recentStudents,

        recentTeachers,

        coursePopularity:
          coursePopularityData,

      },

    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      success: false,

      message: "Internal Server Error",

    });

  }
};