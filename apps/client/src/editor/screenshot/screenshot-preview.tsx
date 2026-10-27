import { useEffect, useState, type RefObject } from "react";
import { useScreenshotEditStore } from "@/editor/stores/screenshot-editor-store";
import {
  createGradient,
  drawBorder,
  drawCover,
  getCanvasSize,
  loadImage,
  roundedRect,
  trackCanvasRender,
} from "@/editor/canvas-renderer";

export function ScreenshotPreview({
  canvasRef,
  username = "crossposthub",
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  username?: string;
}) {
  const screenshot = useScreenshotEditStore((state) => state.screenshot);
  const background = useScreenshotEditStore((state) => state.background);
  const border = useScreenshotEditStore((state) => state.border);
  const windowFrame = useScreenshotEditStore((state) => state.windowFrame);
  const imageScale = useScreenshotEditStore((state) => state.imageScale);
  const resolution = useScreenshotEditStore((state) => state.resolution);
  const [error, setError] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    canvas.dataset.ready = "false";
    setError("");
    const render = async () => {
      if (!screenshot) {
        canvas.width = canvas.height = 1;
        return;
      }
      const [image, backdrop] = await Promise.all([
        loadImage(screenshot),
        background.type === "image" && background.image
          ? loadImage(background.image)
          : Promise.resolve(null),
        document.fonts.ready,
      ]);
      if (cancelled) return;
      const hasFrame = windowFrame.type && windowFrame.type !== "none";
      const header = hasFrame ? 40 : 0;
      const padding = 24;
      // Work at image dimensions; CSS scales only the display, preserving export detail.
      const contentWidth = Math.min(1600, image.naturalWidth);
      const contentHeight =
        (contentWidth * image.naturalHeight) / image.naturalWidth;
      const width =
        resolution.width > 0 ? resolution.width : contentWidth + padding * 2;
      const height =
        resolution.height > 0
          ? resolution.height
          : contentHeight + header + padding * 2;
      const size = getCanvasSize(width, height);
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable in this browser.");
      ctx.scale(size.width / width, size.height / height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      roundedRect(ctx, 0, 0, width, height, 16);
      ctx.clip();
      ctx.save();
      ctx.filter = `blur(${background.blur}px)`;
      if (backdrop) drawCover(ctx, backdrop, width, height);
      if (background.type === "solid" || background.type === "gradient") {
        ctx.fillStyle =
          background.type === "solid"
            ? background.solid || "transparent"
            : createGradient(ctx, background.gradient, width, height);
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();

      const availableWidth = Math.max(1, width - padding * 2);
      const availableHeight = Math.max(1, height - padding * 2 - header);
      const fit = Math.min(
        availableWidth / contentWidth,
        availableHeight / contentHeight,
      );
      const w = contentWidth * fit;
      const h = contentHeight * fit;
      const x = (width - w) / 2;
      const y = (height - h - header) / 2;
      const frameBorder = hasFrame ? windowFrame.frameBorder : border;
      ctx.save();
      roundedRect(ctx, x, y, w, h + header, frameBorder.radius);
      ctx.clip();
      if (hasFrame) {
        ctx.fillStyle = windowFrame.transparent
          ? "rgba(24,24,27,0.65)"
          : "#171717";
        ctx.fillRect(x, y, w, header);
        ctx.fillStyle = "#a3a3a3";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        if (windowFrame.type === "window") {
          ctx.fillText("−   □   ×", x + w - 40, y + 25);
        } else {
          ["#ef4444", "#eab308", "#22c55e"].forEach((color, i) => {
            ctx.beginPath();
            ctx.fillStyle = windowFrame.colorized ? color : "#525252";
            ctx.arc(x + 18 + i * 20, y + 20, 6, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        if (windowFrame.type === "browser" || windowFrame.type === "arc") {
          ctx.fillStyle = "#262626";
          roundedRect(ctx, x + 84, y + 9, Math.max(1, w - 100), 22, 11);
          ctx.fill();
          ctx.fillStyle = "#a3a3a3";
          ctx.fillText(
            windowFrame.type === "arc"
              ? `${username}.codes`
              : `https://${username}.com`,
            x + (w + 68) / 2,
            y + 24,
            Math.max(1, w - 112),
          );
        }
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y + header, w, h);
      ctx.clip();
      ctx.drawImage(
        image,
        x + (w - w * imageScale) / 2,
        y + header + (h - h * imageScale) / 2,
        w * imageScale,
        h * imageScale,
      );
      ctx.restore();
      ctx.restore();
      drawBorder(ctx, x, y, w, h + header, frameBorder);
      canvas.dataset.ready = "true";
    };
    const pending = render();
    trackCanvasRender(canvas, pending);
    void pending.catch((reason) => {
      if (!cancelled)
        setError(
          reason instanceof Error
            ? reason.message
            : "Preview failed to render.",
        );
    });
    return () => {
      cancelled = true;
    };
  }, [
    screenshot,
    background,
    border,
    windowFrame,
    imageScale,
    resolution,
    username,
    canvasRef,
  ]);

  return (
    <div className="h-full w-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Edited screenshot preview"
        className="block w-full h-full object-contain"
      >
        Edited screenshot preview. Use the settings to change its background and
        frame, then download it as PNG.
      </canvas>
      {error && (
        <p
          role="alert"
          className="absolute bottom-3 inset-x-3 rounded-lg bg-background p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
