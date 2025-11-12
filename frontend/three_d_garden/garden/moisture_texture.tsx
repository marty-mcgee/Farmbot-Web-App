import React from "react";
import { soilSurfaceExtents } from "../triangles";
import { Config } from "../config";
import { OrthographicCamera, RenderTexture, Sphere } from "@react-three/drei";
import { Group, Mesh, MeshBasicMaterial } from "../components";
import { BufferGeometry, Color } from "three";
import { HeightMaterial } from "./height_material";
import { TaggedSensorReading } from "farmbot";
import { threeSpace, zZero } from "../helpers";

export interface MoistureTextureProps {
  config: Config;
  geometry: BufferGeometry;
  sensorReadings: TaggedSensorReading[];
  showMoistureReadings: boolean;
}

export const MoistureTexture = (props: MoistureTextureProps) => {
  const extents = soilSurfaceExtents(props.config);
  const width = extents.x.max - extents.x.min;
  const height = extents.y.max - extents.y.min;
  const { bedXOffset, bedYOffset } = props.config;
  return <RenderTexture attach={"map"} width={width} height={height}>
    <OrthographicCamera makeDefault near={10} far={10000}
      left={extents.x.min}
      right={extents.x.max}
      top={extents.y.min}
      bottom={extents.y.max}
      position={[bedXOffset, bedYOffset, 4000]}
      rotation={[0, 0, 0]}
      zoom={1}
      scale={[1, 1, 1]}
      up={[0, 0, 1]} />
    <MoistureSurface
      geometry={props.geometry}
      config={props.config}
      color={"black"}
      radius={10}
      sensorReadings={props.sensorReadings}
      showMoistureReadings={props.showMoistureReadings}
      position={[
        props.config.bedXOffset,
        props.config.bedYOffset,
        zZero(props.config),
      ]}
      readingZOverride={2000} />
  </RenderTexture>;
};

export interface MoistureSurfaceProps {
  geometry: BufferGeometry;
  position: [number, number, number];
  sensorReadings: TaggedSensorReading[];
  config: Config;
  color: string;
  radius: number;
  readingZOverride?: number;
  showMoistureReadings: boolean;
}

export const MoistureSurface = (props: MoistureSurfaceProps) =>
  <Group position={props.position}>
    {props.showMoistureReadings &&
      <MoistureReadings
        config={props.config}
        color={props.color}
        radius={props.radius}
        readingZOverride={props.readingZOverride}
        readings={props.sensorReadings} />}
    <Mesh geometry={props.geometry} position={[0, 0, -zZero(props.config)]}>
      <HeightMaterial
        min={0}
        max={1000}
        lowColor={new Color(0.5, 0.5, 0.5)}
        highColor={new Color(0, 0, 1)} />
    </Mesh>
  </Group>;

export interface MoistureReadingsProps {
  readings: TaggedSensorReading[];
  config: Config;
  color: string;
  radius: number;
  applyOffset?: boolean;
  readingZOverride?: number;
}

export const MoistureReadings = (props: MoistureReadingsProps) => {
  const { bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset } = props.config;
  return <Group position={props.applyOffset
    ? [
      threeSpace(0, bedLengthOuter) + bedXOffset,
      threeSpace(0, bedWidthOuter) + bedYOffset,
      zZero(props.config),
    ]
    : [0, 0, 0]}>
    {props.readings.map(reading =>
      <Sphere
        args={[props.radius, 16, 16]}
        position={[
          reading.body.x || 0,
          reading.body.y || 0,
          props.readingZOverride ?? (reading.body.z || 0),
        ]}>
        <MeshBasicMaterial color={props.color} />
      </Sphere>)}
  </Group>;
};
