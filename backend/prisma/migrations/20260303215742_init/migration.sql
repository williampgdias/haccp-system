-- CreateTable
CREATE TABLE "Temperature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unitName" TEXT NOT NULL,
    "timeChecked" TEXT NOT NULL,
    "temperature" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "foodItem" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "useByDate" TEXT NOT NULL,
    "temperature" REAL NOT NULL,
    "isAppearanceAcceptable" BOOLEAN NOT NULL,
    "isVanChecked" BOOLEAN NOT NULL,
    "comments" TEXT,
    "signature" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Cleaning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weekEndingDate" TEXT NOT NULL,
    "dateCleaned" TEXT NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "cleanedBy" TEXT NOT NULL
);
