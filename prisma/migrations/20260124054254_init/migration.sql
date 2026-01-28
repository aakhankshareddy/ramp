-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillItem" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sno" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
