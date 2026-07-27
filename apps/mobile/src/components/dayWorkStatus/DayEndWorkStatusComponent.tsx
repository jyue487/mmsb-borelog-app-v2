import { Text, View } from "react-native";

import { DAY_END_WORK_TYPE } from "@/src/constants/DayWorkStatus";
import { getDateTime } from "@/src/utils/datetime";
import { DayWorkStatusProps } from "./DayWorkStatusComponent";

export function DayEndWorkStatusComponent({ dayWorkStatus }: DayWorkStatusProps) {
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <Text>{DAY_END_WORK_TYPE}: {getDateTime(dayWorkStatus.endDate, dayWorkStatus.endTime)}</Text>
      {(dayWorkStatus.endWaterLevelInMetres === null) ? null : <Text>{DAY_END_WORK_TYPE} Water Level: {typeof dayWorkStatus.endWaterLevelInMetres === "number" ? `${dayWorkStatus.endWaterLevelInMetres}m` : dayWorkStatus.endWaterLevelInMetres}</Text>}
      {(dayWorkStatus.endCasingDepthInMetres === null) ? null : <Text>{DAY_END_WORK_TYPE} Casing Depth: {dayWorkStatus.endCasingDepthInMetres}m</Text>}
    </View>
  );
}
