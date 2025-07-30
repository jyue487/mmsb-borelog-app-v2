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
