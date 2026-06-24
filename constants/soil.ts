export const DOMINANT_SOIL_TYPE_LIST = ['CLAY', 'SILT', 'PEAT', 'SAND', 'GRAVEL'] as const;
export type DominantSoilType = typeof DOMINANT_SOIL_TYPE_LIST[number];

export const SECONDARY_SOIL_TYPE_FOR_CLAY = ['slightly sandy', 'sandy', 'slightly gravelly', 'gravelly', 'peaty organic', 'organic'] as const;
export const SECONDARY_SOIL_TYPE_FOR_SILT = ['slightly sandy', 'sandy', 'slightly gravelly', 'gravelly', 'peaty organic', 'organic'] as const;
export const SECONDARY_SOIL_TYPE_FOR_PEAT = [] as const;
export const SECONDARY_SOIL_TYPE_FOR_SAND = ['fine', 'coarse', 'slightly gravelly', 'gravelly', 'slightly silty', 'silty', 'slightly clayey', 'clayey', 'peaty organic', 'organic'] as const;
export const SECONDARY_SOIL_TYPE_FOR_GRAVEL = ['slightly sandy', 'sandy', 'slightly silty', 'silty', 'slightly clayey', 'clayey'] as const;
export type SecondarySoilType = (
    typeof SECONDARY_SOIL_TYPE_FOR_CLAY[number]
    | typeof SECONDARY_SOIL_TYPE_FOR_SILT[number]
    | typeof SECONDARY_SOIL_TYPE_FOR_PEAT[number]
    | typeof SECONDARY_SOIL_TYPE_FOR_SAND[number]
    | typeof SECONDARY_SOIL_TYPE_FOR_GRAVEL[number]
);
export const SECONDARY_SOIL_TYPE_LIST_BASED_ON_DOMINANT_SOIL_TYPE: Record<
    DominantSoilType, 
    typeof SECONDARY_SOIL_TYPE_FOR_CLAY
    | typeof SECONDARY_SOIL_TYPE_FOR_SILT
    | typeof SECONDARY_SOIL_TYPE_FOR_PEAT 
    | typeof SECONDARY_SOIL_TYPE_FOR_SAND 
    | typeof SECONDARY_SOIL_TYPE_FOR_GRAVEL
> = {
    'CLAY': SECONDARY_SOIL_TYPE_FOR_CLAY,
    'SILT': SECONDARY_SOIL_TYPE_FOR_SILT, 
    'PEAT': SECONDARY_SOIL_TYPE_FOR_PEAT,
    'SAND': SECONDARY_SOIL_TYPE_FOR_SAND, 
    'GRAVEL': SECONDARY_SOIL_TYPE_FOR_GRAVEL,
} as const;

export const CUSTOM_OTHER_PROPERTIES_FOR_SOIL = 'custom' as const;

export const OTHER_PROPERTIES_LIST_FOR_CLAY = [
    'with some gravel',
    'with pockets of silt',
    'with pockets of sand',
    'with traces of discrete organic matter',
    'with traces of decomposed wood',
    'with traces of rootholes',
    'with traces of shells',
    CUSTOM_OTHER_PROPERTIES_FOR_SOIL,
] as const;
export const OTHER_PROPERTIES_LIST_FOR_SILT = [
    'with some gravel',
    'with pockets of clay',
    'with pockets of sand',
    'with traces of discrete organic matter',
    'with traces of decomposed wood',
    'with traces of rootholes',
    'with traces of shells',
    CUSTOM_OTHER_PROPERTIES_FOR_SOIL,
] as const;
export const OTHER_PROPERTIES_LIST_FOR_PEAT = [
    'with some gravel',
    'with pockets of clay',
    'with pockets of silt',
    'with pockets of sand',
    'with traces of discrete organic matter',
    'with traces of decomposed wood',
    'with traces of rootholes',
    'with traces of shells',
    CUSTOM_OTHER_PROPERTIES_FOR_SOIL,
] as const;
export const OTHER_PROPERTIES_LIST_FOR_SAND = [
    'with some gravel',
    'with pockets of clay',
    'with pockets of silt',
    'with traces of discrete organic matter',
    'with traces of decomposed wood',
    'with traces of rootholes',
    'with traces of shells',
    CUSTOM_OTHER_PROPERTIES_FOR_SOIL,
] as const;
export const OTHER_PROPERTIES_LIST_FOR_GRAVEL = [
    'with pockets of clay',
    'with pockets of silt',
    'with pockets of sand',
    'with traces of discrete organic matter',
    'with traces of decomposed wood',
    'with traces of rootholes',
    'with traces of shells',
    CUSTOM_OTHER_PROPERTIES_FOR_SOIL,
] as const;
export const OTHER_PROPERTIES_LIST_BASED_ON_DOMINANT_SOIL_TYPE: Record<
    DominantSoilType,
    typeof OTHER_PROPERTIES_LIST_FOR_CLAY
    | typeof OTHER_PROPERTIES_LIST_FOR_SILT
    | typeof OTHER_PROPERTIES_LIST_FOR_PEAT
    | typeof OTHER_PROPERTIES_LIST_FOR_SAND
    | typeof OTHER_PROPERTIES_LIST_FOR_GRAVEL
> = {
    'CLAY': OTHER_PROPERTIES_LIST_FOR_CLAY,
    'SILT': OTHER_PROPERTIES_LIST_FOR_SILT,
    'PEAT': OTHER_PROPERTIES_LIST_FOR_PEAT,
    'SAND': OTHER_PROPERTIES_LIST_FOR_SAND,
    'GRAVEL': OTHER_PROPERTIES_LIST_FOR_GRAVEL,
} as const;

export type SecondarySoilTypeMap = {
  'CLAY': typeof SECONDARY_SOIL_TYPE_FOR_CLAY[number];
  'SILT': typeof SECONDARY_SOIL_TYPE_FOR_SILT[number];
  'PEAT': typeof SECONDARY_SOIL_TYPE_FOR_PEAT[number];
  'SAND': typeof SECONDARY_SOIL_TYPE_FOR_SAND[number];
  'GRAVEL': typeof SECONDARY_SOIL_TYPE_FOR_GRAVEL[number];
};

export const CLAY_SOIL_CODE = 201 as const;
export const SILT_SOIL_CODE = 301 as const;
export const PEAT_SOIL_CODE = 601 as const;
export const SAND_SOIL_CODE = 401 as const;
export const GRAVEL_SOIL_CODE = 501 as const;

export const SOIL_TYPE_CODE_MAP_SINGLE_ENTRY: Record<DominantSoilType, number> = {
    'CLAY': CLAY_SOIL_CODE,
    'SILT': SILT_SOIL_CODE,
    'PEAT': PEAT_SOIL_CODE,
    'SAND': SAND_SOIL_CODE,
    'GRAVEL': GRAVEL_SOIL_CODE,
} as const;

export const SOIL_TYPE_CODE_MAP_DOUBLE_ENTRY = {
  'CLAY': {
    'slightly sandy': 203,
    'sandy': 203,
    'slightly gravelly': 204,
    'gravelly': 204,
    'peaty organic': 201,
    'organic': 201,
  },

  'SILT': {
    'slightly sandy': 303,
    'sandy': 303,
    'slightly gravelly': 304,
    'gravelly': 304,
    'peaty organic': 301,
    'organic': 301,
  },

  'PEAT': {},

  'SAND': {
    'fine': 401,
    'coarse': 401,
    'slightly gravelly': 404,
    'gravelly': 404,
    'slightly silty': 403,
    'silty': 403,
    'slightly clayey': 402,
    'clayey': 402,
    'peaty organic':401,
    'organic': 401,
  },

  'GRAVEL': {
    'slightly sandy': 504,
    'sandy': 504,
    'slightly silty': 503,
    'silty': 503,
    'slightly clayey': 502,
    'clayey': 502,
  },
} satisfies {
  [D in DominantSoilType]: Record<SecondarySoilTypeMap[D], number> | undefined;
};