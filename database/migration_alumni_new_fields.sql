-- Migration to add new fields to Alumni table
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS current_occupation VARCHAR(255);
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS custom_fields LONGTEXT;

-- Add indexes for better query performance
ALTER TABLE alumni ADD INDEX IF NOT EXISTS idx_current_occupation (current_occupation);
ALTER TABLE alumni ADD INDEX IF NOT EXISTS idx_company (company);

COMMIT;
