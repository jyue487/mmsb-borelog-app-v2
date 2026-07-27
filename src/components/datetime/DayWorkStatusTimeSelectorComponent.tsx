import DateTimePicker from '@react-native-community/datetimepicker';
import { Keyboard, Platform, Text, TouchableOpacity } from 'react-native';

import { DayWorkStatus } from "@/src/constants/DayWorkStatus";
import { getTime } from '@/src/utils/datetime';
import { useState } from 'react';

type Props = {
  dayWorkStatus: DayWorkStatus; setDayWorkStatus: React.Dispatch<React.SetStateAction<DayWorkStatus>>;
  startOrEnd: 'start' | 'end';
};

export function DayWorkStatusTimeSelectorComponent({
  dayWorkStatus, setDayWorkStatus, startOrEnd
}: Props) {

  const [isEditState, setIsEditState] = useState<boolean>(false);
  const [time, setTime] = useState<Date>((startOrEnd === 'start') ? dayWorkStatus.startTime : dayWorkStatus.endTime);

	const selectTime = (time: Date) => {
		setTime(time);
		setDayWorkStatus((startOrEnd === 'start') ? {...dayWorkStatus, startTime: time} : {...dayWorkStatus, endTime: time});
	};

  if (isEditState || Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={time}
        mode={'time'}
        is24Hour={true}
        onChange={(event, time) => {
          if (event.type === 'set' || event.type === 'dismissed') {
            setIsEditState(false);
          }
          selectTime(time ?? new Date());
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
      <Text>{getTime(time)}</Text>
    </TouchableOpacity>
  );
}