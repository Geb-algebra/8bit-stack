-- CreateTable
CREATE TABLE "DeleteThisUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DeleteThisUser_email_key" ON "DeleteThisUser"("email");
