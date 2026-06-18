import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { identifier, password, role } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { mobileNumber: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
  return res.status(403).json({
    success: false,
    message:
      "Your account is inactive. Please contact administrator.",
  });
}

    if (user.role !== role) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password || ""
    );

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};