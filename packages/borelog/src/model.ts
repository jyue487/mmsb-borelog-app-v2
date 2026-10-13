/**
 * What the Python program parsed out of the workbook, field for field (`models/*.py`).
 * Strings are already formatted for printing; depths are metres.
 */

export interface ProjectInformation {
	name: string;
	id: string;
	client: string;
	engineer: string;
	location: string;
	contractor: string;
	date: string;
	remarks: string;
}

export interface BoreholeInformation {
	projId: string;
	id: string;
	type: string;
	eastingInMetres: string;
	northingInMetres: string;
	finalDepthInMetres: number;
	glInMetres: string;
	startDate: string;
	endDate: string;
	backfillDate: string;
	logger: string;
	location: string;
	generalRemarks: string;
}

export interface ProgressInformation {
	projId: string;
	bhId: string;
	dateOfProgress: string;
	timeOfProgressHhmm: string;
	holeDepthInMetres: number;
	casingDepthInMetres: number | null;
	waterLevelInMetres: string;
}

export interface SptInformation {
	projId: string;
	bhId: string;
	testDepthInMetres: number;
	nValue: number;
	reportedResult: string;
}

export interface GeologyInformation {
	projId: string;
	bhId: string;
	geologyCode: string;
	legendCode: string;
	topDepthInMetres: number;
	baseDepthInMetres: number;
	stratumDescription: string;
	stratumReference: string;
}

export interface SampleInformation {
	projId: string;
	bhId: string;
	topDepthInMetres: number;
	baseDepthInMetres: number;
	sampleType: string;
	sampleReference: string;
	sampleDiameter: string;
	sampleRecovery: string;
}

export interface CoreInformation {
	projId: string;
	bhId: string;
	topDepthInMetres: number;
	baseDepthInMetres: number;
	tcr: string;
	scr: string;
	rqd: string;
	diameter: string;
}

/** Everything one borelog is drawn from. */
export interface BorelogData {
	project: ProjectInformation;
	borehole: BoreholeInformation;
	progress: ProgressInformation[];
	spt: SptInformation[];
	geology: GeologyInformation[];
	samples: SampleInformation[];
	cores: CoreInformation[];
}
