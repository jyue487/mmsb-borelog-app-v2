export * from './interfaces/Project';
export * from './interfaces/Borehole';
export * from './interfaces/Member';

// The block domain. `Block` is an 18-variant union discriminated on `blockTypeId`,
// so consumers need every variant's interface as well as the `*_BLOCK_TYPE_ID`
// constants and `BLOCK_TYPE_ID_LIST` that drive the exhaustive `Record` tables.
export * from './interfaces/Block';
export * from './interfaces/AsphaltBlock';
export * from './interfaces/CavityBlock';
export * from './interfaces/ConcreteSlabBlock';
export * from './interfaces/ConstantHeadPermeabilityTestBlock';
export * from './interfaces/CoringBlock';
export * from './interfaces/CustomBlock';
export * from './interfaces/EndOfBoreholeBlock';
export * from './interfaces/FallingHeadPermeabilityTestBlock';
export * from './interfaces/HaBlock';
export * from './interfaces/LugeonTestBlock';
export * from './interfaces/MzBlock';
export * from './interfaces/PressuremeterTestBlock';
export * from './interfaces/PsBlock';
export * from './interfaces/RisingHeadPermeabilityTestBlock';
export * from './interfaces/SptBlock';
export * from './interfaces/UdBlock';
export * from './interfaces/VaneShearTestBlock';
export * from './interfaces/WashBoringBlock';

export * from './interfaces/ColourProperties';
export * from './interfaces/RockProperties';
export * from './interfaces/SoilProperties';

export * from './constants/DayWorkStatus';
export * from './constants/endOfBorehole';
export * from './constants/symbol';
export * from './constants/waterLevel';
