-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending';
