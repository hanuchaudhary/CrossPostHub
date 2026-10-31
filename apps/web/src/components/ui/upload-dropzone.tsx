// Adapted from Bencho's Upload dropzone, MIT: https://bencho.dev/licence.
// Original design comments are retained below. The original demo used pretend
// files and a pretend wire; this adapter uses the composer's real files and
// network progress instead. The 5 MB demo limit is replaced by platform rules.
import {
  type CSSProperties,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Check,
  LoaderCircle,
  RotateCcw,
  Upload as UpIcon,
  X,
} from "lucide-react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";

/* ══ Upload dropzone ══════════════════════════════════════
   A drop box, and three files lying on a tray under it. Pick
   one up and carry it into the box: it uploads there — name,
   a rolling percentage, a bar — ticks, and goes back to the
   tray so you can do it again.

   ── NO REAL FILES ───────────────────────────────────────
   The files are part of the block. Nothing is read from the
   desktop and nothing is sent anywhere; the drag is an ordinary
   pointer drag inside the block, which is also what lets the
   wall's scripted cursor demonstrate it.

   ── THE BOX INHALES, AND SWALLOWS ───────────────────────
   A plain filled box, no edge. A file carried over it is
   answered before it is let go: the box grows with a small
   bounce and the arrow lifts toward the hand. Let go and the
   file is SUCKED in — it accelerates toward the box's middle,
   shrinking and drawing out long as it goes — and the box gives
   a little gulp before the upload appears in it. Let go
   anywhere else and the file springs home.

   ── ONE OF THEM IS TOO BIG ──────────────────────────────
   The limit is fixed at 5 MB and the video is always over it,
   so dropping it shakes the box, says so in red and the file
   springs home. The picture always goes. */

/* ── inlined from lab/spring ──────────────────────── */
/* ── one spring, for everything that settles ───────────────
   The maths was already on this bench twice, copied by hand:
   Humidity's wheel and Brightness's column both accumulate
   velocity toward a target, damp it, and snap when both the
   delta and the velocity fall under 0.02. Two copies is a
   coincidence; five would be a policy, so it comes out here
   before the elastic blocks are written against it.

   The two shipped copies are deliberately NOT refactored onto
   this. They work, they are tuned, and rewriting the innards
   of two live components to prove a point about duplication
   is how a good afternoon becomes a bad one. This is the one
   new code uses.

   Frames, not milliseconds. `dt` is expressed in sixtieths of
   a second and the damping is RAISED to it rather than
   multiplied by it, so a dropped frame decays the same amount
   of energy as the two frames it replaced. Multiplying is the
   version that makes a spring behave differently on a busy
   page, which is the hardest kind of bug to see.

   The loop parks itself the moment the value has settled.
   CLAUDE.md is not complimentary about the one permanent
   requestAnimationFrame already on this bench and there is no
   case for five more. */

/* Read once, the way the wheel and the pill nav do. A
   preference, not a live input. */
// Motion supplies the equivalent reduced-motion preference in this adapter.

type F = { id: string; name: string; ext: string; size: number; tint: string };
export type UploadDropzoneFile = {
  file: File;
  status: "uploading" | "uploaded" | "error";
  progress: number;
  error?: string;
};
const fmt = (b: number) =>
  b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* ── the file icon ─────────────────────────────────────────
   After Untitled UI's: a rounded page on a 40 grid with a thin
   grey outline and a folded corner, and the extension on a
   coloured label that sticks out past the page's left edge —
   the colour carries the kind before the word is read. */
function Page({ f, size = 40 }: { f: F; size?: number }) {
  return (
    <svg
      className="upl-page"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="upl-page-line"
        d="M7.75 4A3.25 3.25 0 0 1 11 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 35 39.25H11A3.25 3.25 0 0 1 7.75 36z"
      />
      <path className="upl-page-line" d="M27 .5V8a4 4 0 0 0 4 4h7.5" />
      <rect width="29" height="16" x="1" y="18" rx="8" fill={f.tint} />
      {/* 9 units on the 40 grid: the mark is part of the drawing and
        scales with it, so its size lives here, not in the stylesheet */}
      <text
        x="15.5"
        y="29.1"
        textAnchor="middle"
        fontSize="9"
        className="upl-page-ext"
      >
        {f.ext}
      </text>
    </svg>
  );
}
function Roll({ value }: { value: number }) {
  const s = String(Math.round(value));
  return (
    <span className="upl-roll" aria-label={`${s}%`}>
      {s.split("").map((d, i) => (
        <span key={s.length - i} className="upl-roll-col">
          <span
            className="upl-roll-strip"
            style={{ transform: `translateY(${-Number(d)}em)` }}
          >
            {"0123456789".split("").map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
      %
    </span>
  );
}

export function UploadDropzone({
  files = [],
  onFiles,
  onRemove,
  onRetry,
  accept,
  disabled = false,
  bounce = 40,
  corner = 20,
}: {
  files?: UploadDropzoneFile[];
  onFiles: (files: File[]) => string | undefined;
  onRemove: (file: File) => void;
  onRetry: (file: File) => void;
  accept: string;
  disabled?: boolean;
  /* how springy a file flies home, 0..100 */
  bounce?: number;
  corner?: number;
}) {
  const still = useReducedMotion();
  const [over, setOver] = useState(false);
  /* what the box says when it refuses — null while it is not */
  const [refuse, setRefuse] = useState<string | null>(null);
  const [gulp, setGulp] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const shake = useAnimationControls();
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  /* ── the pretend wire ──────────────────────────────────── */
  // Replaced by actual upload states from the composer: 100% and the tick are
  // shown only after the server has acknowledged the completed upload.
  const up = files.some((file) => file.status === "uploading");
  const finished =
    files.length > 0 && files.every((file) => file.status === "uploaded");

  /* ── trying again ─────────────────────────────────────────
     The first refusal is plain. Try the same file again and the
     box starts to answer back, a new line each time, the last one
     repeating — until a file that fits goes through, which puts it
     back to being polite. */
  // Real validation errors stay plain; retry acts on the failed network request.
  const receive = (incoming: File[]) => {
    if (disabled || !incoming.length) return;
    const error = onFiles(incoming);
    setRefuse(error ?? null);
    if (error) {
      if (!still)
        void shake.start({
          x: [0, -7, 6, -4, 2, 0],
          transition: { duration: 0.42 },
        });
      return;
    }
    setGulp(true);
    later(() => setGulp(false), 460);
  };

  /* ── carrying a file ───────────────────────────────────── */
  // Native file drops replace the demo's internal pointer drag, so actual
  // desktop files and the keyboard-operated file picker follow the same path.
  const isFiles = (event: DragEvent) =>
    Array.from(event.dataTransfer.types).includes("Files");

  /* ── the suction ──────────────────────────────────────────
     From where it was let go to the box's middle, on an ease-IN:
     slow to leave and faster the nearer it gets, which is what
     reads as being pulled rather than as flying. It shrinks as it
     goes and draws out long in the direction of travel, then the
     box gulps and the upload takes its place. */
  /* drawn out along the pull, never turned: a tile rotated to
     face its travel went upside down on the way up and spun on
     a short pull. Up or down it goes tall, sideways it goes
     wide, and a pull too short to have a direction only shrinks */
  // Browser-owned desktop drag ghosts cannot be transformed by the page.
  // Keep the receiving box's gulp and animate the real upload rows instead.
  /* the upload starts as the tile goes down the hole, not after
     it has finished vanishing: waiting out the whole pull left a
     beat where the box sat empty, reading as a freeze */

  /* ── the box hugs the upload ─────────────────────────────
     While a file is in it the box closes in round the upload row
     — measured, because the row is as wide as its name — and
     grows a little when the tick arrives; back to idle it opens
     out to the full drop box again. Width and height, never a
     scale, so its corner stays the corner. It shrinks inside a
     slot of fixed size, so nothing below it moves. */
  // With several concurrent uploads, keep the drop target fixed and put each
  // real file on its own tray row; progress never reflows the composer.
  return (
    <div
      className="upl"
      data-disabled={disabled || undefined}
      data-still={still || undefined}
      style={
        {
          "--upl-r": `${Math.max(0, corner)}px`,
          "--upl-spring": `cubic-bezier(0.3, ${1 + (clamp(bounce, 0, 100) / 100) * 0.9}, 0.4, 1)`,
        } as CSSProperties
      }
    >
      <motion.div animate={shake} className="upl-zone-wrap">
        <button
          type="button"
          className="upl-zone"
          data-over={over || undefined}
          data-refuse={!!refuse || undefined}
          data-busy={up || undefined}
          data-gulp={(!still && gulp) || undefined}
          disabled={disabled}
          onClick={() => input.current?.click()}
          onDragEnter={(event) => {
            if (!isFiles(event)) return;
            event.preventDefault();
            if (!disabled) {
              depth.current++;
              setOver(true);
            }
          }}
          onDragOver={(event) => {
            if (isFiles(event)) {
              event.preventDefault();
              event.dataTransfer.dropEffect = disabled ? "none" : "copy";
            }
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            depth.current = Math.max(0, depth.current - 1);
            if (!depth.current) setOver(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            event.stopPropagation();
            depth.current = 0;
            setOver(false);
            receive(Array.from(event.dataTransfer.files));
          }}
        >
          <span className="upl-icon">
            {up ? (
              <LoaderCircle
                size={18}
                strokeWidth={2}
                className={still ? undefined : "animate-spin"}
              />
            ) : finished ? (
              <Check size={18} strokeWidth={2} />
            ) : (
              <UpIcon size={18} strokeWidth={2} />
            )}
          </span>
          <span className="upl-say">
            <b>
              {refuse ??
                (over
                  ? "Drop to upload"
                  : up
                    ? "Uploading your media…"
                    : "Drop media here or select files")}
            </b>
            <span>Up to 4 photos or one video · uploads start immediately</span>
          </span>
        </button>
      </motion.div>
      <input
        ref={input}
        aria-label="Select photos or video"
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          receive(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      {refuse && (
        <p className="upl-error" role="alert">
          {refuse}
        </p>
      )}
      <span className="sr-only" role="status">
        {up
          ? `${files.filter((file) => file.status === "uploading").length} files uploading`
          : finished
            ? "All media uploaded"
            : ""}
      </span>
      <div className="upl-tray upl-tray-live">
        {files.map(({ file, status, progress, error }, index) => {
          const f: F = {
            id: String(index),
            name: file.name,
            ext:
              file.name.split(".").pop()?.toUpperCase().slice(0, 4) || "FILE",
            size: file.size,
            tint: file.type.startsWith("video/") ? "#155EEF" : "#079455",
          };
          return (
            <motion.div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="upl-now upl-now-live"
              initial={still ? false : { opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <Page f={f} size={36} />
              <span className="upl-text">
                <span className="upl-name">{file.name}</span>
                <span className="upl-meta">
                  {fmt(file.size)} ·{" "}
                  {status === "uploaded" ? (
                    "Uploaded"
                  ) : status === "error" ? (
                    "Upload failed"
                  ) : (
                    <Roll value={progress} />
                  )}
                </span>
                <span
                  className="upl-track"
                  role="progressbar"
                  aria-label={`Uploading ${file.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                >
                  <span
                    className="upl-bar"
                    style={{ transform: `scaleX(${progress / 100})` }}
                  />
                </span>
                {status === "error" && (
                  <span className="upl-error" role="alert">
                    {error || "Upload failed. Try again."}
                  </span>
                )}
              </span>
              {/* the tick's room is kept from the start, so the box
            is its final size before the tick arrives */}
              <span className="upl-end">
                {status === "uploaded" && (
                  <span className="upl-tick">
                    <Check size={14} strokeWidth={2} />
                  </span>
                )}
                {status === "uploading" && (
                  <LoaderCircle
                    size={16}
                    className={still ? undefined : "animate-spin"}
                  />
                )}
                {status === "error" && (
                  <button
                    type="button"
                    className="upl-action"
                    aria-label={`Retry ${file.name}`}
                    disabled={disabled}
                    onClick={() => onRetry(file)}
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
              </span>
              <button
                type="button"
                className="upl-action"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                onClick={() => onRemove(file)}
              >
                <X size={15} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
