import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FlatList, Keyboard, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { useState } from 'react';
import { getDate, getTime } from '@/utils/datetime';

type Props = {
  dayWorkStatus: DayWorkStatus; setDayWorkStatus: React.Dispatch<React.SetStateAction<DayWorkStatus>>;
};

export function TimeSelectorComponent({
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