import DateTimePicker from '@react-native-community/datetimepicker';
import { Keyboard, Platform, Text, TouchableOpacity } from 'react-native';

import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { getTime } from '@/utils/datetime';
import { useState } from 'react';

type Props = {
  dayWorkStatus: DayWorkStatus; setDayWorkStatus: React.Dispatch<React.SetStateAction<DayWorkStatus>>;
};

export function DayWorkStatusTimeSelectorComponent({
  dayWorkStatus, setDayWorkStatus,
}: Props) {

  const [isEditState, setIsEditState] = useState<boolean>(false);
  const [time, setTime] = useState<Date>(dayWorkStatus.time);

	const selectTime = (time: Date) => {
		setTime(time);
		setDayWorkStatus((dayWorkStatus: DayWorkStatus): DayWorkStatus => ({
			...dayWorkStatus,
			time: time,
		}));
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