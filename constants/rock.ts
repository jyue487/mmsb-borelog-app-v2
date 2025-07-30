export const SEDIMENTARY_ROCK_TYPE_LIST = [
    'CLAYSTONE',
    'MUDSTONE',
    'SILTSTONE',
    'SANDSTONE',
    'SEDIMENTARY BRECCIA',
    'CONGLOMERATE',
    'LIMESTONE',
    'SHALE',
] as const;
export const IGNEOUS_AND_METAMORPHIC_ROCK_TYPE_LIST = [
    'GRANITE',
    'SCHIST',
    'PHYLLITE',
    'SLATE',
    'GNEISS',
] as const;

export const ROCK_TYPE_LIST = [
    ...SEDIMENTARY_ROCK_TYPE_LIST,
    ...IGNEOUS_AND_METAMORPHIC_ROCK_TYPE_LIST,
    'OTHERS'
] as const;
export type RockType = typeof ROCK_TYPE_LIST[number];



export const OTHER_PROPERTIES_LIST_FOR_CLAYSTONE = [
    'with Granite Intrusion',
    'with Quartzite',
    'interbedded with Sandstone',
    'interbedded with Mudstone',
    'interbedded with Siltstone',
    'interbedded with Limestone',
    'interbedded with Shale',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_MUDSTONE = [
    'with Granite Intrusion',
    'with Quartzite',
    'interbedded with Sandstone',
    'interbedded with Claystone',
    'interbedded with Siltstone',
    'interbedded with Limestone',
    'interbedded with Shale',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_SILTSTONE = [
    'with Granite Intrusion',
    'with Quartzite',
    'interbedded with Sandstone',
    'interbedded with Claystone',
    'interbedded with Mudstone',
    'interbedded with Limestone',
    'interbedded with Shale',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_SANDSTONE = [
    'with Granite Intrusion',
    'with Quartzite',
    'interbedded with Claystone',
    'interbedded with Mudstone',
    'interbedded with Siltstone',
    'interbedded with Limestone',
    'interbedded with Shale',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_SEDIMENTARY_BRECCIA = [
    'with Granite Intrusion',
    'with Quartzite',
    'interbedded with Sandstone',
    'interbedded with Claystone',
    'interbedded with Mudstone',
    'interbedded with Siltstone',
    'interbedded with Limestone',
    'interbedded with Shale',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_CONGLOMERATE = [
    'with Granite Intrusion',
    'with Quartzite',
    'interbedded with Sandstone',
    'interbedded with Claystone',
    'interbedded with Mudstone',
    'interbedded with Siltstone',
    'interbedded with Limestone',
    'interbedded with Shale',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_LIMESTONE = [
    'with Granite Intrusion',
    'with Quartzite',
    'interbedded with Sandstone',
    'interbedded with Claystone',
    'interbedded with Mudstone',
    'interbedded with Siltstone',
    'interbedded with Shale',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_SHALE = [
    'with Granite Intrusion',
    'with Quartzite',
    'interbedded with Sandstone',
    'interbedded with Claystone',
    'interbedded with Mudstone',
    'interbedded with Siltstone',
    'interbedded with Shale',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_GRANITE = [
    'with Quartzite',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_SCHIST = [
    'with Granite Intrusion',
    'with Quartzite',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_PHYLLITE = [
    'with Granite Intrusion',
    'with Quartzite',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_SLATE = [
    'with Granite Intrusion',
    'with Quartzite',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_GNEISS = [
    'with Granite Intrusion',
    'with Quartzite',
] as const;
export const OTHER_PROPERTIES_LIST_FOR_OTHERS = [
    'with Quartzite',
] as const;
export const OTHER_PROPERTIES_LIST_BASED_ON_ROCK_TYPE: Record<
    RockType,
    typeof OTHER_PROPERTIES_LIST_FOR_CLAYSTONE
    | typeof OTHER_PROPERTIES_LIST_FOR_MUDSTONE
    | typeof OTHER_PROPERTIES_LIST_FOR_SILTSTONE
    | typeof OTHER_PROPERTIES_LIST_FOR_SANDSTONE
    | typeof OTHER_PROPERTIES_LIST_FOR_SEDIMENTARY_BRECCIA
    | typeof OTHER_PROPERTIES_LIST_FOR_CONGLOMERATE
    | typeof OTHER_PROPERTIES_LIST_FOR_LIMESTONE
    | typeof OTHER_PROPERTIES_LIST_FOR_SHALE
    | typeof OTHER_PROPERTIES_LIST_FOR_GRANITE
    | typeof OTHER_PROPERTIES_LIST_FOR_SCHIST
    | typeof OTHER_PROPERTIES_LIST_FOR_PHYLLITE
    | typeof OTHER_PROPERTIES_LIST_FOR_SLATE
    | typeof OTHER_PROPERTIES_LIST_FOR_GNEISS
    | typeof OTHER_PROPERTIES_LIST_FOR_OTHERS
> = {
    'CLAYSTONE': OTHER_PROPERTIES_LIST_FOR_CLAYSTONE,
    'MUDSTONE': OTHER_PROPERTIES_LIST_FOR_MUDSTONE,
    'SILTSTONE': OTHER_PROPERTIES_LIST_FOR_SILTSTONE,
    'SANDSTONE': OTHER_PROPERTIES_LIST_FOR_SANDSTONE,
    'SEDIMENTARY BRECCIA': OTHER_PROPERTIES_LIST_FOR_SEDIMENTARY_BRECCIA,
    'CONGLOMERATE': OTHER_PROPERTIES_LIST_FOR_CONGLOMERATE,
    'LIMESTONE': OTHER_PROPERTIES_LIST_FOR_LIMESTONE,
    'SHALE': OTHER_PROPERTIES_LIST_FOR_SHALE,
    'GRANITE': OTHER_PROPERTIES_LIST_FOR_GRANITE,
    'SCHIST': OTHER_PROPERTIES_LIST_FOR_SCHIST,
    'PHYLLITE': OTHER_PROPERTIES_LIST_FOR_PHYLLITE,
    'SLATE': OTHER_PROPERTIES_LIST_FOR_SLATE,
    'GNEISS': OTHER_PROPERTIES_LIST_FOR_GNEISS,
    'OTHERS': OTHER_PROPERTIES_LIST_FOR_OTHERS,
} as const;