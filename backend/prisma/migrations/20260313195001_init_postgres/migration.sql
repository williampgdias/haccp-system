-- CreateTable
CREATE TABLE "Temperature" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unitName" TEXT NOT NULL,
    "timeChecked" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Temperature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "foodItem" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "useByDate" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "isAppearanceAcceptable" BOOLEAN NOT NULL,
    "isVanChecked" BOOLEAN NOT NULL,
    "comments" TEXT,
    "signature" TEXT NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cleaning" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weekEndingDate" TEXT NOT NULL,
    "dateCleaned" TEXT NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "cleanedBy" TEXT NOT NULL,

    CONSTRAINT "Cleaning_pkey" PRIMARY KEY ("id")
);
