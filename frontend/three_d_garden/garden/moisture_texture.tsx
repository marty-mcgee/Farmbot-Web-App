import React from "react";
import { soilSurfaceExtents } from "../triangles";
import { Config } from "../config";
import {
  Instance, Instances, OrthographicCamera, RenderTexture, Sphere,
} from "@react-three/drei";
import { BoxGeometry, Group, MeshBasicMaterial } from "../components";
import { TaggedSensor, TaggedSensorReading } from "farmbot";
import { threeSpace, zZero } from "../helpers";
import {
  generateData, getInterpolationData,
} from "../../farm_designer/map/layers/points/interpolation_map";
import {
  filterMoistureReadings, getMoistureColor,
} from "../../farm_designer/map/layers/sensor_readings/sensor_readings_layer";

export interface MoistureTextureProps {
  config: Config;
  sensors: TaggedSensor[];
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
      config={props.config}
      color={"black"}
      radius={10}
      sensors={props.sensors}
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
  position: [number, number, number];
  sensors: TaggedSensor[];
  sensorReadings: TaggedSensorReading[];
  config: Config;
  color: string;
  radius: number;
  readingZOverride?: number;
  showMoistureReadings: boolean;
}

export const MoistureSurface = (props: MoistureSurfaceProps) => {
  const { readings: moistureReadings } =
    filterMoistureReadings(props.sensorReadings, props.sensors);
  const options = {
    stepSize: props.config.interpolationStepSize,
    useNearest: props.config.interpolationUseNearest,
    power: props.config.interpolationPower,
  };
  generateData({
    kind: "SensorReading",
    points: moistureReadings,
    gridSize: { x: props.config.bedLengthOuter, y: props.config.bedWidthOuter },
    getColor: getMoistureColor,
    options,
  });
  const data = getInterpolationData("SensorReading");
  return <Group position={props.position}>
    {props.showMoistureReadings &&
      <MoistureReadings
        config={props.config}
        color={props.color}
        radius={props.radius}
        readingZOverride={props.readingZOverride}
        readings={props.sensorReadings} />}
    <Instances limit={data.length}>
      <BoxGeometry args={[options.stepSize, options.stepSize, options.stepSize]} />
      <MeshBasicMaterial />
      {data.map(p => {
        const { x, y, z } = p;
        return <Instance
          key={`${x}-${y}`}
          position={[x, y, z / 2]}
          color={getMoistureColor(z)} />;
      })}
    </Instances>
  </Group>;
};

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
