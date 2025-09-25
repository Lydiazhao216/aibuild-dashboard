-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "openingInventory" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "DailySnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "procurementQty" REAL NOT NULL,
    "procurementPrice" REAL NOT NULL,
    "salesQty" REAL NOT NULL,
    "salesPrice" REAL NOT NULL,
    "inventory" INTEGER NOT NULL,
    CONSTRAINT "DailySnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "DailySnapshot_productId_day_key" ON "DailySnapshot"("productId", "day");
