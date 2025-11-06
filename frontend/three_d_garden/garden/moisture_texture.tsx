import React from "react";
import { soilSurfaceExtents } from "../triangles";
import { Config } from "../config";
import { OrthographicCamera, RenderTexture } from "@react-three/drei";
import { Mesh } from "../components";
import { BufferGeometry, Color } from "three";
import { HeightMaterial } from "./height_material";

export interface MoistureTextureProps {
  config: Config;
  geometry: BufferGeometry;
}

export const MoistureTexture = (props: MoistureTextureProps) => {
  const extents = soilSurfaceExtents(props.config);
  const width = extents.x.max - extents.x.min;
  const height = extents.y.max - extents.y.min;
  return <RenderTexture attach={"map"} width={width} height={height}>
    <OrthographicCamera makeDefault near={10} far={10000}
      left={0} right={width} top={height} bottom={0}
      position={[0, 0, 2000]}
      rotation={[0, 0, 0]}
      zoom={1}
      up={[0, 0, 1]} />
    <Mesh geometry={props.geometry}
      position={[0, 0, 500]}>
      <HeightMaterial
        min={0}
        max={1000}
        lowColor={new Color(0.5, 0.5, 0.5)}
        highColor={new Color(0, 0, 1)} />
    </Mesh>
  </RenderTexture>;
};
