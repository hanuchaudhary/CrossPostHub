import { expect, test } from "bun:test";

import { contentProblem, PLATFORMS } from "../../packages/shared/platforms";
import {
  validateAttachments,
  validatePlatformMedia,
} from "../../apps/web/src/components/posts/media-upload";

function media(type: string, size = 1024): File {
  return { name: `upload.${type.split("/")[1]}`, type, size } as File;
}
test("four photos are accepted by the platforms that take several photos", () => {
  const photos = Array.from({ length: 4 }, () => media("image/jpeg"));
  for (const platform of [
    "twitter",
    "linkedin",
    "instagram",
    "threads",
    "facebook",
    "bluesky",
    "mastodon",
    "telegram",
  ] as const)
    expect(validatePlatformMedia(platform, photos)).toBeUndefined();
  expect(validatePlatformMedia("pinterest", photos)).toContain("up to 1 file");
  expect(
    validateAttachments(Array.from({ length: 11 }, () => media("image/jpeg")))
  ).toContain("10 files");
});
test("a single MP4 is accepted where video is supported and mixing is rejected", () => {
  const video = media("video/mp4", 100 * 1024 ** 2);
  for (const platform of ["twitter", "linkedin", "instagram"] as const) {
    expect(validatePlatformMedia(platform, [video])).toBeUndefined();
    expect(
      validatePlatformMedia(platform, [video, media("image/jpeg")])
    ).toContain("video on its own");
  }
  expect(validatePlatformMedia("threads", [video, media("image/jpeg")])).toBeUndefined();
  expect(validatePlatformMedia("bluesky", [video])).toContain("doesn't take videos");
  expect(validatePlatformMedia("tiktok", [video])).toBeUndefined();
});
test("file sizes and empty or unsupported files are rejected before upload", () => {
  expect(validateAttachments([media("video/mp4", 201 * 1024 ** 2)])).toContain(
    "200 MB"
  );
  expect(validateAttachments([media("image/png", 11 * 1024 ** 2)])).toContain(
    "10 MB"
  );
  expect(validateAttachments([media("image/jpeg", 0)])).toContain("1 byte");
  expect(validateAttachments([media("application/pdf")])).toContain(
    "choose a JPEG"
  );
});
test("platform-specific formats and limits match the publishing implementations", () => {
  expect(
    validatePlatformMedia("twitter", [media("image/jpeg", 6 * 1024 ** 2)])
  ).toContain("5 MB");
  expect(
    validatePlatformMedia("instagram", [media("image/jpeg", 9 * 1024 ** 2)])
  ).toContain("8 MB");
  expect(validatePlatformMedia("instagram", [media("image/png")])).toContain(
    "JPEG"
  );
  expect(validatePlatformMedia("linkedin", [media("image/webp")])).toContain(
    "JPEG, PNG and GIF"
  );
  expect(
    validatePlatformMedia("twitter", [media("video/quicktime")])
  ).toContain("MP4");
  expect(
    validatePlatformMedia("instagram", [media("video/quicktime")])
  ).toBeUndefined();
  expect(
    validatePlatformMedia("bluesky", [media("image/jpeg", 2 * 1024 ** 2)])
  ).toContain("976 KB");
});
test("GIF works alone on X and with images on LinkedIn", () => {
  const gif = media("image/gif");
  expect(validatePlatformMedia("twitter", [gif])).toBeUndefined();
  expect(
    validatePlatformMedia("twitter", [gif, media("image/jpeg")])
  ).toContain("single GIF");
  expect(
    validatePlatformMedia("linkedin", [gif, media("image/jpeg")])
  ).toBeUndefined();
});
test("platforms that need media say which kind", () => {
  expect(validatePlatformMedia("instagram", [])).toContain("photo or video");
  expect(validatePlatformMedia("pinterest", [])).toContain("needs a photo");
  expect(validatePlatformMedia("tiktok", [])).toContain("needs a video");
  for (const platform of ["twitter", "linkedin", "threads", "bluesky", "telegram"] as const)
    expect(validatePlatformMedia(platform, [])).toBeUndefined();
});
test("text limits follow each platform and Telegram captions are shorter", () => {
  expect(contentProblem("bluesky", "a".repeat(301), [])).toContain("too long");
  expect(contentProblem("threads", "a".repeat(500), [])).toBeUndefined();
  expect(contentProblem("telegram", "a".repeat(2000), [])).toBeUndefined();
  expect(
    contentProblem("telegram", "a".repeat(2000), [{ type: "image/jpeg" }])
  ).toContain("too long");
  for (const platform of PLATFORMS)
    expect(contentProblem(platform, "", [])).toContain("Add text or media");
});
