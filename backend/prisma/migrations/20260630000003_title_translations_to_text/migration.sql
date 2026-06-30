-- Ampliar titleQu/Ay/Shp de VARCHAR(200) a TEXT para acomodar traducciones largas
ALTER TABLE "Lesson" ALTER COLUMN "titleQu"  TYPE TEXT;
ALTER TABLE "Lesson" ALTER COLUMN "titleAy"  TYPE TEXT;
ALTER TABLE "Lesson" ALTER COLUMN "titleShp" TYPE TEXT;
