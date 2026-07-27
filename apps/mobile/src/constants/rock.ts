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

export const VOID_CODE = 999 as const;

export const CLAYSTONE_ROCK_CODE = 801 as const;
export const MUDSTONE_ROCK_CODE = 801 as const;
export const SILTSTONE_ROCK_CODE = 802 as const;
export const SANDSTONE_ROCK_CODE = 803 as const;
export const SEDIMENTARY_BRECCIA_ROCK_CODE = 807 as const;
export const CONGLOMERATE_ROCK_CODE = 808 as const;
export const LIMESTONE_ROCK_CODE = 804 as const;
export const SHALE_ROCK_CODE = 817 as const;
export const GRANITE_ROCK_CODE = 840 as const;
export const SCHIST_ROCK_CODE = 873 as const;
export const PHYLLITE_ROCK_CODE = 872 as const;
export const SLATE_ROCK_CODE = 872 as const;
export const GNEISS_ROCK_CODE = 814;
export const OTHERS_ROCK_CODE = VOID_CODE;

export const ROCK_TYPE_CODE_MAP: Record<RockType, number> = {
    "CLAYSTONE": CLAYSTONE_ROCK_CODE,
    "MUDSTONE": MUDSTONE_ROCK_CODE,
    "SILTSTONE": SILTSTONE_ROCK_CODE,
    "SANDSTONE": SANDSTONE_ROCK_CODE,
    "SEDIMENTARY BRECCIA": SEDIMENTARY_BRECCIA_ROCK_CODE,
    "CONGLOMERATE": CONGLOMERATE_ROCK_CODE,
    "LIMESTONE": LIMESTONE_ROCK_CODE,
    "SHALE": SHALE_ROCK_CODE,
    "GRANITE": GRANITE_ROCK_CODE,
    "SCHIST": SCHIST_ROCK_CODE,
    "PHYLLITE": PHYLLITE_ROCK_CODE,
    "SLATE": SLATE_ROCK_CODE,
    "GNEISS": GNEISS_ROCK_CODE,
    "OTHERS": OTHERS_ROCK_CODE,
};
