/*
  Warnings:

  - The values [BOTH] on the enum `PartnerType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PartnerType_new" AS ENUM ('SUPPLIER', 'CUSTOMER');
ALTER TABLE "partners" ALTER COLUMN "type" TYPE "PartnerType_new" USING ("type"::text::"PartnerType_new");
ALTER TYPE "PartnerType" RENAME TO "PartnerType_old";
ALTER TYPE "PartnerType_new" RENAME TO "PartnerType";
DROP TYPE "PartnerType_old";
COMMIT;

-- AlterTable
ALTER TABLE "category_items" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
