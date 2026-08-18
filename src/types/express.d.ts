import "express";

declare global {
  namespace Express {
    interface Request {
      files?: {
        photo?: Multer.File[];
        signature?: Multer.File[];
        aadhaar?: Multer.File[];
        certificate?: Multer.File[];
      };
    }
  }
}

export {};