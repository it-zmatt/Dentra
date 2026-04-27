ALTER TABLE users
ADD COLUMN permissions_json TEXT NOT NULL DEFAULT '[false,false,false,false,false,false]';

-- Explicit backfill keeps legacy rows safe if any null/empty payload slipped in.
UPDATE users
SET permissions_json = '[false,false,false,false,false,false]'
WHERE permissions_json IS NULL OR TRIM(permissions_json) = '';
