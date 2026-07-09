import { Text, View } from "react-native";

import { getDateTime } from "@/utils/datetime";
import { DayWorkStatusProps } from "./DayWorkStatusComponent";
import { DAY_START_WORK_TYPE } from "@/constants/DayWorkStatus";

export function DayStartWorkStatusComponent({ dayWorkStatus }: DayWorkStatusProps) {
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <Text>{DAY_START_WORK_TYPE}: {getDateTime(dayWorkStatus.startDate, dayWorkStatus.startTime)}</Text>
      {(dayWorkStatus.startWaterLevelInMetres === null) ? null : <Text>{DAY_START_WORK_TYPE} Water Level: {typeof dayWorkStatus.startWaterLevelInMetres === "number" ? `${dayWorkStatus.startWaterLevelInMetres}m` : dayWorkStatus.startWaterLevelInMetres}</Text>}
      {(dayWorkStatus.startCasingDepthInMetres === null) ? null : <Text>{DAY_START_WORK_TYPE} Casing Depth: {dayWorkStatus.startCasingDepthInMetres}m</Text>}
    </View>
  );
}
