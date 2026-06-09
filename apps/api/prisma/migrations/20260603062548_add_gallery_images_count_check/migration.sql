-- This is an empty migration.
ALTER TABLE "Gallery"
ADD CONSTRAINT "Gallery_imagesCount_range_check"
CHECK ("imagesCount" >= 0 AND "imagesCount" <= 50);