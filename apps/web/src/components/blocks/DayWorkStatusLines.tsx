import {
  DAY_CONTINUE_WORK_TYPE,
  DAY_END_WORK_TYPE,
  DAY_START_WORK_TYPE,
  type DayWorkStatus,
  type WaterLevelInMetres,
} from '@mmsb/core';

import { getDateTime } from '../../utils/datetime';

// Port of apps/mobile/src/components/dayWorkStatus/*. A block records the shift
// boundary it sits on, so a "day start" or "day end" block prints the timestamp,
// water level and casing depth for that boundary. Continue-work blocks print
// nothing, which is the common case.

function formatWaterLevel(waterLevel: WaterLevelInMetres): string {
  // The field is `string | number | null`: a number is a depth, a string is one of
  // the NIL / FULL sentinels and is printed as-is.
  return typeof waterLevel === 'number' ? `${waterLevel}m` : String(waterLevel);
}

type BoundaryLinesProps = {
  label: string;
  date: Date | null;
  time: Date | null;
  waterLevel: WaterLevelInMetres;
  casingDepthInMetres: number | null;
};

function BoundaryLines({
  label,
  date,
  time,
  waterLevel,
  casingDepthInMetres,
}: BoundaryLinesProps) {
  return (
    <div className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
      {date && time && (
        <p>
          {label}: {getDateTime(date, time)}
        </p>
      )}

      {waterLevel !== null && (
        <p>
          {label} Water Level: {formatWaterLevel(waterLevel)}
        </p>
      )}

      {casingDepthInMetres !== null && (
        <p>
          {label} Casing Depth: {casingDepthInMetres}m
        </p>
      )}
    </div>
  );
}

type DayWorkStatusLinesProps = {
  dayWorkStatus: DayWorkStatus;
};

export default function DayWorkStatusLines({
  dayWorkStatus,
}: DayWorkStatusLinesProps) {
  if (dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) {
    return null;
  }

  const showsStart = dayWorkStatus.dayWorkStatusType !== DAY_END_WORK_TYPE;
  const showsEnd = dayWorkStatus.dayWorkStatusType !== DAY_START_WORK_TYPE;

  return (
    <>
      {showsStart && (
        <BoundaryLines
          label={DAY_START_WORK_TYPE}
          date={dayWorkStatus.startDate}
          time={dayWorkStatus.startTime}
          waterLevel={dayWorkStatus.startWaterLevelInMetres}
          casingDepthInMetres={dayWorkStatus.startCasingDepthInMetres}
        />
      )}

      {showsEnd && (
        <BoundaryLines
          label={DAY_END_WORK_TYPE}
          date={dayWorkStatus.endDate}
          time={dayWorkStatus.endTime}
          waterLevel={dayWorkStatus.endWaterLevelInMetres}
          casingDepthInMetres={dayWorkStatus.endCasingDepthInMetres}
        />
      )}
    </>
  );
}
