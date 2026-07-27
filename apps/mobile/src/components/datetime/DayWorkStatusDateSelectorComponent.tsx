import DateTimePicker from '@react-native-community/datetimepicker';
import { Keyboard, Platform, Text, TouchableOpacity } from 'react-native';

import { DayWorkStatus } from "@/src/constants/DayWorkStatus";
import { getDate } from '@/src/utils/datetime';
import { useState } from 'react';

type Props = {
  dayWorkStatus: DayWorkStatus; setDayWorkStatus: React.Dispatch<React.SetStateAction<DayWorkStatus>>;
  startOrEnd: 'start' | 'end'
};

export function DayWorkStatusDateSelectorComponent({
  dayWorkStatus, setDayWorkStatus, startOrEnd
}: Props) {

  const [isEditState, setIsEditState] = useState<boolean>(false);
  const [date, setDate] = useState<Date>((startOrEnd === 'start') ? dayWorkStatus.startDate : dayWorkStatus.endDate);

  const selectDate = (date: Date) => {
		setDate(date);
		setDayWorkStatus((startOrEnd === 'start') ? {...dayWorkStatus, startDate: date} : {...dayWorkStatus, endDate: date});
	};

  if (isEditState || Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={date}
        mode={'date'}
        is24Hour={true}
        onChange={(event, date) => {
          if (event.type === 'set' || event.type === 'dismissed') {
            setIsEditState(false);
          }
          selectDate(date ?? new Date());
        }}
        style={{ backgroundColor: 'yellow' }}
      />
    );
  }
  return (
    <TouchableOpacity 
      onPress={() => {
        Keyboard.dismiss();
        setIsEditState(true);
      }}
      style={{
        borderWidth: 0.5,
        alignItems: 'center',
        padding: 10,
        flex: 1,
        backgroundColor: 'yellow',
      }}>
      <Text>{getDate(date)}</Text>
    </TouchableOpacity>
  );
}