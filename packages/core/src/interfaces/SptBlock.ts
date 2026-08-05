import { createDefaultDayWorkStatus, DayWorkStatus } from '../constants/DayWorkStatus';
import { BaseBlock, SPT_BLOCK_TYPE_ID } from './Block';
import { ColourProperties, createDefaultColourProperties } from './ColourProperties';
import { createDefaultSoilProperties, SoilProperties } from './SoilProperties';

export interface SptBlock {
	blockTypeId: typeof SPT_BLOCK_TYPE_ID;
	sptIndex: number;
	disturbedSampleIndex: number;
	dayWorkStatus: DayWorkStatus;
	topDepthInMetres: number;
	baseDepthInMetres: number;
	description: string;
	seatingIncBlows1: number;
	seatingIncPen1: number;
	seatingIncBlows2: number | null;
	seatingIncPen2: number | null;
	mainIncBlows1: number;
	mainIncPen1: number;
	mainIncBlows2: number | null;
	mainIncPen2: number | null;
	mainIncBlows3: number | null;
	mainIncPen3: number | null;
	mainIncBlows4: number | null;
	mainIncPen4: number | null;
	sptNValue: number;
	totalMainPenetrationInMillimetres: number;
	recoveryInPercentage: number;
	recoveryLengthInMillimetres: number;
	colourProperties: ColourProperties;
	soilProperties: SoilProperties;
	isSeatingIncBlows1Active: boolean;
	isSeatingIncBlows2Active: boolean;
	isMainIncBlows1Active: boolean;
	isMainIncBlows2Active: boolean;
	isMainIncBlows3Active: boolean;
	isMainIncBlows4Active: boolean;
	isSeatingIncPen1Active: boolean;
	isSeatingIncPen2Active: boolean;
	isMainIncPen1Active: boolean;
	isMainIncPen2Active: boolean;
	isMainIncPen3Active: boolean;
	isMainIncPen4Active: boolean;
}

export function createDefaultSptBlock(): BaseBlock & SptBlock {
	return {
		id: '',
		boreholeId: '',
		blockTypeId: SPT_BLOCK_TYPE_ID,
		sptIndex: -1,
		disturbedSampleIndex: -1,
		dayWorkStatus: createDefaultDayWorkStatus(),
		topDepthInMetres: -1,
		baseDepthInMetres: -1,
		description: '',
		seatingIncBlows1: -1,
		seatingIncBlows2: null,
		seatingIncPen1: -1,
		seatingIncPen2: null,
		mainIncBlows1: -1,
		mainIncBlows2: null,
		mainIncBlows3: null,
		mainIncBlows4: null,
		mainIncPen1: -1,
		mainIncPen2: null,
		mainIncPen3: null,
		mainIncPen4: null,
		isSeatingIncBlows1Active: true,
		isSeatingIncBlows2Active: false,
		isMainIncBlows1Active: false,
		isMainIncBlows2Active: false,
		isMainIncBlows3Active: false,
		isMainIncBlows4Active: false,
		isSeatingIncPen1Active: false,
		isSeatingIncPen2Active: false,
		isMainIncPen1Active: false,
		isMainIncPen2Active: false,
		isMainIncPen3Active: false,
		isMainIncPen4Active: false,
		sptNValue: -1,
		totalMainPenetrationInMillimetres: -1,
		recoveryInPercentage: -1,
		recoveryLengthInMillimetres: -1,
		colourProperties: createDefaultColourProperties(),
		soilProperties: createDefaultSoilProperties(),
		createdAt: new Date(),
		updatedAt: null,
	};
}

