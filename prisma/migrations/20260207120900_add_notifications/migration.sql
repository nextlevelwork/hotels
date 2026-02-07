-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "notificationsSent" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true;
