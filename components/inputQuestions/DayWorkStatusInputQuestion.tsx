import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Keyboard, Text, TouchableOpacity, FlatList, StyleSheet, TextInput } from "react-native";

import { DAY_CONTINUE_WORK_TYPE, DAY_END_WORK_TYPE, DAY_START_WORK_TYPE, DAY_WORK_STATUS_TYPE_LIST, DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";

type DayWorkStatusInputQuestionProps = {
  dayWorkStatusType: DayWorkStatusType; setDayWorkStatusType: React.Dispatch<React.SetStateAction<DayWorkStatusType>>;
  isSelectDayWorkStatusPressed: boolean; setIsSelectDayWorkStatusPressed: React.Dispatch<React.SetStateAction<boolean>>;
  dayStartWorkDate: Date; setDayStartWorkDate: React.Dispatch<React.SetStateAction<Date>>;
  dayStartWorkTime: Date; setDayStartWorkTime: React.Dispatch<React.SetStateAction<Date>>;
  dayEndWorkDate: Date; setDayEndWorkDate: React.Dispatch<React.SetStateAction<Date>>;
  dayEndWorkTime: Date; setDayEndWorkTime: React.Dispatch<React.SetStateAction<Date>>;
  waterLevelInMetresStr: string; setWaterLevelInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  casingDepthInMetresStr: string; setCasingDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
}

export function DayWorkStatusInputQuestion({
  dayWorkStatusType, setDayWorkStatusType,
  isSelectDayWorkStatusPressed, setIsSelectDayWorkStatusPressed,
  dayStartWorkDate, setDayStartWorkDate,
  dayStartWorkTime, setDayStartWorkTime,
  dayEndWorkDate, setDayEndWorkDate,
  dayEndWorkTime, setDayEndWorkTime,
  waterLevelInMetresStr, setWaterLevelInMetresStr,
  casingDepthInMetresStr, setCasingDepthInMetresStr,
}: DayWorkStatusInputQuestionProps) {
  
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
						isSelectDayWorkStatusPressed && (
							<FlatList
								data={DAY_WORK_STATUS_TYPE_LIST}
								keyExtractor={item => item}
								renderItem={({ item }) => (
									<TouchableOpacity 
										onPress={() => {
											setDayWorkStatusType(item);
											setIsSelectDayWorkStatusPressed(false);
											const date: Date = new Date();
											setDayStartWorkDate(date);
											setDayStartWorkTime(date);
											setDayEndWorkDate(date);
											setDayEndWorkTime(date);
										}}
										style={[styles.listItem]}>
										<Text>{item}</Text>
									</TouchableOpacity>
								)}
							/>
						)
					}
				</View>
			</View>
			{
				dayWorkStatusType === DAY_START_WORK_TYPE && (
					<>
					<View style={{ flexDirection: 'row' }}>
						<Text style={{ paddingVertical: 10 }}>Day Start Work Date<Text style={{ color: 'red' }}>*</Text>: </Text>
						<DateTimePicker
							value={dayStartWorkDate}
							mode={'date'}
							is24Hour={true}
							onChange={(event, date) => {
								setDayStartWorkDate(date ? date : new Date());
							}}
							style={{ backgroundColor: 'yellow' }}
						/>
					</View>
					<View style={{ flexDirection: 'row' }}>
						<Text style={{ paddingVertical: 10 }}>Day Start Work Time<Text style={{ color: 'red' }}>*</Text>: </Text>
						<DateTimePicker
							value={dayStartWorkTime}
							mode={'time'}
							is24Hour={true}
							onChange={(event, time) => {
								console.log(time);
								setDayStartWorkTime(time ? time : new Date());
							}}
							style={{ backgroundColor: 'yellow' }}
						/>
					</View>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Text>Water Level(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
						<TextInput
							value={waterLevelInMetresStr}
							onChangeText={setWaterLevelInMetresStr}
							style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1, backgroundColor: 'yellow' }}
							keyboardType='numeric'
						/>
					</View>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Text>Casing Depth(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
						<TextInput
							value={casingDepthInMetresStr}
							onChangeText={setCasingDepthInMetresStr}
							style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1, backgroundColor: 'yellow' }}
							keyboardType='numeric'
						/>
					</View>
					</>
				)
			}
			{
				dayWorkStatusType === DAY_END_WORK_TYPE && (
					<>
					<View style={{ flexDirection: 'row' }}>
						<Text style={{ paddingVertical: 10 }}>Day End Work Date<Text style={{ color: 'red' }}>*</Text>: </Text>
						<DateTimePicker
							value={dayEndWorkDate}
							mode={'date'}
							is24Hour={true}
							onChange={(event, date) => {
								setDayEndWorkDate(date ? date : new Date());
							}}
							style={{ backgroundColor: 'yellow' }}
						/>
					</View>
					<View style={{ flexDirection: 'row' }}>
						<Text style={{ paddingVertical: 10 }}>Day End Work Time<Text style={{ color: 'red' }}>*</Text>: </Text>
						<DateTimePicker
							value={dayEndWorkTime}
							mode={'time'}
							is24Hour={true}
							onChange={(event, time) => {
								setDayEndWorkTime(time ? time : new Date());
							}}
							style={{ backgroundColor: 'yellow' }}
						/>
					</View>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Text>Water Level(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
						<TextInput
							value={waterLevelInMetresStr}
							onChangeText={setWaterLevelInMetresStr}
							style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1, backgroundColor: 'yellow' }}
							keyboardType='numeric'
						/>
					</View>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Text>Casing Depth(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
						<TextInput
							value={casingDepthInMetresStr}
							onChangeText={setCasingDepthInMetresStr}
							style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1, backgroundColor: 'yellow' }}
							keyboardType='numeric'
						/>
					</View>
					</>
				)
			}
    </>
  )
}

const styles = StyleSheet.create({
  listItem: {
    borderLeftWidth: 0.25,
    borderRightWidth: 0.25,
    borderBottomWidth: 0.25,
    alignItems: 'center',
    padding: 10,
  }
});