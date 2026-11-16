/**
 * `as-drawn-figure/v1`: a figure's drawing transcribed from the source PDF's
 * vector layer (scripts/figures/pdf_as_drawn.py), so that
 * scripts/figures/as-drawn-svg.ts can redraw it as an SVG that keeps the
 * original's layout and style. Coordinates are PDF points relative to the
 * top-left corner of the figure's L1 region.
 *
 * It sits beside folio-assistant-core `schemas/figure-data.ts` (the DIIG
 * phases and SMART approach families) and is a candidate to move there once
 * the other dth-* folios use it.
 */
import { z } from "zod";

const Hex = z.string().regex(/^#[0-9A-F]{6}$/u, "a #RRGGBB colour");
const Num = z.number().finite();

export const AsDrawnShape = z.object({
  d: z.string().regex(/^M[-0-9MLCZ .e]*$/u, "an SVG path of M, L, C and Z commands"),
  fill: Hex.optional(),
  evenodd: z.literal(true).optional(),
  stroke: Hex.optional(),
  strokeWidth: Num.nonnegative().optional(),
  dash: z.array(Num.nonnegative()).optional(),
  cap: z.enum(["round", "square"]).optional(),
  join: z.enum(["round", "bevel"]).optional(),
  fillOpacity: Num.min(0).max(1).optional(),
  strokeOpacity: Num.min(0).max(1).optional(),
  /** Indices into `clips`: the shape is drawn inside all of them. */
  clip: z.array(z.number().int().nonnegative()).min(1).optional(),
}).strict().refine((s) => s.fill || s.stroke, "a shape is filled, stroked or both");

export const AsDrawnText = z.object({
  x: Num,
  y: Num,
  size: Num.positive(),
  text: z.string().min(1),
  weight: z.number().int().min(100).max(900).optional(),
  italic: z.literal(true).optional(),
  color: Hex.optional(),
  width: Num.positive().optional(),
  rotate: Num.optional(),
  link: z.string().url().optional(),
  clip: z.array(z.number().int().nonnegative()).min(1).optional(),
}).strict();

export const AsDrawnClip = z.object({
  d: z.string().regex(/^M[-0-9MLCZ .e]*$/u),
  evenodd: z.literal(true).optional(),
}).strict();

export const AsDrawnImage = z.object({
  x: Num, y: Num, width: Num.positive(), height: Num.positive(),
  png: z.string().min(1),
  clip: z.array(z.number().int().nonnegative()).min(1).optional(),
}).strict();

export const AsDrawnFigureSchema = z.object({
  $schema: z.literal("as-drawn-figure/v1"),
  figure: z.object({
    library: z.string().min(1),
    labels: z.array(z.string().regex(/^Fig\. \d+$/u)).min(1),
    caption: z.string().min(1).nullable(),
    page: z.number().int().positive(),
    file: z.string().min(1),
    render: z.string().min(1),
    /** The L1 section the figure sits in. */
    section: z.object({ id: z.string().min(1), title: z.string().min(1), file: z.string().min(1) }).strict(),
  }).strict(),
  basis: z.string().min(1),
  region: z.tuple([Num, Num, Num, Num]),
  canvas: z.object({ width: Num.positive(), height: Num.positive() }).strict(),
  clips: z.array(AsDrawnClip),
  shapes: z.array(AsDrawnShape),
  texts: z.array(AsDrawnText),
  images: z.array(AsDrawnImage).optional(),
  /** What the PDF paints that the transcription leaves out, and why. */
  omitted: z.object({ softMasked: z.number().int().positive(), why: z.string().min(1) }).strict().optional(),
}).strict().superRefine((f, ctx) => {
  for (const key of ["shapes", "texts", "images"] as const) {
    (f[key] ?? []).forEach((s, i) => s.clip?.forEach((c) => {
      if (c >= f.clips.length) ctx.addIssue({ code: "custom", path: [key, i, "clip"], message: `no clip ${c}` });
    }));
  }
});

export type AsDrawnFigure = z.infer<typeof AsDrawnFigureSchema>;
