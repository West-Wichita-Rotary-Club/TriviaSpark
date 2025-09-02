-- Add EventImages table
CREATE TABLE IF NOT EXISTS "event_images" (
    "id" TEXT NOT NULL CONSTRAINT "PK_event_images" PRIMARY KEY,
    "question_id" TEXT NOT NULL,
    "unsplash_image_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "description" TEXT,
    "attribution_text" TEXT NOT NULL,
    "attribution_url" TEXT NOT NULL,
    "download_tracking_url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "color" TEXT,
    "size_variant" TEXT NOT NULL,
    "usage_context" TEXT,
    "download_tracked" INTEGER NOT NULL,
    "created_at" TEXT NOT NULL,
    "last_used_at" TEXT NOT NULL,
    "expires_at" TEXT,
    "selected_by_user_id" TEXT,
    "search_context" TEXT,
    FOREIGN KEY ("question_id") REFERENCES "questions" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("selected_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS "IX_event_images_created_at" ON "event_images" ("created_at");
CREATE INDEX IF NOT EXISTS "IX_event_images_download_tracked" ON "event_images" ("download_tracked");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_event_images_question_id" ON "event_images" ("question_id");
CREATE INDEX IF NOT EXISTS "IX_event_images_selected_by_user_id" ON "event_images" ("selected_by_user_id");
CREATE INDEX IF NOT EXISTS "IX_event_images_unsplash_image_id" ON "event_images" ("unsplash_image_id");
