import { describe, expect, test } from "bun:test";
import {
  createGradient,
  getCanvasSize,
  splitGradientArguments,
  trackCanvasRender,
  waitForCanvas,
} from "../src/editor/canvas-renderer";
import { loadEditorDraft, saveEditorDraft } from "../src/editor/draft-storage";
import { PREDEFINED_GRADIENTS } from "../src/editor/constants";

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  },
});

describe("canvas export", () => {
  test("uses 2× dimensions and bounds large and panoramic images", () => {
    expect(getCanvasSize(800, 600)).toEqual({ width: 1600, height: 1200 });
    for (const [width, height] of [
      [10000, 10000],
      [100000, 100],
      [100, 100000],
    ]) {
      const size = getCanvasSize(width, height);
      expect(size.width).toBeLessThanOrEqual(8192);
      expect(size.height).toBeLessThanOrEqual(8192);
      expect(size.width * size.height).toBeLessThanOrEqual(16_000_000);
      expect(size.width).toBeGreaterThan(0);
      expect(size.height).toBeGreaterThan(0);
    }
    expect(() => getCanvasSize(0, 100)).toThrow();
    expect(() => getCanvasSize(Infinity, 100)).toThrow();
  });

  test("parses all shipped gradient presets, including rgba colors", () => {
    const stops: [number, string][] = [];
    const gradient = {
      addColorStop: (offset: number, color: string) => {
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThanOrEqual(1);
        expect(color).toMatch(/^(#|rgb|hsl)/);
        stops.push([offset, color]);
      },
    };
    const context = {
      createLinearGradient: (...coordinates: number[]) => {
        expect(coordinates.every(Number.isFinite)).toBe(true);
        return gradient;
      },
      createRadialGradient: (...coordinates: number[]) => {
        expect(coordinates.every(Number.isFinite)).toBe(true);
        return gradient;
      },
    } as unknown as CanvasRenderingContext2D;
    for (const preset of PREDEFINED_GRADIENTS) {
      stops.length = 0;
      createGradient(context, preset.gradient, 1000, 700);
      expect(stops.length).toBeGreaterThanOrEqual(2);
    }
    expect(
      splitGradientArguments("90deg, rgba(1, 2, 3, 0.5) 0%, #fff 100%"),
    ).toHaveLength(3);
  });

  test("waits for the newest render before exporting", async () => {
    const canvas = {
      dataset: { ready: "false" },
    } as unknown as HTMLCanvasElement;
    let finishFirst!: () => void;
    let finishSecond!: () => void;
    trackCanvasRender(
      canvas,
      new Promise<void>((resolve) => {
        finishFirst = resolve;
      }),
    );
    let exported = false;
    const capture = waitForCanvas(canvas).then(() => {
      exported = true;
    });
    trackCanvasRender(
      canvas,
      new Promise<void>((resolve) => {
        finishSecond = resolve;
      }),
    );
    finishFirst();
    await Promise.resolve();
    expect(exported).toBe(false);
    canvas.dataset.ready = "true";
    finishSecond();
    await capture;
    expect(exported).toBe(true);
  });

  test("rejects empty and failed previews", async () => {
    const canvas = {
      dataset: { ready: "false" },
    } as unknown as HTMLCanvasElement;
    await expect(waitForCanvas(canvas)).rejects.toThrow("Select an image");
  });
});

describe("editor drafts", () => {
  test("preserves data while protecting actions and merging older draft fields", () => {
    const action = () => {};
    const state = {
      code: "hello",
      background: { blur: 0, solid: "#fff" },
      saveDraft: action,
    };
    saveEditorDraft("codeEditorDraft", state);
    expect(JSON.parse(storage.get("codeEditorDraft")!)).not.toHaveProperty(
      "saveDraft",
    );
    storage.set(
      "codeEditorDraft",
      JSON.stringify({
        code: "restored",
        background: { blur: 5 },
        saveDraft: "malicious",
        unknown: true,
      }),
    );
    expect(loadEditorDraft("codeEditorDraft", state)).toEqual({
      code: "restored",
      background: { blur: 5, solid: "#fff" },
    });
    expect(state.saveDraft).toBe(action);
  });

  test("handles missing drafts and rejects corrupt storage", () => {
    expect(loadEditorDraft("missing", {})).toBeNull();
    for (const value of ["not json", "null", "[]"]) {
      storage.set("broken", value);
      expect(() => loadEditorDraft("broken", {})).toThrow();
    }
  });
});
