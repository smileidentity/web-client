// Seam / straight-line rejection for the document contour pass.
//
// On surfaces with strong straight linear features — a parquet/plank floor, a
// slatted table — the seams between planks produce long, high-contrast straight
// edges that survive the adaptive-Canny high threshold. A card-shaped quad can
// then be framed by those background lines instead of a real document border,
// especially for a low-contrast (e.g. dark) card whose own border gradient is
// weak. The existing geometry gates (aspect / fill / angles / wall-hug) are
// proxies that such a seam-quad can still pass.
//
// Discriminator: a real card edge is a BOUNDED segment ending at two corners
// where perpendicular edges meet. A seam is a THROUGH-LINE that continues PAST
// the candidate's corners. For each of the quad's 4 edges we look for a Hough
// line segment that is collinear with the edge AND overshoots both of its
// endpoints (or runs to the ROI boundary). If >= minSeamEdges edges sit on such
// through-lines, the quad is framed by background lines, not a card → reject.
//
// Pure module (no OpenCV): the hook runs cv.HoughLinesP and passes plain arrays
// in, so the geometry is unit-testable in isolation (mirrors qualityScoring.ts).

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Corner {
  x: number;
  y: number;
}

export interface SeamParams {
  // Max angular difference (deg) for a segment to count as parallel to an edge.
  angleTolDeg?: number;
  // Max perpendicular distance (px) from the edge midpoint to the segment's
  // infinite line for the two to be considered collinear (same line).
  distTolPx?: number;
  // A collinear segment must overshoot an edge endpoint by more than this
  // fraction of the edge length to count as "extending past" that corner.
  overshootFrac?: number;
  // Number of edges that must sit on through-lines to reject the quad.
  minSeamEdges?: number;
  // Optional ROI size: when provided, a segment endpoint within boundMarginPx
  // of a ROI wall also satisfies overshoot on that side (a seam running to the
  // ROI edge when the card sits near the frame border).
  roiW?: number;
  roiH?: number;
  boundMarginPx?: number;
}

// Documented defaults. Only the Hough acquisition knobs (threshold, min length,
// max gap, enable) are exposed to the tuning panel; these geometric tolerances
// are intentionally fixed constants.
const DEFAULTS = {
  angleTolDeg: 8,
  distTolPx: 6,
  overshootFrac: 0.15,
  minSeamEdges: 2,
  boundMarginPx: 4,
};

// Orientation of a vector in [0, 180) degrees (lines are undirected).
function lineAngleDeg(dx: number, dy: number): number {
  let a = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (a < 0) a += 180;
  if (a >= 180) a -= 180;
  return a;
}

// Smallest absolute difference between two [0,180) line angles, in [0, 90].
function angleDiffDeg(a: number, b: number): number {
  let d = Math.abs(a - b) % 180;
  if (d > 90) d = 180 - d;
  return d;
}

interface ResolvedParams {
  angleTol: number;
  distTol: number;
  overshoot: number;
  nearRoiWall: (x: number, y: number) => boolean;
}

// True when `seg` is collinear with edge A→B and overshoots both endpoints
// (or runs to a ROI wall). Uses early returns rather than `continue` so the
// caller can express the per-edge test as a single `Array.some`.
function segmentIsThroughLine(
  a: Corner,
  b: Corner,
  ux: number,
  uy: number,
  len: number,
  edgeAngle: number,
  mx: number,
  my: number,
  seg: Segment,
  p: ResolvedParams,
): boolean {
  const sx = seg.x2 - seg.x1;
  const sy = seg.y2 - seg.y1;
  const segLen = Math.sqrt(sx * sx + sy * sy);
  if (segLen === 0) return false;

  // (a) parallel?
  if (angleDiffDeg(edgeAngle, lineAngleDeg(sx, sy)) > p.angleTol) return false;

  // (b) collinear? perpendicular distance of edge midpoint to the segment's
  // infinite line = |(M - P) x segDir| / |segDir|.
  const wx = mx - seg.x1;
  const wy = my - seg.y1;
  const perpDist = Math.abs(wx * sy - wy * sx) / segLen;
  if (perpDist > p.distTol) return false;

  // (c) overshoot: project the segment's endpoints onto the edge axis (origin
  // at A). The edge spans t in [0, len].
  const tP = (seg.x1 - a.x) * ux + (seg.y1 - a.y) * uy;
  const tQ = (seg.x2 - a.x) * ux + (seg.y2 - a.y) * uy;
  const s0 = Math.min(tP, tQ);
  const s1 = Math.max(tP, tQ);
  const overshootBeforeA =
    s0 < -p.overshoot * len ||
    p.nearRoiWall(s0 === tP ? seg.x1 : seg.x2, s0 === tP ? seg.y1 : seg.y2);
  const overshootAfterB =
    s1 > len + p.overshoot * len ||
    p.nearRoiWall(s1 === tP ? seg.x1 : seg.x2, s1 === tP ? seg.y1 : seg.y2);
  return overshootBeforeA && overshootAfterB;
}

// Whether edge A→B sits on a background through-line.
function edgeOnThroughLine(
  a: Corner,
  b: Corner,
  segments: Segment[],
  p: ResolvedParams,
): boolean {
  const ex = b.x - a.x;
  const ey = b.y - a.y;
  const len = Math.sqrt(ex * ex + ey * ey);
  if (len === 0) return false;
  const ux = ex / len; // unit direction along the edge
  const uy = ey / len;
  const edgeAngle = lineAngleDeg(ex, ey);
  const mx = (a.x + b.x) / 2; // edge midpoint
  const my = (a.y + b.y) / 2;
  return segments.some((seg) =>
    segmentIsThroughLine(a, b, ux, uy, len, edgeAngle, mx, my, seg, p),
  );
}

/**
 * Classify each of the quad's 4 edges as lying on a background "through-line".
 * Returns the per-edge flags and the count of through-line edges.
 */
export function classifyEdgesOnThroughLines(
  corners: Corner[],
  segments: Segment[],
  params: SeamParams = {},
): { seamEdgeCount: number; perEdge: boolean[] } {
  const boundMargin = params.boundMarginPx ?? DEFAULTS.boundMarginPx;
  const { roiW, roiH } = params;
  const resolved: ResolvedParams = {
    angleTol: params.angleTolDeg ?? DEFAULTS.angleTolDeg,
    distTol: params.distTolPx ?? DEFAULTS.distTolPx,
    overshoot: params.overshootFrac ?? DEFAULTS.overshootFrac,
    nearRoiWall: (x: number, y: number): boolean =>
      roiW != null &&
      roiH != null &&
      (x <= boundMargin ||
        y <= boundMargin ||
        x >= roiW - boundMargin ||
        y >= roiH - boundMargin),
  };

  const perEdge = [false, false, false, false];
  if (!corners || corners.length !== 4 || !segments || segments.length === 0) {
    return { seamEdgeCount: 0, perEdge };
  }

  for (let i = 0; i < 4; i++) {
    perEdge[i] = edgeOnThroughLine(
      corners[i],
      corners[(i + 1) % 4],
      segments,
      resolved,
    );
  }

  const seamEdgeCount = perEdge.reduce((n, flag) => n + (flag ? 1 : 0), 0);
  return { seamEdgeCount, perEdge };
}

/**
 * True when the quad is framed by background straight lines (a seam artifact)
 * rather than a real card border.
 */
export function isSeamFalseQuad(
  corners: Corner[],
  segments: Segment[],
  params: SeamParams = {},
): boolean {
  const minSeamEdges = params.minSeamEdges ?? DEFAULTS.minSeamEdges;
  const { seamEdgeCount } = classifyEdgesOnThroughLines(
    corners,
    segments,
    params,
  );
  return seamEdgeCount >= minSeamEdges;
}
