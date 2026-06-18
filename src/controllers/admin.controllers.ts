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