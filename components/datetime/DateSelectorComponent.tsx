import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FlatList, Keyboard, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

import { DayWorkStatus } from "@/constants/DayWorkStatus";
import { useState } from 'react';
import { getDate } from '@/utils/datetime';

type Props = {
  dayWorkStatus: DayWorkStatus; setDayWorkStatus: React.Dispatch<React.SetStateAction<DayWorkStatus>>;
};

export function DateSelectorComponent({
  dayWorkStatus, setDayWorkStatus,
}: Props) {

  const [isEditState, setIsEditState] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(dayWorkStatus.date);

  const selectDate = (date: Date) => {
		setDate(date);
		setDayWorkStatus((dayWorkStatus: DayWorkStatus): DayWorkStatus => ({
			...dayWorkStatus,
			date: date,
		}));
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