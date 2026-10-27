export function getCanvasSize(width: number, height: number, scale = 2) {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error("The image has no valid dimensions.");
  }
  const ratio = Math.min(
    scale,
    8192 / width,
    8192 / height,
    Math.sqrt(16_000_000 / (width * height)),
  );
  return {
    width: Math.max(1, Math.floor(width * ratio)),
    height: Math.max(1, Math.floor(height * ratio)),
  };
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();
export function loadImage(source: string): Promise<HTMLImageElement> {
  if (!source) return Promise.reject(new Error("No image selected."));
  const cached = imageCache.get(source);
  if (cached) return cached;
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error(
          "Could not load image. Check its URL and cross-origin permissions.",
        ),
      );
    image.src = source;
  });
  // Keep decoded assets reusable while keeping memory bounded.
  if (imageCache.size >= 8) imageCache.delete(imageCache.keys().next().value!);
  imageCache.set(source, promise);
  void promise.catch(() => imageCache.delete(source));
  return promise;
}

const pendingRenders = new WeakMap<HTMLCanvasElement, Promise<void>>();
export function trackCanvasRender(
  canvas: HTMLCanvasElement,
  render: Promise<void>,
) {
  pendingRenders.set(canvas, render);
}
export async function waitForCanvas(canvas: HTMLCanvasElement) {
  let pending: Promise<void> | undefined;
  do {
    pending = pendingRenders.get(canvas);
    await pending;
  } while (pending !== pendingRenders.get(canvas));
  if (canvas.dataset.ready !== "true")
    throw new Error("Select an image and wait for its preview to load.");
}

export function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight,
  );
  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;
  ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
}

export function splitGradientArguments(value: string) {
  return value.split(/,(?![^()]*\))/).map((part) => part.trim());
}

export function createGradient(
  ctx: CanvasRenderingContext2D,
  value: string,
  width: number,
  height: number,
) {
  const match = value.trim().match(/^(linear|radial)-gradient\((.*)\)$/i);
  if (!match) throw new Error("Unsupported background gradient.");
  const args = splitGradientArguments(match[2]);
  const hasDirection = /^(to\s|[-\d.]+deg|circle|ellipse)/i.test(args[0]);
  const direction = hasDirection ? args.shift()! : "";
  let gradient: CanvasGradient;
  if (match[1] === "radial") {
    const position = direction.match(/at\s+([\d.]+)%\s+([\d.]+)%/);
    const x = position ? (width * Number(position[1])) / 100 : width / 2;
    const y = position ? (height * Number(position[2])) / 100 : height / 2;
    const explicitRadius = direction.match(/circle\s+([\d.]+)px/);
    const radius = explicitRadius
      ? Number(explicitRadius[1])
      : Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
    gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  } else {
    const directions: Record<string, number> = {
      "to top": 0,
      "to right": 90,
      "to bottom": 180,
      "to left": 270,
      "to bottom right": 135,
      "to top right": 45,
      "to bottom left": 225,
      "to top left": 315,
    };
    const angle =
      ((directions[direction] ?? (direction ? parseFloat(direction) : 180)) *
        Math.PI) /
      180;
    const dx = Math.sin(angle),
      dy = -Math.cos(angle);
    const length = Math.abs(width * dx) + Math.abs(height * dy);
    gradient = ctx.createLinearGradient(
      width / 2 - (dx * length) / 2,
      height / 2 - (dy * length) / 2,
      width / 2 + (dx * length) / 2,
      height / 2 + (dy * length) / 2,
    );
  }
  // CSS permits stops outside 0–100%; clamp these to the drawable range.
  args.forEach((stop, index) => {
    const color = stop.match(/^(.*?)(?:\s+(-?[\d.]+)%)?$/)!;
    const offset =
      color[2] === undefined
        ? index / Math.max(1, args.length - 1)
        : Number(color[2]) / 100;
    gradient.addColorStop(Math.max(0, Math.min(1, offset)), color[1].trim());
  });
  return gradient;
}

export interface CanvasBorder {
  type?: string;
  color: string;
  width: number;
  radius: number;
}

export function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(
    x,
    y,
    width,
    height,
    Math.max(0, Math.min(radius, width / 2, height / 2)),
  );
}

export function drawBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  border: CanvasBorder,
) {
  if (border.type === "none" || border.width <= 0) return;
  ctx.save();
  ctx.strokeStyle = border.color || "transparent";
  ctx.lineWidth = border.width;
  if (border.type === "dashed")
    ctx.setLineDash([border.width * 3, border.width * 2]);
  if (border.type === "dotted") {
    ctx.setLineDash([0, border.width * 2]);
    ctx.lineCap = "round";
  }
  const inset = border.width / 2;
  roundedRect(
    ctx,
    x + inset,
    y + inset,
    width - border.width,
    height - border.width,
    border.radius - inset,
  );
  if (border.type === "double") {
    ctx.lineWidth = border.width / 3;
    roundedRect(
      ctx,
      x + border.width / 6,
      y + border.width / 6,
      width - border.width / 3,
      height - border.width / 3,
      border.radius,
    );
    ctx.stroke();
    roundedRect(
      ctx,
      x + (border.width * 5) / 6,
      y + (border.width * 5) / 6,
      width - (border.width * 5) / 3,
      height - (border.width * 5) / 3,
      border.radius - border.width,
    );
  }
  ctx.stroke();
  ctx.restore();
}
