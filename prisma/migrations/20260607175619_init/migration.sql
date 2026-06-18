/*
  Warnings:

  - You are about to drop the column `specialization` on the `Teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "specialization",
ADD COLUMN     "certifications" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "expertiseSubjects" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "preferredCenter1" TEXT,
ADD COLUMN     "preferredCenter2" TEXT,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "subjectsCanTeach" TEXT,
ALTER COLUMN "district" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TeacherDocument" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "photo" TEXT,
    "resumeCV" TEXT,
    "educationalCertificates" TEXT,
    "idProof" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherPayment" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherDocument_teacherId_key" ON "TeacherDocument"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherPayment_transactionId_key" ON "TeacherPayment"("transactionId");

-- AddForeignKey
ALTER TABLE "TeacherDocument" ADD CONSTRAINT "TeacherDocument_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherPayment" ADD CONSTRAINT "TeacherPayment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
