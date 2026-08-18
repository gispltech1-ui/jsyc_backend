-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "gatewayResponse" JSONB,
ADD COLUMN     "paidAt" TIMESTAMP(3);
