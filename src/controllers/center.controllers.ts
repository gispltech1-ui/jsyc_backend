import { Request, Response } from "express";
import prisma from "../config/prisma";

/**
 * ADMIN
 * Create Center
 */
export const createCenter = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, district } = req.body;
console.log("sddfsdfdf")
    // Validation
    if (!name || !district) {
      return res.status(400).json({
        success: false,
        message: "Center name and district are required",
      });
    }

    // Check duplicate center
    const existingCenter = await prisma.center.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        district: {
          equals: district,
          mode: "insensitive",
        },
      },
    });

    if (existingCenter) {
      return res.status(409).json({
        success: false,
        message: "Center already exists in this district",
      });
    }

    const center = await prisma.center.create({
      data: {
        name: name.trim(),
        district: district.trim(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Center created successfully",
      data: center,
    });
  } catch (error) {
    console.error("CREATE CENTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * PUBLIC
 * Get single center
 */
export const getCenterById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id }:any = req.params;

    const center = await prisma.center.findUnique({
      where: {
        id,
      },
    });

    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: center,
    });
  } catch (error) {
    console.error("GET CENTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


/**
 * ADMIN
 * Update Center
 */
export const updateCenter = async (
  req: Request,
  res: Response
) => {
  try {
    const { id }:any = req.params;
    const { name, district } = req.body;

    const existingCenter = await prisma.center.findUnique({
      where: {
        id,
      },
    });

    if (!existingCenter) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }

    const center = await prisma.center.update({
      where: {
        id,
      },
      data: {
        ...(name !== undefined && {
          name: name.trim(),
        }),

        ...(district !== undefined && {
          district: district.trim(),
        }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Center updated successfully",
      data: center,
    });
  } catch (error) {
    console.error("UPDATE CENTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


/**
 * ADMIN
 * Delete Center
 */
export const deleteCenter = async (
  req: Request,
  res: Response
) => {
  try {
    const { id }:any = req.params;

    const center = await prisma.center.findUnique({
      where: {
        id,
      },
      include: {
        enrollments: true,
      },
    });

    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }

    // Don't delete center if students are enrolled
    if (center.enrollments.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete center because students are enrolled in this center",
      });
    }

    await prisma.center.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Center deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CENTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllCenters = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Number(req.query.limit) || 10,
      100
    );

    const skip = (page - 1) * limit;

    // Get total count
    const totalCenters = await prisma.center.count();

    // Get paginated centers
    const centers = await prisma.center.findMany({
      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,

      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    const data = centers.map((center) => ({
      id: center.id,
      name: center.name,
      district: center.district,
      studentCount: center._count.enrollments,
      createdAt: center.createdAt,
    }));

    const totalPages = Math.ceil(
      totalCenters / limit
    );

    return res.status(200).json({
      success: true,

      count: data.length,

      data,

      pagination: {
        currentPage: page,
        limit,
        totalCenters,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });

  } catch (error) {
    console.error(
      "GET CENTERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// CREATE COURSE - ADMIN
// ==========================================

export const createCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, fee } = req.body;

    if (!name || fee === undefined || fee === null) {
      return res.status(400).json({
        success: false,
        message: "Course name and fee are required",
      });
    }

    if (Number(fee) < 0) {
      return res.status(400).json({
        success: false,
        message: "Course fee cannot be negative",
      });
    }

    const existingCourse = await prisma.course.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course already exists",
      });
    }

    const course = await prisma.course.create({
      data: {
        name: name.trim(),
        fee: Number(fee),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
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
// GET ALL COURSES - PUBLIC
// ==========================================

export const getAllCourses = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Number(req.query.limit) || 10,
      100
    );

    const skip = (page - 1) * limit;

    const [courses, totalCourses] = await Promise.all([
      prisma.course.findMany({
        skip,
        take: limit,

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.course.count(),
    ]);

    const totalPages = Math.ceil(
      totalCourses / limit
    );

    return res.status(200).json({
      success: true,

      data: courses,

      pagination: {
        currentPage: page,
        limit,
        totalCourses,
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

// ==========================================
// GET COURSE BY ID - PUBLIC
// ==========================================

export const getCourseById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id }:any = req.params;

    const course = await prisma.course.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: course.id,
        name: course.name,
        fee: course.fee,
        studentCount: course._count.enrollments,
        createdAt: course.createdAt,
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