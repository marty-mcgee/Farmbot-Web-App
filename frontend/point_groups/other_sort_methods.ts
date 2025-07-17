import { isUndefined, sortBy, uniq } from "lodash";
import { TaggedPoint, TaggedSensorReading } from "farmbot";

export const distance = (
  p1: { x: number, y: number },
  p2: { x: number, y: number },
) =>
  Math.pow(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2), 0.5);

export const findNearest = (
  from: { x: number, y: number },
  available: (TaggedPoint | TaggedSensorReading)[],
): TaggedPoint | TaggedSensorReading | undefined => {
  const distances = available
    .filter(p => !isUndefined(p.body.x) && !isUndefined(p.body.y))
    .map(p => ({
      point: p,
      distance: distance({ x: p.body.x as number, y: p.body.y as number }, from)
    }));
  return sortBy(distances, "distance")[0]?.point;
};

export const nn = (pathPoints: TaggedPoint[]) => {
  let available = pathPoints.slice(0);
  const ordered: (TaggedPoint | TaggedSensorReading)[] = [];
  let from = { x: 0, y: 0 };
  pathPoints.map(() => {
    const nearest = findNearest(from, available);
    if (!nearest || isUndefined(nearest.body.x) || isUndefined(nearest.body.y)) {
      return;
    }
    ordered.push(nearest);
    from = { x: nearest.body.x, y: nearest.body.y };
    available = available.filter(p => p.uuid !== nearest.uuid);
  });
  return ordered;
};

export const alternating = (pathPoints: TaggedPoint[], axis: "xy" | "yx") => {
  const axis0: "x" | "y" = axis[0] as "x" | "y";
  const axis1: "x" | "y" = axis[1] as "x" | "y";
  const ordered: TaggedPoint[] = [];
  const rowCoordinates = sortBy(uniq(pathPoints.map(p => p.body[axis0])));
  const rows = rowCoordinates.map((rowCoordinate, index) => {
    const row = sortBy(pathPoints.filter(p =>
      p.body[axis0] == rowCoordinate), "body." + axis1);
    return index % 2 == 0 ? row : row.reverse();
  });
  rows.map(row => row.map(p => ordered.push(p)));
  return ordered;
};
