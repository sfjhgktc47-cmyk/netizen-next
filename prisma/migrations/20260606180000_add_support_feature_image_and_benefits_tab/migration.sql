ALTER TABLE "SupportFeature"
ADD COLUMN "image" TEXT NOT NULL DEFAULT '';

INSERT INTO "PageBlock"
  ("id", "pageKey", "type", "title", "description", "enabled", "sortOrder", "settings", "createdAt", "updatedAt")
SELECT
  'benefits-editor-default',
  'benefits',
  'benefits-editor',
  'Все преимущества',
  'Общие преимущества и преимущества блока сервиса.',
  true,
  10,
  '{}'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "PageBlock"
  WHERE "pageKey" = 'benefits' AND "type" = 'benefits-editor'
);
