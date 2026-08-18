import { Request, Response } from "express";
import prisma from "../config/prisma";
import { generatePayUHash } from "../utils/payuHash";
import { PAYU } from "../config/payment";


export const initiatePayment = async (
  req: Request,
  res: Response
) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: {
        transactionId,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Payment already ${payment.status}`,
      });
    }

    const person = payment.student ?? payment.teacher;

    if (!person) {
      return res.status(404).json({
        success: false,
        message: "Student/Teacher not found",
      });
    }

    const productInfo =
      payment.paymentFor === "TEACHER_REGISTRATION"
        ? "Teacher Registration"
        : "Student Registration";

    const hash = generatePayUHash({
      txnid: payment.transactionId,
      amount: payment.amount.toString(),
      productinfo: productInfo,
      firstname: person.fullName,
      email: person.user.email || "",
    });

    return res.status(200).json({
      success: true,
      data: {
        key: PAYU.key,

        txnid: payment.transactionId,

        amount: payment.amount.toString(),

        productinfo: productInfo,

        firstname: person.fullName,

        email: person.user.email,

        phone: person.user.mobileNumber,

        surl: PAYU.successUrl,

        furl: PAYU.failureUrl,

        hash,
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


export const paymentSuccess = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("========== PAYMENT SUCCESS ==========");
    console.log(req.body);

    const { txnid, status } = req.body;

    if (!txnid) {
      return res.status(400).send("Transaction ID missing");
    }

    const payment = await prisma.payment.findUnique({
      where: {
        transactionId: txnid,
      },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    await prisma.payment.update({
      where: {
        transactionId: txnid,
      },
      data: {
        status:
          status === "success"
            ? "SUCCESS"
            : "FAILED",

        paidAt: new Date(),

        gatewayResponse: req.body,
      },
    });

    // Redirect based on payment type
    if (
      payment.paymentFor ===
      "TEACHER_REGISTRATION"
    ) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/success?txnid=${txnid}`
      );
    }

    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/success?txnid=${txnid}`
    );
  } catch (error) {
    console.error(error);

    return res.status(500).send(
      "Internal Server Error"
    );
  }
};

export const paymentFailure = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("========== PAYMENT FAILED ==========");
    console.log(req.body);

    const {
      txnid,
      status,
      error,
      error_Message,
    } = req.body;

    if (!txnid) {
      return res.status(400).send("Transaction ID missing");
    }

    const payment = await prisma.payment.findUnique({
      where: {
        transactionId: txnid,
      },
    });

    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    // Prevent duplicate processing
    if (payment.status === "FAILED") {
      return res.send("Payment already marked as failed");
    }

    await prisma.payment.update({
      where: {
        transactionId: txnid,
      },
      data: {
        status: "FAILED",
        failureReason: error_Message || error || "Payment Failed",
        gatewayResponse: req.body,
      },
    });

    return res.send("Payment marked as FAILED");
  } catch (error) {
    console.error(error);

    return res.status(500).send("Internal Server Error");
  }
};


export const getPayment = async (
  req: Request,
  res: Response
) => {

  const payment = await prisma.payment.findUnique({
    where: {
      transactionId: String(req.params.transactionId),
    },
    include: {
      student: true,
    },
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: "Payment not found",
    });
  }

  return res.json({
    success: true,
    data: payment,
  });
};




/* =====================================================
   PAYMENT DASHBOARD
===================================================== */

export const paymentDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    // ==============================
    // DATE RANGES
    // ==============================

    const now = new Date();

    // Start of today
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Start of tomorrow
    const startOfTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    // Start of current month
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // Start of next month
    const startOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    // ==============================
    // DAILY REVENUE
    // ==============================

    const dailyRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },

      where: {
        status: "SUCCESS",

        paidAt: {
          gte: startOfToday,
          lt: startOfTomorrow,
        },
      },
    });

    // ==============================
    // MONTHLY REVENUE
    // ==============================

    const monthlyRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },

      where: {
        status: "SUCCESS",

        paidAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      },
    });

    // ==============================
    // PENDING PAYMENTS
    // ==============================

    const pendingPayments =
      await prisma.payment.count({
        where: {
          status: "PENDING",
        },
      });

    // ==============================
    // REFUND REQUESTS
    // ==============================

    // Your current Payment schema
    // does not have refund support.
    const refundRequests = 0;

    // ==============================
    // SUCCESSFUL PAYMENTS
    // ==============================

    const successfulPayments =
      await prisma.payment.count({
        where: {
          status: "SUCCESS",
        },
      });

    // ==============================
    // FAILED PAYMENTS
    // ==============================

    const failedPayments =
      await prisma.payment.count({
        where: {
          status: "FAILED",
        },
      });

    // ==============================
    // TOTAL REVENUE
    // ==============================

    const totalRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },

      where: {
        status: "SUCCESS",
      },
    });

    return res.status(200).json({
      success: true,

      data: {
        dailyRevenue:
          dailyRevenue._sum.amount?.toString() || "0",

        monthlyRevenue:
          monthlyRevenue._sum.amount?.toString() || "0",

        totalRevenue:
          totalRevenue._sum.amount?.toString() || "0",

        pendingPayments,

        successfulPayments,

        failedPayments,

        refundRequests,
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

export const getAllPayments = async (
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

    const limit = Math.min(
      Number(req.query.limit) || 10,
      100
    );

    const skip = (page - 1) * limit;

    // ==============================
    // FILTERS
    // ==============================

    const search =
      String(req.query.search || "").trim();

    const status =
      String(req.query.status || "").toUpperCase();

    // ==============================
    // WHERE
    // ==============================

    const where: any = {};

    // Status filter

    if (
      status === "PENDING" ||
      status === "SUCCESS" ||
      status === "FAILED"
    ) {
      where.status = status;
    }

    // Search

    if (search) {

      where.OR = [

        {
          transactionId: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          student: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },

        {
          teacher: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },

      ];
    }

    // ==============================
    // GET DATA
    // ==============================

    const [payments, totalPayments] =
      await Promise.all([

        prisma.payment.findMany({

          where,

          include: {

            student: {
              include: {
                user: true,
              },
            },

            teacher: {
              include: {
                user: true,
              },
            },

          },

          orderBy: {
            createdAt: "desc",
          },

          skip,

          take: limit,
        }),

        prisma.payment.count({
          where,
        }),

      ]);

    // ==============================
    // FORMAT DATA FOR FRONTEND
    // ==============================

    const formattedPayments =
      payments.map((payment) => {

        const person =
          payment.student ||
          payment.teacher;

        const user =
          payment.student?.user ||
          payment.teacher?.user;

        return {

          id: payment.id,

          transactionId:
            payment.transactionId,

          name:
            person?.fullName || "Unknown",

          type:
            payment.student
              ? "Student"
              : payment.teacher
              ? "Teacher"
              : "Unknown",

          mobile:
            user?.mobileNumber || "",

          email:
            user?.email || "",

          amount:
            payment.amount.toString(),

          paymentFor:
            payment.paymentFor,

          paymentMethod:
            payment.paymentMethod,

          status:
            payment.status,

          paidAt:
            payment.paidAt,

          createdAt:
            payment.createdAt,

          failureReason:
            payment.failureReason,

        };
      });

    const totalPages =
      Math.ceil(
        totalPayments / limit
      );

    return res.status(200).json({

      success: true,

      data: formattedPayments,

      pagination: {

        currentPage: page,

        limit,

        totalPayments,

        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
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

