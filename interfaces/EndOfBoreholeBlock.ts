import { createDefaultDayWorkStatus, DayWorkStatus } from '@/constants/DayWorkStatus';
import { END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE, endOfBoreholeOtherInstallationsType } from '@/constants/endOfBorehole';
import { BaseBlock, END_OF_BOREHOLE_BLOCK_TYPE_ID } from '@/interfaces/Block';

export interface EndOfBoreholeBlock {
  blockTypeId: typeof END_OF_BOREHOLE_BLOCK_TYPE_ID;
  dayWorkStatus: DayWorkStatus;
  topDepthInMetres: number;
  baseDepthInMetres: number;
  description: string;
  otherInstallations: endOfBoreholeOtherInstallationsType;
  customInstallations: string;
  installationDepthInMetres: number | null;
  remarks: string;
}

export function createDefaultEndOfBoreholeBlock(): BaseBlock & EndOfBoreholeBlock {
  return {
    id: '',
    boreholeId: '',
    blockTypeId: END_OF_BOREHOLE_BLOCK_TYPE_ID,
    dayWorkStatus: createDefaultDayWorkStatus(),
    topDepthInMetres: -1,
    baseDepthInMetres: -1,
    description: '',
    otherInstallations: END_OF_BOREHOLE_OTHER_INSTALLATIONS_NONE,
    customInstallations: '',
    installationDepthInMetres: null,
    remarks: '',
    createdAt: new Date(),
    updatedAt: null,
  };
}