import Delaunator from "delaunator";
import { TaggedGenericPointer } from "farmbot";
import { Config } from "./config";
import { soilHeightPoint } from "../points/soil_height";
import { zZero } from "./helpers";

export const computeSurface = (
  mapPoints: TaggedGenericPointer[] | undefined,
  config: Config,
) => {
  const outerBoundaryParams = {
    x: {
      min: config.bedWallThickness - config.bedXOffset,
      max: config.bedLengthOuter - config.bedWallThickness - config.bedXOffset,
    },
    y: {
      min: config.bedWallThickness - config.bedYOffset,
      max: config.bedWidthOuter - config.bedWallThickness - config.bedYOffset,
    },
  };

  const boundaryParams = {
    outer: outerBoundaryParams,
    inner: {
      x: {
        min: outerBoundaryParams.x.min + 0.01,
        max: outerBoundaryParams.x.max - 0.01,
      },
      y: {
        min: outerBoundaryParams.y.min + 0.01,
        max: outerBoundaryParams.y.max - 0.01,
      },
    },
  };

  const soilHeightPoints = (mapPoints || [])
    .filter(p => soilHeightPoint(p) &&
      p.body.x > boundaryParams.outer.x.min &&
      p.body.x < boundaryParams.outer.x.max &&
      p.body.y > boundaryParams.outer.y.min &&
      p.body.y < boundaryParams.outer.y.max)
    .map(p => ([
      p.body.x,
      p.body.y,
      (config.exaggeratedZ && config.perspective)
        ? (-config.soilHeight + (p.body.z + config.soilHeight) * 10)
        : p.body.z,
    ]));

  const hasPoints = soilHeightPoints.length > 0;

  const soilHeightZ = -config.soilHeight;

  const boundaryZ = () => {
    // bot coordinates of bed top, which is zero in three space
    const bedTopZ = -zZero(config);
    const bedBottomZ = bedTopZ - config.bedHeight;
    // attach floating soil surface to bed top and bottom
    if (soilHeightZ > bedTopZ) { return bedTopZ; }
    if (soilHeightZ < bedBottomZ) { return bedBottomZ; }
    return soilHeightZ;
  };

  Object.entries(boundaryParams).map(([key, params]) => {
    // with soil points: gradually slope to the outer boundary
    if (key == "inner" && hasPoints) { return; }
    [
      { x: params.x.min, y: params.y.min },
      { x: params.x.min, y: params.y.max },
      { x: params.x.max, y: params.y.min },
      { x: params.x.max, y: params.y.max },
    ].map(p => {
      soilHeightPoints.push([
        p.x,
        p.y,
        // no soil points: flat soil with vertical slope to outer boundary
        key == "inner" ? soilHeightZ : boundaryZ(),
      ]);
    });
  });

  const soilPoints = soilHeightPoints;

  const projected2D = soilPoints.map(([x, y, _z]) => [x, y]);
  const delaunay = Delaunator.from(projected2D);
  const triangles = delaunay.triangles;
  const vertices: number[] = [];
  const vertexList: [number, number, number][] = [];
  const faces: number[] = [];
  const uvs: number[] = [];
  const xs = soilPoints.map(p => p[0]);
  const ys = soilPoints.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX;
  const height = maxY - minY;
  for (let i = 0; i < triangles.length; i += 3) {
    for (let j = 0; j < 3; j++) {
      const index: number = triangles[i + j];
      faces.push(i + j);
      const [x, y, z] = soilPoints[index];
      vertices.push(x, y, z);
      vertexList.push([x, y, z]);
      const u = (x - minX) / width;
      const v = 1 - (y - minY) / height;
      uvs.push(u, v);
    }
  }
  return { vertices, vertexList, uvs, faces };
};
