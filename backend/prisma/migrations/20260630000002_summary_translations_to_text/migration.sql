-- Ampliar summaryQu/Ay/Shp de VARCHAR(400) a TEXT para acomodar traducciones largas
ALTER TABLE "Lesson" ALTER COLUMN "summaryQu"  TYPE TEXT;
ALTER TABLE "Lesson" ALTER COLUMN "summaryAy"  TYPE TEXT;
ALTER TABLE "Lesson" ALTER COLUMN "summaryShp" TYPE TEXT;
