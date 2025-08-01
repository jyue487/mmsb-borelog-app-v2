import { FlatList, Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";

import { DAY_CONTINUE_WORK_TYPE, DAY_START_WORK_TYPE, DAY_WORK_STATUS_TYPE_LIST, DayWorkStatus, DayWorkStatusType } from "@/constants/DayWorkStatus";
import { styles } from '@/constants/styles';
import { stringToDecimalPoint } from '@/utils/numbers';
import { useState } from 'react';
import { DateSelectorComponent } from '../datetime/DateSelectorComponent';
import { TimeSelectorComponent } from '../datetime/TimeSelectorComponent';

type DayWorkStatusInputQuestionsProps = {
	dayWorkStatus: DayWorkStatus; setDayWorkStatus: React.Dispatch<React.SetStateAction<DayWorkStatus>>;
}

export function DayWorkStatusInputQuestions({
	dayWorkStatus, setDayWorkStatus,
}: DayWorkStatusInputQuestionsProps) {
  
	const [dayWorkStatusType, setDayWorkStatusType] = useState<DayWorkStatusType>(dayWorkStatus.dayWorkStatusType);
	const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>(dayWorkStatus.waterLevelInMetres?.toFixed(3) ?? '');
	const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>(dayWorkStatus.casingDepthInMetres?.toFixed(3) ?? '');
	const [isSelectDayWorkStatusPressed, setIsSelectDayWorkStatusPressed] = useState<boolean>(false);

	const selectDayWorkStatusType = (dayWorkStatusType: DayWorkStatusType) => {
		setDayWorkStatusType(dayWorkStatusType);
		setIsSelectDayWorkStatusPressed(false);
		setDayWorkStatus((dayWorkStatus: DayWorkStatus): DayWorkStatus => ({
			...dayWorkStatus,
			dayWorkStatusType: dayWorkStatusType,
		}));
	};
	const saveWaterLevelInMetresStr = (waterLevelInMetresStr: string) => {
		setWaterLevelInMetresStr(waterLevelInMetresStr);
		setDayWorkStatus((dayWorkStatus: DayWorkStatus): DayWorkStatus => ({
			...dayWorkStatus,
			waterLevelInMetres: stringToDecimalPoint(waterLevelInMetresStr, 3),
		}));
	};
	const saveCasingDepthInMetresStr = (casingDepthInMetresStr: string) => {
		setCasingDepthInMetresStr(casingDepthInMetresStr);
		setDayWorkStatus((dayWorkStatus: DayWorkStatus): DayWorkStatus => ({
			...dayWorkStatus,
			casingDepthInMetres: stringToDecimalPoint(casingDepthInMetresStr, 3),
		}));
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
					isSelectDayWorkStatusPressed && (
						<FlatList
							data={DAY_WORK_STATUS_TYPE_LIST}
							keyExtractor={item => item}
							renderItem={({ item }) => (
								<TouchableOpacity 
									onPress={() => {
										Keyboard.dismiss();
										selectDayWorkStatusType(item);
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
			dayWorkStatusType !== DAY_CONTINUE_WORK_TYPE && (
				<>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ paddingVertical: 10 }}>Day {(dayWorkStatusType === DAY_START_WORK_TYPE) ? 'Start' : 'End'} Work Date<Text style={{ color: 'red' }}>*</Text>: </Text>
					<DateSelectorComponent dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} />
				</View>
				<View style={{ flexDirection: 'row' }}>
					<Text style={{ paddingVertical: 10 }}>Day {(dayWorkStatusType === DAY_START_WORK_TYPE) ? 'Start' : 'End'} Work Time<Text style={{ color: 'red' }}>*</Text>: </Text>
					<TimeSelectorComponent dayWorkStatus={dayWorkStatus} setDayWorkStatus={setDayWorkStatus} />
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>Water Level(m): </Text>
					<TextInput
						value={waterLevelInMetresStr}
						onChangeText={saveWaterLevelInMetresStr}
						style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1, backgroundColor: 'yellow' }}
						keyboardType='numeric'
					/>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Text>Casing Depth(m): </Text>
					<TextInput
						value={casingDepthInMetresStr}
						onChangeText={saveCasingDepthInMetresStr}
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
