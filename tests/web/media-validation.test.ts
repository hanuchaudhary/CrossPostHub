import { expect, test } from "bun:test";

import {
  validateAttachments,
  validatePlatformMedia,
} from "../../apps/web/src/components/posts/media-validation";

function media(type: string, size = 1024): File {
  return { name: `upload.${type.split("/")[1]}`, type, size } as File;
}
test("four photos are accepted by every publishing platform", () => {
  const photos = Array.from({ length: 4 }, () => media("image/jpeg"));
  for (const platform of ["twitter", "linkedin", "instagram"] as const)
    expect(validatePlatformMedia(platform, photos)).toBeUndefined();
  expect(validateAttachments([...photos, media("image/jpeg")])).toContain(
    "4 photos"
  );
});
test("single MP4 video is accepted and mixing photos with video is rejected", () => {
  const video = media("video/mp4", 100 * 1024 ** 2);
  for (const platform of ["twitter", "linkedin", "instagram"] as const) {
    expect(validatePlatformMedia(platform, [video])).toBeUndefined();
    expect(
      validatePlatformMedia(platform, [video, media("image/jpeg")])
    ).toContain("video on its own");
    expect(validatePlatformMedia(platform, [video, video])).toContain(
      "video on its own"
    );
  }
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
    "JPEG, PNG, GIF and MP4"
  );
  expect(
    validatePlatformMedia("twitter", [media("video/quicktime")])
  ).toContain("MP4");
  expect(
    validatePlatformMedia("instagram", [media("video/quicktime")])
  ).toBeUndefined();
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
test("only Instagram requires media for a text post", () => {
  expect(validatePlatformMedia("instagram", [])).toContain("photo or video");
  expect(validatePlatformMedia("twitter", [])).toBeUndefined();
  expect(validatePlatformMedia("linkedin", [])).toBeUndefined();
});
