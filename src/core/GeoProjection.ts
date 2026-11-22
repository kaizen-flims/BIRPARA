import { Vector3 } from '@babylonjs/core';

export interface GeoCoord {
  readonly lat: number;
  readonly lng: number;
}

/**
 * Locked World Origin (0, 0, 0) at Birbity, Birpara, West Bengal, India.
 * Scale: 1 world unit = 1.0 real-world meter.
 * Axes: +X = East, +Z = North, +Y = Up.
 */
export const BIRBITY_ORIGIN: GeoCoord = {
  lat: 26.717306,
  lng: 89.132437,
};

const METERS_PER_DEG_LAT = 111_132.92;
const ORIGIN_LAT_RAD = (BIRBITY_ORIGIN.lat * Math.PI) / 180;
const METERS_PER_DEG_LNG = 111_412.84 * Math.cos(ORIGIN_LAT_RAD);

export function latLngToWorld(lat: number, lng: number, elevationMeters = 0): Vector3 {
  const x = (lng - BIRBITY_ORIGIN.lng) * METERS_PER_DEG_LNG;
  const z = (lat - BIRBITY_ORIGIN.lat) * METERS_PER_DEG_LAT;
  return new Vector3(x, elevationMeters, z);
}

export function worldToLatLng(x: number, z: number): GeoCoord {
  return {
    lat: BIRBITY_ORIGIN.lat + z / METERS_PER_DEG_LAT,
    lng: BIRBITY_ORIGIN.lng + x / METERS_PER_DEG_LNG,
  };
}
