import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "./button";
import { Label } from "./label";
import { cn } from "@/lib/utils";

import type { LabelInputProps } from "@/lib/types";
export type { LabelInputProps } from "@/lib/types";
const MotionLabel = motion.create(Label);
const HEIGHT = 52;
const LABEL_SCALE = 0.78;
const INSET = 0.75;
const nativeTypes = new Set([
  "file",
  "hidden",
  "range",
  "color",
  "checkbox",
  "radio",
  "submit",
  "reset",
  "button",
  "image",
]);

export const LabelInput = forwardRef<HTMLInputElement, LabelInputProps>(
  function LabelInput(
    {
      label: labelProp,
      field,
      corner = 20,
      showcase = false,
      isDisabled,
      id: suppliedId,
      type: suppliedType,
      value,
      defaultValue,
      className,
      onChange,
      onInput,
      onFocus,
      onBlur,
      placeholder,
      disabled,
      readOnly,
      autoComplete,
      inputMode,
      name,
      ...props
    },
    forwardedRef,
  ) {
    const generatedId = useId();
    const id = suppliedId ?? `lbi-${generatedId.replace(/:/g, "")}`;
    const label =
      labelProp ??
      field ??
      placeholder ??
      props["aria-label"] ??
      (suppliedType === "password"
        ? "Password"
        : suppliedType === "email"
          ? "Email"
          : (name ?? "Search"));
    const type =
      suppliedType ??
      (field === "Password"
        ? "password"
        : field === "Email"
          ? "email"
          : "text");
    const secret = type === "password";
    const native = nativeTypes.has(type);
    const inactive = disabled || isDisabled;
    const reduced = useReducedMotion();
    const input = useRef<HTMLInputElement>(null);
    const box = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLLabelElement>(null);
    const [focused, setFocused] = useState(false);
    const [uncontrolledValue, setUncontrolledValue] = useState(() =>
      String(defaultValue ?? ""),
    );
    const [show, setShow] = useState(false);
    const [hop, setHop] = useState(0);
    const [measurements, setMeasurements] = useState({
      width: 280,
      labelWidth: label.length * 8,
    });
    const [quiet] = useState(
      () =>
        showcase &&
        typeof window !== "undefined" &&
        !!window.matchMedia?.("(pointer: coarse)").matches,
    );
    useImperativeHandle(forwardedRef, () => input.current!);
    useLayoutEffect(() => {
      if (!box.current || !labelRef.current || native) return;
      const measure = () => {
        const width = box.current?.clientWidth ?? 280,
          labelWidth = labelRef.current?.offsetWidth ?? label.length * 8;
        setMeasurements((previous) =>
          previous.width === width && previous.labelWidth === labelWidth
            ? previous
            : { width, labelWidth },
        );
      };
      const observer = new ResizeObserver(measure);
      observer.observe(box.current);
      observer.observe(labelRef.current);
      return () => observer.disconnect();
    }, [label, native]);
    useEffect(() => {
      const element = input.current,
        form = element?.form;
      if (!element || value !== undefined) return;
      const sync = () => setUncontrolledValue(element.value);
      const reset = () => queueMicrotask(sync);
      sync();
      form?.addEventListener("reset", reset);
      return () => form?.removeEventListener("reset", reset);
    }, [value, type]);
    const filled = String(value ?? uncontrolledValue).length > 0;
    // Native date/time controls display their own format hints even before a value exists.
    const lifted =
      focused ||
      filled ||
      ["date", "time", "datetime-local", "month", "week"].includes(type);
    const radius = Math.min(Math.max(corner, 0), HEIGHT / 2),
      lx = Math.max(14, radius + 4);
    const width = measurements.width,
      x0 = Math.max(radius, lx - 5),
      x1 = Math.min(
        width - radius,
        lx + measurements.labelWidth * LABEL_SCALE + 5,
      );
    const mid = (x0 + x1) / 2,
      arc = Math.max(0, radius - INSET),
      rightEdge = width - INSET,
      bottom = HEIGHT - INSET;
    const right =
      radius > INSET
        ? `M${x1},${INSET} L${width - radius},${INSET} A${arc},${arc} 0 0 1 ${rightEdge},${radius} L${rightEdge},${HEIGHT - radius} A${arc},${arc} 0 0 1 ${width - radius},${bottom} L${width / 2},${bottom}`
        : `M${x1},${INSET} H${rightEdge} V${bottom} H${width / 2}`;
    const left =
      radius > INSET
        ? `M${x0},${INSET} L${radius},${INSET} A${arc},${arc} 0 0 0 ${INSET},${radius} L${INSET},${HEIGHT - radius} A${arc},${arc} 0 0 0 ${radius},${bottom} L${width / 2},${bottom}`
        : `M${x0},${INSET} H${INSET} V${bottom} H${width / 2}`;
    const inputProps = {
      ...props,
      id,
      name: showcase ? "search-preview" : name,
      ref: input,
      disabled: inactive,
      readOnly,
      value,
      defaultValue,
      autoComplete: showcase ? "off" : autoComplete,
      inputMode: quiet ? ("none" as const) : inputMode,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        setUncontrolledValue(event.target.value);
        onChange?.(event);
      },
      onInput: (event: React.InputEvent<HTMLInputElement>) => {
        setUncontrolledValue(event.currentTarget.value);
        onInput?.(event);
      },
      onFocus: (event: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        setUncontrolledValue(event.target.value);
        setHop((current) => current + 1);
        onFocus?.(event);
      },
      onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        setUncontrolledValue(event.target.value);
        onBlur?.(event);
      },
    };
    if (native)
      return (
        <InputPrimitive
          {...inputProps}
          type={type}
          data-slot="input"
          className={cn(
            "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-xs outline-none file:mr-3 file:border-0 file:bg-transparent file:text-xs file:font-medium focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
            type === "hidden" && "hidden",
            className,
          )}
        />
      );
    return (
      <div
        className="w-full min-w-0 pt-3"
        data-slot="label-input"
        data-up={lifted}
        data-focus={focused}
        data-filled={filled}
        data-disabled={inactive || undefined}
      >
        <div
          ref={box}
          className={cn(
            "relative h-13 w-full min-w-0",
            inactive && "opacity-50",
          )}
        >
          <svg
            width="100%"
            height={HEIGHT}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 size-full overflow-visible fill-none",
              props["aria-invalid"] && props["aria-invalid"] !== "false"
                ? "text-destructive"
                : focused
                  ? "text-foreground"
                  : "text-input",
            )}
          >
            <motion.g
              stroke="currentColor"
              strokeWidth={1.5}
              initial={false}
              animate={{ opacity: focused ? 1 : filled ? 0.8 : 0.6 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
            >
              <path d={right} />
              <path d={left} />
              {[
                `M${mid},${INSET} L${x0},${INSET}`,
                `M${mid},${INSET} L${x1},${INSET}`,
              ].map((d, index) => (
                <motion.path
                  key={index}
                  d={d}
                  pathLength={1}
                  strokeDasharray="1 1"
                  initial={false}
                  animate={{ strokeDashoffset: lifted ? -1 : 0 }}
                  transition={{ duration: reduced ? 0 : 0.22, ease: "easeOut" }}
                />
              ))}
            </motion.g>
          </svg>
          <MotionLabel
            ref={labelRef}
            htmlFor={id}
            className={cn(
              "absolute left-0 top-0 z-10 flex h-13 w-fit origin-left cursor-text items-center whitespace-pre text-sm font-normal",
              focused ? "text-foreground" : "text-muted-foreground",
            )}
            initial={false}
            animate={{
              x: lx,
              y: lifted ? -HEIGHT / 2 : 0,
              scale: lifted ? LABEL_SCALE : 1,
            }}
            transition={{
              duration: reduced ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="sr-only">{label}</span>
            <span aria-hidden="true" className="inline-flex">
              {[...label].map((letter, index) => (
                <motion.span
                  key={`${hop}-${index}`}
                  className="inline-block whitespace-pre"
                  initial={false}
                  animate={focused && !reduced ? { y: [0, -3, 0] } : { y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.018,
                    ease: "easeOut",
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </MotionLabel>
          <InputPrimitive
            {...inputProps}
            type={secret ? (show ? "text" : "password") : type}
            data-slot="input"
            data-1p-ignore={showcase || undefined}
            data-lpignore={showcase ? "true" : undefined}
            data-bwignore={showcase || undefined}
            data-form-type={showcase ? "other" : undefined}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder=" "
            className={cn(
              "relative h-full w-full min-w-0 border-0 bg-transparent px-6 text-sm text-foreground outline-none disabled:cursor-not-allowed aria-invalid:text-destructive",
              secret && "pr-12",
              className,
            )}
          />
          {secret && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 text-muted-foreground"
              disabled={inactive}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => setShow((current) => !current)}
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={show ? "visible" : "hidden"}
                  className="inline-flex"
                  initial={{
                    opacity: reduced ? 1 : 0,
                    scale: reduced ? 1 : 0.7,
                  }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reduced ? 1 : 0.7 }}
                  transition={{ duration: reduced ? 0 : 0.12 }}
                >
                  <HugeiconsIcon
                    icon={show ? EyeOffIcon : EyeIcon}
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </motion.span>
              </AnimatePresence>
            </Button>
          )}
        </div>
      </div>
    );
  },
);
// Keep existing shadcn Input consumers compatible with the shared floating-label control.
export { LabelInput as Input };
