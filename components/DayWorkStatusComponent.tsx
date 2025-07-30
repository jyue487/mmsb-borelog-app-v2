import { Text, View } from "react-native";

import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";
import { getDateTime } from "@/utils/datetime";

export type DayWorkStatusProps = {
  dayWorkStatus: DayWorkStatus
};

export function DayWorkStatusComponent({ dayWorkStatus }: DayWorkStatusProps) {
  if (dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) {
    return <></>;
  }
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <Text>{dayWorkStatus.dayWorkStatusType}: {getDateTime(dayWorkStatus.date, dayWorkStatus.time)}</Text>
      {(!dayWorkStatus.waterLevelInMetres) ? null : <Text>Water Level: {dayWorkStatus.waterLevelInMetres}m</Text>}
      {(!dayWorkStatus.casingDepthInMetres) ? null : <Text>Casing Depth: {dayWorkStatus.casingDepthInMetres}m</Text>}
    </View>
  );
}