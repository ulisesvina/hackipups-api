-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "username" STRING NOT NULL,
    "password" STRING NOT NULL,
    "email" STRING NOT NULL,
    "mascotId" STRING,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mascot" (
    "id" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" STRING NOT NULL,

    CONSTRAINT "Mascot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mascotId_fkey" FOREIGN KEY ("mascotId") REFERENCES "Mascot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
