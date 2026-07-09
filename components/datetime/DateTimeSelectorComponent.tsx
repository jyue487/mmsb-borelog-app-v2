import DateTimePicker from '@react-native-community/datetimepicker';
import { Keyboard, Platform, Text, TouchableOpacity } from 'react-native';

import { getDate, getTime } from '@/utils/datetime';
import { useState } from 'react';

type Props = {
  dateTime: Date; onDateTimeChange: (newDateTime: Date) => void;
  dateOrTime: 'date' | 'time';
};

export function DateTimeSelectorComponent({ dateTime, onDateTimeChange, dateOrTime }: Props) {

  const [isEditState, setIsEditState] = useState<boolean>(false);

  if (isEditState || Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={dateTime}
        mode={dateOrTime}
        is24Hour={true}
        onChange={(event, newDateTime) => {
          if (event.type === 'set' || event.type === 'dismissed') {
            setIsEditState(false);
          }
          onDateTimeChange(newDateTime ?? new Date());
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
      <Text>{(dateOrTime === 'date') ? getDate(dateTime) : getTime(dateTime)}</Text>
    </TouchableOpacity>
  );
}