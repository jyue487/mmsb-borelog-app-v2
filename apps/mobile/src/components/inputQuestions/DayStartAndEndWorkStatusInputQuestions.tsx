import { DayWorkStatusInputQuestionsProps } from "./DayWorkStatusInputQuestions";
import { DayStartWorkStatusInputQuestions } from "./DayStartWorkStatusInputQuestions";
import { DayEndWorkStatusInputQuestions } from "./DayEndWorkStatusInputQuestions";

export function DayStartAndEndWorkStatusInputQuestion({ dayWorkStatus, setDayWorkStatus }: DayWorkStatusInputQuestionsProps) {
  return (
    <>
      <DayStartWorkStatusInputQuestions dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} />
      <DayEndWorkStatusInputQuestions dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} />
    </>
  );
}