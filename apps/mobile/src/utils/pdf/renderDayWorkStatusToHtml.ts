import {
    DAY_CONTINUE_WORK_TYPE,
    DAY_END_WORK_TYPE,
    DAY_START_WORK_TYPE,
    DayWorkStatus,
} from '@mmsb/core';
import { getDate, getTime } from "@/src/utils/datetime";

export function renderDayWorkStatusToHtml(dayWorkStatus: DayWorkStatus) {
  return (
    `
    <td class="datetime" style="position: relative; vertical-align: ${(dayWorkStatus.dayWorkStatusType === DAY_START_WORK_TYPE) ? 'top' : (dayWorkStatus.dayWorkStatusType === DAY_END_WORK_TYPE) ? 'bottom' : 'middle'};">
      ${
        (dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) 
        ? '' 
        : (dayWorkStatus.dayWorkStatusType === DAY_START_WORK_TYPE) 
        ? (
          `
          <div style="display: flex; flex: 1; flex-direction: column; align-items: center;">
              <div style="transform: scale(0.67); line-height: 0.7;">${getDate(dayWorkStatus.startDate)}</div>
              <div style="transform: scale(0.67); line-height: 0.7;">${getTime(dayWorkStatus.startTime)}</div>
          </div>
          `
        )
        : (dayWorkStatus.dayWorkStatusType === DAY_END_WORK_TYPE) 
        ? (
          `
          <div style="display: flex; flex: 1; flex-direction: column; align-items: center;">
              <div style="transform: scale(0.67); line-height: 0.7;">${getDate(dayWorkStatus.endDate)}</div>
              <div style="transform: scale(0.67); line-height: 0.7;">${getTime(dayWorkStatus.endTime)}</div>
          </div>
          `
        )
        : (
          `
          <div style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 3pt 0;">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="transform: scale(0.67); line-height: 0.7;">${getDate(dayWorkStatus.startDate)}</div>
                <div style="transform: scale(0.67); line-height: 0.7;">${getTime(dayWorkStatus.startTime)}</div>
            </div>
            <div style="display: flex; flex: 1; flex-direction: column; align-items: center;"></div>
            <div style="display: flex; flex-direction: column; align-items: center;">
                <div style="transform: scale(0.67); line-height: 0.7;">${getDate(dayWorkStatus.endDate)}</div>
                <div style="transform: scale(0.67); line-height: 0.7;">${getTime(dayWorkStatus.endTime)}</div>
            </div>
          </div>
          `
        )
      }
    </td>
    `
  );
}

// export function renderDayWorkStatusToHtml(dayWorkStatus: DayWorkStatus) {
//   return (
//     `
//     <td class="datetime" style="vertical-align: ${(dayWorkStatus.dayWorkStatusType === DAY_START_WORK_TYPE) ? 'top' : (dayWorkStatus.dayWorkStatusType === DAY_END_WORK_TYPE) ? 'bottom' : 'middle'};">
//       ${
//         (dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) 
//         ? '' 
//         : (dayWorkStatus.dayWorkStatusType === DAY_START_WORK_TYPE) 
//         ? (
//           `
//           <div style="display: flex; flex: 1; flex-direction: column; align-items: center;">
//               <div style="transform: scale(0.67); line-height: 0.7;">${getDate(dayWorkStatus.startDate)}</div>
//               <div style="transform: scale(0.67); line-height: 0.7;">${getTime(dayWorkStatus.startTime)}</div>
//           </div>
//           `
//         )
//         : (dayWorkStatus.dayWorkStatusType === DAY_END_WORK_TYPE) 
//         ? (
//           `
//           <div style="display: flex; flex: 1; flex-direction: column; align-items: center;">
//               <div style="transform: scale(0.67); line-height: 0.7;">${getDate(dayWorkStatus.endDate)}</div>
//               <div style="transform: scale(0.67); line-height: 0.7;">${getTime(dayWorkStatus.endTime)}</div>
//           </div>
//           `
//         )
//         : (
//           `
//           <div style="display: flex; flex-direction: column; align-items: center;">
//               <div style="transform: scale(0.67); line-height: 0.7;">${getDate(dayWorkStatus.startDate)}</div>
//               <div style="transform: scale(0.67); line-height: 0.7;">${getTime(dayWorkStatus.startTime)}</div>
//           </div>
//           <div style="display: flex; flex: 1; flex-direction: column; align-items: center;">
//           </div>
//           <div style="display: flex; flex-direction: column; align-items: center;">
//               <div style="transform: scale(0.67); line-height: 0.7;">${getDate(dayWorkStatus.endDate)}</div>
//               <div style="transform: scale(0.67); line-height: 0.7;">${getTime(dayWorkStatus.endTime)}</div>
//           </div>
//           `
//         )
//       }
//     </td>
//     `
//   );
// }