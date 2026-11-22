import { TransformNode, Vector3 } from '@babylonjs/core';
import { BuildingFactory, BuildingSpec } from '@buildings/BuildingFactory';
import { RoadNetwork } from '@roads/RoadNetwork';
import { VegetationSystem } from '@vegetation/VegetationSystem';

export function buildBirbityDistrict(
  root: TransformNode,
  roads: RoadNetwork,
  buildings: BuildingFactory,
  vegetation: VegetationSystem
): void {
  roads.buildSegment({
    id: 'birbity_spawn_spur',
    start: new Vector3(-24, 0, 5),
    end: new Vector3(26, 0, -6),
    width: 4.8,
    surface: 'concrete',
    hasDrains: true,
    hasPoles: true,
  });

  roads.buildSegment({
    id: 'birbity_ns_lane',
    start: new Vector3(26, 0, -24),
    end: new Vector3(26, 0, 96),
    width: 5.2,
    surface: 'asphalt',
    hasDrains: true,
    hasPoles: true,
  });

  roads.buildSegment({
    id: 'birbity_mid_east_branch',
    start: new Vector3(26, 0, 34),
    end: new Vector3(110, 0, 16),
    width: 4.2,
    surface: 'concrete',
    hasDrains: false,
    hasPoles: true,
  });

  roads.buildSegment({
    id: 'birbity_east_unpaved_track',
    start: new Vector3(68, 0, -14),
    end: new Vector3(68, 0, 74),
    width: 3.4,
    surface: 'unpaved',
  });

  roads.buildSegment({
    id: 'birbity_north_collector',
    start: new Vector3(-55, 0, 114),
    end: new Vector3(420, 0, 12),
    width: 6.4,
    surface: 'asphalt',
    hasDrains: true,
    hasPoles: true,
  });

  roads.buildSegment({
    id: 'birbity_west_north_lane',
    start: new Vector3(12, 0, 99),
    end: new Vector3(12, 0, 175),
    width: 4.4,
    surface: 'concrete',
  });

  roads.buildSegment({
    id: 'mg_road_north_hospital_link',
    start: new Vector3(420, 0, 12),
    end: new Vector3(640, 0, 190),
    width: 7.5,
    surface: 'asphalt',
    hasDrains: true,
    hasPoles: true,
  });

  roads.buildSegment({
    id: 'mg_road_south_market_link',
    start: new Vector3(420, 0, 12),
    end: new Vector3(540, 0, -560),
    width: 8.0,
    surface: 'asphalt',
    hasDrains: true,
    hasPoles: true,
  });

  roads.buildRailwayCorridor(new Vector3(-240, 0, 26), new Vector3(660, 0, -168));

  const residentialPlots: BuildingSpec[] = [
    { id: 'birbity_h01', position: new Vector3(-10, 0, 14), width: 9.5, depth: 7.2, floors: 1, rotationY: 0.21, roofStyle: 'pitched-tin', wallTone: 'cream', roofTone: 'silver', compoundWall: true },
    { id: 'birbity_h02', position: new Vector3(8, 0, 11), width: 10.2, depth: 8.0, floors: 2, rotationY: 0.21, roofStyle: 'flat-rcc', wallTone: 'offwhite', compoundWall: true },
    { id: 'birbity_h03', position: new Vector3(13, 0, 32), width: 9.0, depth: 7.5, floors: 1, rotationY: Math.PI * 0.5, roofStyle: 'pitched-tin', wallTone: 'ochre', roofTone: 'red', compoundWall: true },
    { id: 'birbity_h04', position: new Vector3(12, 0, 50), width: 11.0, depth: 8.2, floors: 2, rotationY: Math.PI * 0.5, roofStyle: 'flat-rcc', wallTone: 'mint', compoundWall: true },
    { id: 'birbity_h05', position: new Vector3(13, 0, 70), width: 8.8, depth: 7.0, floors: 1, rotationY: Math.PI * 0.5, roofStyle: 'pitched-tin', wallTone: 'terracotta', roofTone: 'blue', compoundWall: true },
    { id: 'birbity_h06', position: new Vector3(41, 0, 8), width: 10.5, depth: 7.8, floors: 2, rotationY: -Math.PI * 0.5, roofStyle: 'flat-rcc', wallTone: 'cream', compoundWall: true },
    { id: 'birbity_h07', position: new Vector3(42, 0, 48), width: 9.2, depth: 7.2, floors: 1, rotationY: -Math.PI * 0.5, roofStyle: 'pitched-tin', wallTone: 'offwhite', roofTone: 'silver', compoundWall: true },
    { id: 'birbity_h08', position: new Vector3(41, 0, 68), width: 10.8, depth: 8.4, floors: 2, rotationY: -Math.PI * 0.5, roofStyle: 'flat-rcc', wallTone: 'ochre', compoundWall: true },
    { id: 'birbity_h09', position: new Vector3(58, 0, 104), width: 11.5, depth: 8.0, floors: 2, rotationY: 0.21, roofStyle: 'flat-rcc', wallTone: 'offwhite', compoundWall: true },
    { id: 'birbity_h10', position: new Vector3(84, 0, 98), width: 9.6, depth: 7.4, floors: 1, rotationY: 0.21, roofStyle: 'pitched-tin', wallTone: 'cream', roofTone: 'red', compoundWall: true },
    { id: 'birbity_h11', position: new Vector3(-20, 0, 122), width: 10.0, depth: 7.6, floors: 1, rotationY: 0.21, roofStyle: 'pitched-tin', wallTone: 'mint', roofTone: 'silver', compoundWall: true },
    { id: 'birbity_h12', position: new Vector3(86, 0, 34), width: 9.4, depth: 7.2, floors: 1, rotationY: 0.21, roofStyle: 'pitched-tin', wallTone: 'terracotta', roofTone: 'silver', compoundWall: true },
  ];

  for (const spec of residentialPlots) {
    buildings.createBuilding(spec, root);
  }

  vegetation.placeStreamChannel(
    [
      new Vector3(-92, 0, 180),
      new Vector3(-86, 0, 95),
      new Vector3(-98, 0, 10),
      new Vector3(-84, 0, -90),
      new Vector3(-96, 0, -210),
    ],
    9.0
  );

  vegetation.placeTeaGardenPatch(new Vector3(-135, 0, 65), 14, 2.5, 0.12);
  vegetation.placeTeaGardenPatch(new Vector3(-140, 0, -45), 14, 2.5, 0.12);
  vegetation.placeTeaGardenPatch(new Vector3(-10, 0, -88), 18, 2.5, -0.2);

  const treeCoords: Array<[number, number, number]> = [
    [-28, 16, 1.15],
    [-18, -10, 1.0],
    [4, 24, 1.2],
    [35, -14, 1.1],
    [36, 24, 0.95],
    [54, 40, 1.25],
    [56, 78, 1.1],
    [-38, 84, 1.3],
    [-52, 42, 1.2],
    [115, 45, 1.15],
    [140, 72, 1.3],
    [185, 58, 1.2],
  ];
  for (const [tx, tz, sc] of treeCoords) {
    vegetation.placeShadeTree(new Vector3(tx, 0, tz), sc);
  }
}
