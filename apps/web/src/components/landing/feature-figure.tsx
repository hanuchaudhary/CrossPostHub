import { type CSSProperties, type ReactNode, useState } from "react";
import { Box, Glow, path, Plate, Press, project } from "react-isokit";
import type { Box3 } from "react-isokit";
import { Callout } from "react-isokit/drafting";

type FigureKind = "publish" | "workflow" | "schedule" | "media" | "workspace";

const HUB = { x: 49, y: 92, z: 0, w: 66, d: 52, h: 18 };
const RECEIVERS = [0, 61, 122].map((x) => ({
  x,
  y: 0,
  z: 0,
  w: 44,
  d: 34,
  h: 36,
}));
const PRESS = { x: 0, y: 0, z: 0, w: 136, d: 108, h: 9 };
const LAYERS = [16, 40, 64].map((z) => ({
  x: 10,
  y: 10,
  z,
  w: 116,
  d: 88,
  h: 3,
}));
const CALENDAR = { x: 0, y: 0, z: 8, w: 124, d: 20, h: 100 };
const FOOT = { x: 0, y: 0, z: 0, w: 124, d: 52, h: 8 };
const CLOCK = { x: 137, y: 23, z: 0, w: 46, d: 20, h: 52 };
const POST = { x: 84, y: 5, z: 5, w: 90, d: 112, h: 5 };
const PHOTO = { x: 0, y: 44, z: 28, w: 70, d: 58, h: 3 };
const ORGANIZER = { x: 0, y: 0, z: 0, w: 168, d: 112, h: 8 };
const FILES = [0, 1, 2].map((i) => ({
  x: 8 + i * 53,
  y: 18,
  z: 8,
  w: 46,
  d: 9,
  h: 62,
}));

const CONFIG: Record<
  FigureKind,
  { name: string; fig: string; hint: string; fit: Box3[]; label: string }
> = {
  publish: {
    name: "One idea, everywhere",
    fig: "01",
    hint: "draft → three destinations",
    fit: [HUB, ...RECEIVERS],
    label:
      "A publishing hub sends one post along three cables to three social channels.",
  },
  workflow: {
    name: "From spark to story",
    fig: "02",
    hint: "words + visuals → ready",
    fit: [PRESS, ...LAYERS],
    label:
      "Separate layers of words and visuals assemble into one finished post.",
  },
  schedule: {
    name: "A date with your audience",
    fig: "03",
    hint: "choose a day → let it go",
    fit: [FOOT, CALENDAR, CLOCK],
    label:
      "A desk calendar selects a publishing day while a clock counts toward the scheduled time.",
  },
  media: {
    name: "A picture meets a story",
    fig: "04",
    hint: "image → complete post",
    fit: [POST, PHOTO, { ...PHOTO, z: 50 }],
    label:
      "A photograph slides into a written post, bringing words and visuals together.",
  },
  workspace: {
    name: "Everything in its place",
    fig: "05",
    hint: "pending → scheduled → published",
    fit: [ORGANIZER, ...FILES, { ...FILES[0], z: 30 }],
    label:
      "Three file holders organize pending, scheduled, and published posts; a file lifts in each category.",
  },
};

function Lines({
  x = 10,
  y = 12,
  width = 70,
  count = 3,
}: {
  x?: number;
  y?: number;
  width?: number;
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <path
          key={i}
          className="ik-detail"
          d={`M${x} ${y + i * 7}h${width - (i === count - 1 ? 15 : 0)}`}
        />
      ))}
    </>
  );
}

function Landscape({
  width = 50,
  height = 36,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <>
      <rect className="ik-well" width={width} height={height} rx={2} />
      <circle className="ik-line" cx={width * 0.74} cy={height * 0.26} r={4} />
      <path
        className="ik-line"
        d={`M3 ${height - 4}L${width * 0.32} ${height * 0.35}L${width * 0.58} ${height * 0.76}L${width * 0.74} ${height * 0.5}L${width - 3} ${height - 4}`}
      />
    </>
  );
}

function Publishing({ replay }: { replay: () => void }) {
  return (
    <>
      {RECEIVERS.map((receiver, i) => {
        const cable = path([
          [82, 93, 4],
          [82, 65, 4],
          [receiver.x + 22, 53, 4],
          [receiver.x + 22, 34, 4],
        ]);
        return (
          <g key={i}>
            <path className="ik-line" d={cable} />
            <path
              className="ik-live feature-signal ik-loop"
              style={{ "--order": i } as CSSProperties}
              d={cable}
            />
          </g>
        );
      })}
      {RECEIVERS.map((receiver, i) => (
        <Box
          key={i}
          {...receiver}
          r={5}
          top={
            <text className="ik-label" x={22} y={20} textAnchor="middle">
              {["x", "in", "ig"][i]}
            </text>
          }
          front={
            <>
              <rect
                className="ik-screen"
                x={6}
                y={6}
                width={32}
                height={23}
                rx={2}
              />
              <path className="ik-detail" d="M12 14h20M12 20h12" />
              <Glow>
                <g
                  className="feature-delivered ik-loop"
                  style={{ "--order": i } as CSSProperties}
                >
                  <path className="ik-screen-line" d="M16 17l4 4 9-9" />
                </g>
              </Glow>
            </>
          }
          side={<path className="ik-detail" d="M8 10v15M13 10v15M18 10v15" />}
        />
      ))}
      <Press
        label="Replay cross-posting preview"
        material="rubber"
        onPress={replay}
      >
        <g>
          <Box
            {...HUB}
            r={6}
            top={
              <>
                <rect
                  className="ik-screen"
                  x={9}
                  y={8}
                  width={48}
                  height={28}
                  rx={2}
                />
                <text
                  className="ik-screen-text"
                  x={33}
                  y={25}
                  textAnchor="middle"
                  fontSize={8}
                >
                  one post
                </text>
                <path
                  className="ik-live feature-send ik-loop"
                  d="M25 41h16m-5-4 5 4-5 4"
                />
              </>
            }
            front={
              <text className="ik-label" x={10} y={12}>
                CrossPostHub
              </text>
            }
          />
        </g>
      </Press>
      <Callout at={[82, 118, 18]} dx={-48} dy={20} label="write once" />
    </>
  );
}

function Workflow({ replay }: { replay: () => void }) {
  return (
    <>
      <Box
        {...PRESS}
        r={5}
        front={
          <text className="ik-label" x={12} y={7}>
            a little less juggling
          </text>
        }
      />
      {LAYERS.map((layer, i) => (
        <g key={i}>
          <g
            className="feature-assemble ik-loop"
            style={{ "--order": i, "--drop": `${i * 21}px` } as CSSProperties}
          >
            <Box
              {...layer}
              r={3}
              top={
                <>
                  {i === 0 && (
                    <>
                      <text className="ik-label" x={9} y={18}>
                        the first spark
                      </text>
                      <Lines y={31} width={92} count={5} />
                    </>
                  )}
                  {i === 1 && (
                    <>
                      <g transform="translate(9 9)">
                        <Landscape width={45} height={50} />
                      </g>
                      <Lines x={65} y={18} width={40} count={5} />
                    </>
                  )}
                  {i === 2 && (
                    <>
                      <rect
                        className="ik-detail"
                        x={8}
                        y={8}
                        width={100}
                        height={71}
                        rx={2}
                      />
                      <text className="ik-label" x={16} y={25}>
                        a story, ready.
                      </text>
                      <Lines x={16} y={37} width={84} count={3} />
                      <path className="ik-live" d="M78 63l5 5 10-12" />
                    </>
                  )}
                </>
              }
            />
          </g>
        </g>
      ))}
      <Press label="Replay workflow assembly" material="paper" onPress={replay}>
        <g>
          <Box
            x={143}
            y={70}
            z={0}
            w={28}
            d={28}
            h={5}
            r={4}
            top={<path className="ik-line" d="M8 14a6 6 0 1 0 3-5M8 7v7h7" />}
          />
        </g>
      </Press>
    </>
  );
}

function Scheduling({ replay }: { replay: () => void }) {
  return (
    <>
      <Box {...FOOT} r={4} />
      <Box
        {...CALENDAR}
        r={4}
        front={
          <>
            <text className="ik-label" x={10} y={16}>
              a little room to create
            </text>
            <path className="ik-detail" d="M8 23h108" />
            {["m", "t", "w", "t", "f", "s", "s"].map((day, i) => (
              <text key={i} className="ik-label" x={14 + i * 16} y={36}>
                {day}
              </text>
            ))}
            {Array.from({ length: 21 }, (_, i) => (
              <text
                key={i}
                className="ik-label"
                x={14 + (i % 7) * 16}
                y={51 + Math.floor(i / 7) * 18}
              >
                {i + 1}
              </text>
            ))}
            <g className="feature-calendar-selection ik-loop">
              <rect
                className="ik-live"
                x={41}
                y={39}
                width={17}
                height={17}
                rx={3}
              />
            </g>
            <g className="feature-calendar-confirm ik-loop">
              <path className="ik-live" d="M99 81l4 4 8-10" />
            </g>
          </>
        }
        top={<path className="ik-detail" d="M10 10h104" />}
      />
      {[20, 96].map((x) => (
        <Box key={x} x={x} y={6} z={104} w={8} d={22} h={8} r={4} />
      ))}
      <Press
        label="Replay scheduling preview"
        material="metal"
        onPress={replay}
      >
        <g>
          <Box
            {...CLOCK}
            r={8}
            front={
              <>
                <circle className="ik-screen" cx={23} cy={25} r={18} />
                <g transform="translate(23 25)">
                  <path
                    className="ik-detail"
                    d="M0-15v3M15 0h-3M0 15v-3M-15 0h3"
                  />
                  <path className="ik-line" d="M0 0l-7-4" />
                  <g className="feature-clock-hand ik-loop">
                    <path className="ik-line" d="M0 2V-12" />
                  </g>
                  <circle className="ik-fill" r={1.5} />
                </g>
                <text className="ik-label" x={23} y={48} textAnchor="middle">
                  10:00
                </text>
              </>
            }
          />
        </g>
      </Press>
    </>
  );
}

function Media({ replay }: { replay: () => void }) {
  const [moveX, moveY] = project(93, -11, -18);
  return (
    <>
      <Box
        {...POST}
        r={3}
        top={
          <>
            <circle className="ik-fill" cx={13} cy={12} r={4} />
            <Lines x={23} y={10} width={55} count={2} />
            <rect
              className="ik-well"
              x={9}
              y={28}
              width={70}
              height={58}
              rx={2}
            />
            <Lines x={9} y={95} width={65} count={2} />
          </>
        }
      />
      <g
        className="feature-photo-flight ik-loop"
        style={
          {
            "--photo-x": `${moveX}px`,
            "--photo-y": `${moveY}px`,
          } as CSSProperties
        }
      >
        <Press
          label="Replay words and visuals preview"
          material="paper"
          onPress={replay}
        >
          <g>
            <Box
              {...PHOTO}
              r={2}
              top={
                <>
                  <g transform="translate(5 5)">
                    <Landscape width={60} height={40} />
                  </g>
                  <text className="ik-label feature-photo-caption" x={7} y={53}>
                    a moment worth sharing
                  </text>
                </>
              }
            />
          </g>
        </Press>
      </g>
      <Callout at={[40, 60, 31]} dx={-25} dy={-28} label="your image" />
      <Callout at={[145, 104, 10]} dx={38} dy={18} label="the whole story" />
    </>
  );
}

function Workspace({ replay }: { replay: () => void }) {
  return (
    <>
      <Box {...ORGANIZER} r={5} />
      {FILES.map((file, i) => (
        <g key={i}>
          <Box x={file.x - 2} y={file.y - 5} z={8} w={50} d={67} h={8} r={3} />
          <g
            className="feature-file-lift ik-loop"
            style={{ "--order": i } as CSSProperties}
          >
            <Box
              {...file}
              r={3}
              front={
                <>
                  <text className="ik-label" x={6} y={13}>
                    0{i + 1}
                  </text>
                  <Lines x={6} y={24} width={34} count={3} />
                  <g
                    className="feature-file-check ik-loop"
                    style={{ "--order": i } as CSSProperties}
                  >
                    <path className="ik-live" d="M26 48l4 4 9-10" />
                  </g>
                </>
              }
            />
            <Box
              className={i === 2 ? "feature-accent-tab" : undefined}
              x={file.x + 4}
              y={file.y + 5}
              z={file.z + file.h}
              w={22}
              d={4}
              h={6}
              r={2}
            />
          </g>
          <Box
            x={file.x - 2}
            y={74}
            z={8}
            w={50}
            d={8}
            h={22}
            r={3}
            front={
              <text className="ik-label" x={25} y={14} textAnchor="middle">
                {["pending", "scheduled", "published"][i]}
              </text>
            }
          />
        </g>
      ))}
      <Press
        label="Replay workspace preview"
        material="plastic"
        onPress={replay}
      >
        <g>
          <Box
            x={55}
            y={92}
            z={8}
            w={58}
            d={14}
            h={3}
            r={3}
            top={
              <text className="ik-label" x={29} y={10} textAnchor="middle">
                all together
              </text>
            }
          />
        </g>
      </Press>
    </>
  );
}

const SCENES: Record<FigureKind, (props: { replay: () => void }) => ReactNode> =
  {
    publish: Publishing,
    workflow: Workflow,
    schedule: Scheduling,
    media: Media,
    workspace: Workspace,
  };

export function FeatureFigure({ kind }: { kind: FigureKind }) {
  const [replays, setReplays] = useState(0);
  const config = CONFIG[kind];
  const Scene = SCENES[kind];
  return (
    <div className={`feature-figure feature-figure-${kind}`}>
      <Plate
        className="feature-plate"
        fit={config.fit}
        aspect={1.5}
        pad={0.16}
      >
        <g key={replays}>
          <Scene replay={() => setReplays((value) => value + 1)} />
        </g>
      </Plate>
    </div>
  );
}
