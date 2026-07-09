import { DAY_CONTINUE_WORK_TYPE, DAY_END_WORK_TYPE, DAY_START_WORK_TYPE, DayWorkStatus } from "@/constants/DayWorkStatus";
import { DayStartWorkStatusComponent } from "./DayStartWorkStatusComponent";
import { DayEndWorkStatusComponent } from "./DayEndWorkStatusComponent";

export type DayWorkStatusProps = {
  dayWorkStatus: DayWorkStatus;
};

export function DayWorkStatusComponent({ dayWorkStatus }: DayWorkStatusProps) {
  if (dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) {
    return <></>;
  }
  if (dayWorkStatus.dayWorkStatusType === DAY_START_WORK_TYPE) {
    return <DayStartWorkStatusComponent dayWorkStatus={dayWorkStatus} />;
  }
  if (dayWorkStatus.dayWorkStatusType === DAY_END_WORK_TYPE) {
    return <DayEndWorkStatusComponent dayWorkStatus={dayWorkStatus} />;
  }
  return (
    <>
      <DayStartWorkStatusComponent dayWorkStatus={dayWorkStatus} />
      <DayEndWorkStatusComponent dayWorkStatus={dayWorkStatus} />
    </>
  );
}