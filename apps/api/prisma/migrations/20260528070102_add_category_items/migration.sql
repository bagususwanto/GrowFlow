/*
  Warnings:

  - You are about to drop the column `category` on the `items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "items" DROP COLUMN "category",
ADD COLUMN     "category_id" TEXT;

-- CreateTable
CREATE TABLE "category_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_items_name_key" ON "category_items"("name");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
