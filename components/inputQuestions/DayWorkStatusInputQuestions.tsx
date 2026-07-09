import { FlatList, Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";

import { DAY_END_WORK_TYPE, DAY_START_AND_END_WORK_TYPE, DAY_START_WORK_TYPE, DAY_WORK_STATUS_TYPE_LIST, DayWorkStatus, DayWorkStatusType } from "@/constants/DayWorkStatus";
import { styles } from '@/constants/styles';
import { useState } from 'react';
import { DayStartWorkStatusInputQuestions } from "./DayStartWorkStatusInputQuestions";
import { DayEndWorkStatusInputQuestions } from "./DayEndWorkStatusInputQuestions";
import { DayStartAndEndWorkStatusInputQuestion } from "./DayStartAndEndWorkStatusInputQuestions";

export type DayWorkStatusInputQuestionsProps = {
  dayWorkStatus: DayWorkStatus; setDayWorkStatus: React.Dispatch<React.SetStateAction<DayWorkStatus>>;
};

export function DayWorkStatusInputQuestions({ dayWorkStatus, setDayWorkStatus }: DayWorkStatusInputQuestionsProps) {

  const [dayWorkStatusType, setDayWorkStatusType] = useState<DayWorkStatusType>(dayWorkStatus.dayWorkStatusType);
  const [isSelectDayWorkStatusPressed, setIsSelectDayWorkStatusPressed] = useState<boolean>(false);

  const selectDayWorkStatusType = (dayWorkStatusType: DayWorkStatusType) => {
    setDayWorkStatusType(dayWorkStatusType);
    setIsSelectDayWorkStatusPressed(false);
    setDayWorkStatus({...dayWorkStatus, dayWorkStatusType: dayWorkStatusType});
  };

  return (
    <>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ paddingVertical: 10 }}>Day Work Status<Text style={{ color: 'red' }}>*</Text>: </Text>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              Keyboard.dismiss();
              setIsSelectDayWorkStatusPressed(prev => !prev);
            }}
            style={{
              borderWidth: 0.5,
              alignItems: 'center',
              padding: 10,
              width: '100%',
            }}>
            <Text>{dayWorkStatusType}</Text>
          </TouchableOpacity>
          {
            isSelectDayWorkStatusPressed && DAY_WORK_STATUS_TYPE_LIST.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  Keyboard.dismiss();
                  selectDayWorkStatusType(item);
                }}
                style={[styles.listItem]}>
                <Text>{item}</Text>
              </TouchableOpacity>
            ))
          }
        </View>
      </View>
      { dayWorkStatus.dayWorkStatusType === DAY_START_WORK_TYPE && <DayStartWorkStatusInputQuestions dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} /> }
      { dayWorkStatus.dayWorkStatusType === DAY_END_WORK_TYPE && <DayEndWorkStatusInputQuestions dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} /> }
      { dayWorkStatus.dayWorkStatusType === DAY_START_AND_END_WORK_TYPE && <DayStartAndEndWorkStatusInputQuestion dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} /> }
    </>
  )
}
