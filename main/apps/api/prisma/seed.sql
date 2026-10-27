INSERT INTO "Plan" ("id", "title", "price", "description", "features", "cta", "dodoProductId", "createdAt", "updatedAt")
VALUES
  ('free', 'Free', 0, 'Essential cross-posting tools for individuals.', '["Connect 2 platforms","25 posts/month","5 scheduled posts/month","1 image generation/month"]', 'Get Started', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pro', 'Pro', 10, 'Scheduling and higher limits for active creators.', '["Connect 2 platforms","60 posts/month","20 scheduled posts/month","10 image generations/month"]', 'Upgrade to Pro', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('premium', 'Premium', 20, 'Unlimited posting and scheduling for teams and businesses.', '["Unlimited platforms","Unlimited posts and scheduling","30 image generations/month","Premium support"]', 'Go Premium', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "title" = excluded."title",
  "price" = excluded."price",
  "description" = excluded."description",
  "features" = excluded."features",
  "cta" = excluded."cta",
  "updatedAt" = CURRENT_TIMESTAMP;
