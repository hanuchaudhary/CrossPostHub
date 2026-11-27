import { useEffect, useId, useRef, useSyncExternalStore } from "react";

import type { SoundPatch } from "@web-kits/audio";
import { SoundProvider, usePatch } from "@web-kits/audio/react";

import { TOAST_EVENT, type ToastState } from "@/lib/toast";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kobra-sound-muted";
const VOLUME_KEY = "kobra-sound-volume";
const DEFAULT_VOLUME = 0.5;

const PATCH = {
  name: "kobra-ui",
  sounds: {
    success: {
      layers: [
        {
          source: { type: "triangle", frequency: 784 },
          envelope: { attack: 0.004, decay: 0.16 },
          gain: 0.22,
        },
        {
          source: { type: "triangle", frequency: 1175 },
          envelope: { attack: 0.004, decay: 0.22 },
          gain: 0.18,
          delay: 0.075,
        },
      ],
    },
    error: {
      layers: [
        {
          source: { type: "triangle", frequency: 300 },
          filter: { type: "lowpass", frequency: 1200 },
          envelope: { attack: 0.003, decay: 0.13 },
          gain: 0.26,
        },
        {
          source: { type: "triangle", frequency: 224 },
          filter: { type: "lowpass", frequency: 1000 },
          envelope: { attack: 0.003, decay: 0.2 },
          gain: 0.24,
          delay: 0.09,
        },
      ],
    },

    warning: {
      layers: [
        {
          source: { type: "triangle", frequency: 622 },
          filter: { type: "lowpass", frequency: 2800 },
          envelope: { attack: 0.003, decay: 0.14 },
          gain: 0.2,
        },
        {
          source: { type: "triangle", frequency: 622 },
          filter: { type: "lowpass", frequency: 2800 },
          envelope: { attack: 0.003, decay: 0.18 },
          gain: 0.17,
          delay: 0.085,
        },
      ],
    },

    copy: {
      layers: [
        {
          source: { type: "sine", frequency: 1200 },
          envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.006 },
          gain: 0.16,
        },
        {
          source: { type: "sine", frequency: 1400 },
          envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.006 },
          delay: 0.04,
          gain: 0.14,
        },
      ],
    },

    notification: {
      layers: [
        {
          source: { type: "triangle", frequency: 523 },
          envelope: { attack: 0.008, decay: 0.3, sustain: 0.03, release: 0.12 },
          gain: 0.14,
        },
        {
          source: { type: "triangle", frequency: 784 },
          envelope: { attack: 0.008, decay: 0.25, sustain: 0.02, release: 0.1 },
          delay: 0.12,
          gain: 0.12,
        },
      ],
    },

    swoosh: {
      source: { type: "sine", frequency: { start: 300, end: 2000 } },
      envelope: { attack: 0.008, decay: 0.12, sustain: 0, release: 0.04 },
      gain: 0.12,
    },
  },
} as const satisfies SoundPatch;

export type SoundName = keyof (typeof PATCH)["sounds"];

const TOAST_SOUND: Partial<Record<ToastState, SoundName>> = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "notification",
};

function SoundEffectListener() {
  const patch = usePatch(PATCH);
  const muted = useSoundMuted();

  const wasMuted = useRef(muted);
  useEffect(() => {
    const cameBack = wasMuted.current && !muted;
    wasMuted.current = muted;
    if (cameBack) patch.play("swoosh");
  }, [muted, patch]);

  useEffect(() => {
    if (!patch.ready) return;
    const onToast = (event: Event) => {
      const state =
        (event as CustomEvent<{ state?: ToastState }>).detail.state ?? "info";
      const sound = TOAST_SOUND[state];
      if (sound) patch.play(sound);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, [patch]);

  return null;
}

const listeners = new Set<() => void>();

function subscribeMuted(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function notify() {
  for (const onChange of listeners) onChange();
}

export function setSoundMuted(muted: boolean) {
  localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  notify();
}

export function useSoundMuted() {
  return useSyncExternalStore(
    subscribeMuted,
    () => localStorage.getItem(STORAGE_KEY) === "1",
    () => false
  );
}

export function setSoundVolume(volume: number) {
  localStorage.setItem(VOLUME_KEY, String(volume));
  notify();
}

export function useSoundVolume() {
  return useSyncExternalStore(
    subscribeMuted,
    () => {
      const stored = Number(localStorage.getItem(VOLUME_KEY));

      return Number.isFinite(stored) && stored > 0 && stored <= 1
        ? stored
        : DEFAULT_VOLUME;
    },
    () => DEFAULT_VOLUME
  );
}

export function SoundEffects({ children }: { children: React.ReactNode }) {
  const muted = useSoundMuted();
  const volume = useSoundVolume();

  return (
    <SoundProvider enabled={!muted} volume={volume}>
      <SoundEffectListener />
      {children}
    </SoundProvider>
  );
}

const SPEAKER =
  "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z";
const WAVE_INNER = "M16 9a5 5 0 0 1 0 6";
const WAVE_OUTER = "M19.364 18.364a9 9 0 0 0 0-12.728";
const SLASH = "M2 2 22 22";

export function SoundToggle({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const muted = useSoundMuted();
  const maskId = useId();

  return (
    <button
      type="button"
      aria-label={muted ? "Unmute interface sounds" : "Mute interface sounds"}
      aria-pressed={muted}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setSoundMuted(!muted);
      }}

      {...props}
      className={cn(
        "flex size-7 cursor-pointer items-center justify-center rounded text-shell-fg-faint transition-[transform,box-shadow] duration-100 ease-out outline-none hover:bg-foreground/5 hover:text-shell-fg-muted focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none",
        className
      )}
    >
      <svg
        data-muted={muted}
        viewBox="0 0 24 24"
        width={17}
        height={17}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path
            className="sound-slash"
            d={SLASH}
            pathLength={1}
            stroke="black"
            strokeWidth={4}
          />
        </mask>
        <g mask={`url(#${maskId})`}>
          <path className="sound-speaker" d={SPEAKER} />
          <path className="sound-wave sound-wave-inner" d={WAVE_INNER} />
          <path className="sound-wave sound-wave-outer" d={WAVE_OUTER} />
        </g>
        <path className="sound-slash" d={SLASH} pathLength={1} />
      </svg>
    </button>
  );
}
