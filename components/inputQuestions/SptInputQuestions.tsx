import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View, type ViewProps } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { Colour } from "@/constants/colour";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatusType } from "@/constants/DayStatus";
import {
	DominantSoilType,
	SecondarySoilType
} from "@/constants/soil";
import { Block } from "@/interfaces/Block";
import { checkAndReturnSptBlock } from "@/utils/checkFunctions/checkAndReturnSptBlock";
import { DEFAULT_SOIL_POSITION_TYPE, SoilPropertiesInputQuestions } from "../inputQuestions/SoilPropertiesInputQuestions";

type SptInputQuestionsProps = {
  dayWorkStatusType: DayWorkStatusType; setDayWorkStatusType: React.Dispatch<React.SetStateAction<DayWorkStatusType>>;
  dayStartWorkDate: Date; setDayStartWorkDate: React.Dispatch<React.SetStateAction<Date>>;
  dayStartWorkTime: Date; setDayStartWorkTime: React.Dispatch<React.SetStateAction<Date>>;
  dayEndWorkDate: Date; setDayEndWorkDate: React.Dispatch<React.SetStateAction<Date>>;
  dayEndWorkTime: Date; setDayEndWorkTime: React.Dispatch<React.SetStateAction<Date>>;
  waterLevelInMetresStr: string; setWaterLevelInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  casingDepthInMetresStr: string; setCasingDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  topDepthInMetresStr: string; setTopDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  seatingIncBlows1Str: string; setSeatingIncBlows1Str: React.Dispatch<React.SetStateAction<string>>;
  seatingIncBlows2Str: string; setSeatingIncBlows2Str: React.Dispatch<React.SetStateAction<string>>;
  seatingIncPen1Str: string; setSeatingIncPen1Str: React.Dispatch<React.SetStateAction<string>>;
  seatingIncPen2Str: string; setSeatingIncPen2Str: React.Dispatch<React.SetStateAction<string>>;
  mainIncBlows1Str: string; setMainIncBlows1Str: React.Dispatch<React.SetStateAction<string>>;
  mainIncBlows2Str: string; setMainIncBlows2Str: React.Dispatch<React.SetStateAction<string>>;
  mainIncBlows3Str: string; setMainIncBlows3Str: React.Dispatch<React.SetStateAction<string>>;
  mainIncBlows4Str: string; setMainIncBlows4Str: React.Dispatch<React.SetStateAction<string>>;
  mainIncPen1Str: string; setMainIncPen1Str: React.Dispatch<React.SetStateAction<string>>;
  mainIncPen2Str: string; setMainIncPen2Str: React.Dispatch<React.SetStateAction<string>>;
  mainIncPen3Str: string; setMainIncPen3Str: React.Dispatch<React.SetStateAction<string>>;
  mainIncPen4Str: string; setMainIncPen4Str: React.Dispatch<React.SetStateAction<string>>;
  isSeatingIncBlows1Active: boolean; setIsSeatingIncBlows1Active: React.Dispatch<React.SetStateAction<boolean>>;
  isSeatingIncBlows2Active: boolean; setIsSeatingIncBlows2Active: React.Dispatch<React.SetStateAction<boolean>>;
  isMainIncBlows1Active: boolean; setIsMainIncBlows1Active: React.Dispatch<React.SetStateAction<boolean>>;
  isMainIncBlows2Active: boolean; setIsMainIncBlows2Active: React.Dispatch<React.SetStateAction<boolean>>;
  isMainIncBlows3Active: boolean; setIsMainIncBlows3Active: React.Dispatch<React.SetStateAction<boolean>>;
  isMainIncBlows4Active: boolean; setIsMainIncBlows4Active: React.Dispatch<React.SetStateAction<boolean>>;
  isSeatingIncPen1Active: boolean; setIsSeatingIncPen1Active: React.Dispatch<React.SetStateAction<boolean>>;
  isSeatingIncPen2Active: boolean; setIsSeatingIncPen2Active: React.Dispatch<React.SetStateAction<boolean>>;
  isMainIncPen1Active: boolean; setIsMainIncPen1Active: React.Dispatch<React.SetStateAction<boolean>>;
  isMainIncPen2Active: boolean; setIsMainIncPen2Active: React.Dispatch<React.SetStateAction<boolean>>;
  isMainIncPen3Active: boolean; setIsMainIncPen3Active: React.Dispatch<React.SetStateAction<boolean>>;
  isMainIncPen4Active: boolean; setIsMainIncPen4Active: React.Dispatch<React.SetStateAction<boolean>>;
  recoveryLengthInMillimetresStr: string; setRecoveryLengthInMillimetresStr: React.Dispatch<React.SetStateAction<string>>;
  dominantColour: Colour | null; setDominantColour: React.Dispatch<React.SetStateAction<Colour | null>>;
  secondaryColour: Colour | null; setSecondaryColour: React.Dispatch<React.SetStateAction<Colour | null>>;
  dominantSoilType: DominantSoilType | null; setDominantSoilType: React.Dispatch<React.SetStateAction<DominantSoilType | null>>;
  secondarySoilType: SecondarySoilType | null; setSecondarySoilType: React.Dispatch<React.SetStateAction<SecondarySoilType | null>>;
  otherProperties: string; setOtherProperties: React.Dispatch<React.SetStateAction<string>>;
};

export function SptInputQuestions({
  dayWorkStatusType, setDayWorkStatusType,
  dayStartWorkDate, setDayStartWorkDate,
  dayStartWorkTime, setDayStartWorkTime,
  dayEndWorkDate, setDayEndWorkDate,
  dayEndWorkTime, setDayEndWorkTime,
  waterLevelInMetresStr, setWaterLevelInMetresStr,
  casingDepthInMetresStr, setCasingDepthInMetresStr,
  topDepthInMetresStr, setTopDepthInMetresStr,
  seatingIncBlows1Str, setSeatingIncBlows1Str,
  seatingIncBlows2Str, setSeatingIncBlows2Str,
  seatingIncPen1Str, setSeatingIncPen1Str,
  seatingIncPen2Str, setSeatingIncPen2Str,
  mainIncBlows1Str, setMainIncBlows1Str,
  mainIncBlows2Str, setMainIncBlows2Str,
  mainIncBlows3Str, setMainIncBlows3Str,
  mainIncBlows4Str, setMainIncBlows4Str,
  mainIncPen1Str, setMainIncPen1Str,
  mainIncPen2Str, setMainIncPen2Str,
  mainIncPen3Str, setMainIncPen3Str,
  mainIncPen4Str, setMainIncPen4Str,
  isSeatingIncBlows1Active, setIsSeatingIncBlows1Active,
  isSeatingIncBlows2Active, setIsSeatingIncBlows2Active,
  isMainIncBlows1Active, setIsMainIncBlows1Active,
  isMainIncBlows2Active, setIsMainIncBlows2Active,
  isMainIncBlows3Active, setIsMainIncBlows3Active,
  isMainIncBlows4Active, setIsMainIncBlows4Active,
  isSeatingIncPen1Active, setIsSeatingIncPen1Active,
  isSeatingIncPen2Active, setIsSeatingIncPen2Active,
  isMainIncPen1Active, setIsMainIncPen1Active,
  isMainIncPen2Active, setIsMainIncPen2Active,
  isMainIncPen3Active, setIsMainIncPen3Active,
  isMainIncPen4Active, setIsMainIncPen4Active,
  recoveryLengthInMillimetresStr, setRecoveryLengthInMillimetresStr,
  dominantColour, setDominantColour,
  secondaryColour, setSecondaryColour,
  dominantSoilType, setDominantSoilType,
  secondarySoilType, setSecondarySoilType,
  otherProperties, setOtherProperties,
}: SptInputQuestionsProps) {

  const resetSeatingInc1 = () => {
    setSeatingIncBlows1Str('');
    setSeatingIncPen1Str('');
    setIsSeatingIncBlows1Active(false);
    setIsSeatingIncPen1Active(false);
  };
  const resetSeatingInc2 = () => {
    setSeatingIncBlows2Str('');
    setSeatingIncPen2Str('');
    setIsSeatingIncBlows2Active(false);
    setIsSeatingIncPen2Active(false);
  };
  const resetMainInc1 = () => {
    setMainIncBlows1Str('');
    setMainIncPen1Str('');
    setIsMainIncBlows1Active(false);
    setIsMainIncPen1Active(false);
  };
  const resetMainInc2 = () => {
    setMainIncBlows2Str('');
    setMainIncPen2Str('');
    setIsMainIncBlows2Active(false);
    setIsMainIncPen2Active(false);
  };
  const resetMainInc3 = () => {
    setMainIncBlows3Str('');
    setMainIncPen3Str('');
    setIsMainIncBlows3Active(false);
    setIsMainIncPen3Active(false);
  };
  const resetMainInc4 = () => {
    setMainIncBlows4Str('');
    setMainIncPen4Str('');
    setIsMainIncBlows4Active(false);
    setIsMainIncPen4Active(false);
  };
  const resetRecoveryLength = () => {
    setRecoveryLengthInMillimetresStr('');
  };

  return (
    <>
    <DayWorkStatusInputQuestions 
      dayWorkStatusType={dayWorkStatusType} setDayWorkStatusType={setDayWorkStatusType}
      dayStartWorkDate={dayStartWorkDate} setDayStartWorkDate={setDayStartWorkDate}
      dayStartWorkTime={dayStartWorkTime} setDayStartWorkTime={setDayStartWorkTime}
      dayEndWorkDate={dayEndWorkDate} setDayEndWorkDate={setDayEndWorkDate}
      dayEndWorkTime={dayEndWorkTime} setDayEndWorkTime={setDayEndWorkTime}
      waterLevelInMetresStr={waterLevelInMetresStr} setWaterLevelInMetresStr={setWaterLevelInMetresStr}
      casingDepthInMetresStr={casingDepthInMetresStr} setCasingDepthInMetresStr={setCasingDepthInMetresStr}
    />
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>Top Depth(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
      <TextInput
        value={topDepthInMetresStr}
        onChangeText={setTopDepthInMetresStr}
        style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
        keyboardType='numeric'
      />
    </View>
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 2 }}>
        <Text>Seating<Text style={{ color: 'red' }}>*</Text></Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <TextInput
              value={seatingIncBlows1Str}
              onChangeText={(text: string) => {
                setSeatingIncBlows1Str(text);
                resetSeatingInc2();
                resetMainInc1();
                resetMainInc2();
                resetMainInc3();
                resetMainInc4();
                resetRecoveryLength();

                const seatingIncBlows1: number = parseInt(text);
                if (isNaN(seatingIncBlows1)) {
                  setIsSeatingIncPen1Active(false);
                  setSeatingIncPen1Str('');
                  setIsSeatingIncBlows2Active(false);
                  return;
                }
                if (seatingIncBlows1 >= 25) {
                  setSeatingIncBlows1Str('25');
                  setSeatingIncPen1Str('');
                  setIsSeatingIncPen1Active(true);
                  setIsSeatingIncBlows2Active(false);
                  return;
                }
                setIsSeatingIncPen1Active(false);
                setIsSeatingIncBlows2Active(true);
                setSeatingIncPen1Str('75');
              }}
              editable={isSeatingIncBlows1Active}
              style={(isSeatingIncBlows1Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
            <TextInput
              value={seatingIncPen1Str}
              onChangeText={(text: string) => {
                setSeatingIncPen1Str(text);
                resetSeatingInc2();
                resetMainInc1();
                resetMainInc2();
                resetMainInc3();
                resetMainInc4();
                resetRecoveryLength();
                const seatingIncPen1: number = parseInt(text);
                if (isNaN(seatingIncPen1)) {
                  setIsMainIncBlows1Active(false);
                  return;
                }
                setIsMainIncBlows1Active(true);
                if (seatingIncPen1 > 75) {
                  setSeatingIncPen1Str('75');
                }
              }}
              editable={isSeatingIncPen1Active}
              style={(isSeatingIncPen1Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              value={seatingIncBlows2Str}
              onChangeText={(text: string) => {
                setSeatingIncBlows2Str(text);
                resetMainInc1();
                resetMainInc2();
                resetMainInc3();
                resetMainInc4();
                resetRecoveryLength();

                const seatingIncBlows2: number = parseInt(text);
                if (isNaN(seatingIncBlows2)) {
                  setIsSeatingIncPen2Active(false);
                  setSeatingIncPen2Str('');
                  setIsMainIncBlows1Active(false);
                  return;
                }
                const seatingIncBlows1: number = parseInt(seatingIncBlows1Str);
                if (seatingIncBlows1 + seatingIncBlows2 >= 25) {
                  setSeatingIncBlows2Str((25 - seatingIncBlows1).toString());
                  setSeatingIncPen2Str('');
                  setIsSeatingIncPen2Active(true);
                  setIsMainIncBlows1Active(false);
                  return;
                }
                setIsSeatingIncPen2Active(false);
                setSeatingIncPen2Str('75');
                setIsMainIncBlows1Active(true);
              }}
              editable={isSeatingIncBlows2Active}
              style={(isSeatingIncBlows2Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
            <TextInput
              value={seatingIncPen2Str}
              onChangeText={(text: string) => {
                setSeatingIncPen2Str(text);
                resetMainInc1();
                resetMainInc2();
                resetMainInc3();
                resetMainInc4();
                resetRecoveryLength();
                const seatingIncPen2: number = parseInt(text);
                if (isNaN(seatingIncPen2)) {
                  setIsMainIncBlows1Active(false);
                  return;
                }
                setIsMainIncBlows1Active(true);
                if (seatingIncPen2 > 75) {
                  setSeatingIncPen2Str('75');
                }
              }}
              editable={isSeatingIncPen2Active}
              style={(isSeatingIncPen2Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
          </View>
        </View>
      </View>
      <View style={{ flex: 4 }}>
        <Text>Test Drive<Text style={{ color: 'red' }}>*</Text></Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <TextInput
              value={mainIncBlows1Str}
              onChangeText={(text: string) => {
                setMainIncBlows1Str(text);
                resetMainInc2();
                resetMainInc3();
                resetMainInc4();
                resetRecoveryLength();

                const mainIncBlows1: number = parseInt(text);
                if (isNaN(mainIncBlows1)) {
                  setIsMainIncPen1Active(false);
                  setMainIncPen1Str('');
                  setIsMainIncBlows2Active(false);
                  return;
                }
                if (mainIncBlows1 >= 50) {
                  setMainIncBlows1Str('50');
                  setMainIncPen1Str('');
                  setIsMainIncPen1Active(true);
                  setIsMainIncBlows2Active(false);
                  return;
                }
                setIsMainIncPen1Active(false);
                setMainIncPen1Str('75');
                setIsMainIncBlows2Active(true);
              }}
              editable={isMainIncBlows1Active}
              style={(isMainIncBlows1Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
            <TextInput
              value={mainIncPen1Str}
              onChangeText={(text: string) => {
                setMainIncPen1Str(text);
                resetMainInc2();
                resetMainInc3();
                resetMainInc4();
                resetRecoveryLength();
                const mainIncPen1: number = parseInt(text);
                if (isNaN(mainIncPen1)) {
                  return;
                }
                if (mainIncPen1 > 75) {
                  setMainIncPen1Str('75');
                }
              }}
              editable={isMainIncPen1Active}
              style={(isMainIncPen1Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              value={mainIncBlows2Str}
              onChangeText={(text: string) => {
                setMainIncBlows2Str(text);
                resetMainInc3();
                resetMainInc4();
                resetRecoveryLength();

                const mainIncBlows2: number = parseInt(text);
                if (isNaN(mainIncBlows2)) {
                  setIsMainIncPen2Active(false);
                  setMainIncPen2Str('');
                  setIsMainIncBlows3Active(false);
                  return;
                }
                const mainIncBlows1: number = parseInt(mainIncBlows1Str);
                if (mainIncBlows1 + mainIncBlows2 >= 50) {
                  setMainIncBlows2Str((50 - mainIncBlows1).toString());
                  setMainIncPen2Str('');
                  setIsMainIncPen2Active(true);
                  setIsMainIncBlows3Active(false);
                  return;
                }
                setIsMainIncPen2Active(false);
                setMainIncPen2Str('75');
                setIsMainIncBlows3Active(true);
              }}
              editable={isMainIncBlows2Active}
              style={(isMainIncBlows2Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
            <TextInput
              value={mainIncPen2Str}
              onChangeText={(text: string) => {
                setMainIncPen2Str(text);
                resetMainInc3();
                resetMainInc4();
                resetRecoveryLength();
                const mainIncPen2: number = parseInt(text);
                if (isNaN(mainIncPen2)) {
                  return;
                }
                if (mainIncPen2 > 75) {
                  setMainIncPen2Str('75');
                }
              }}
              editable={isMainIncPen2Active}
              style={(isMainIncPen2Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              value={mainIncBlows3Str}
              onChangeText={(text: string) => {
                setMainIncBlows3Str(text);
                resetMainInc4();
                resetRecoveryLength();

                const mainIncBlows3: number = parseInt(text);
                if (isNaN(mainIncBlows3)) {
                  setIsMainIncPen3Active(false);
                  setMainIncPen3Str('');
                  setIsMainIncBlows4Active(false);
                  return;
                }
                const mainIncBlows1: number = parseInt(mainIncBlows1Str);
                const mainIncBlows2: number = parseInt(mainIncBlows2Str);
                if (mainIncBlows1 + mainIncBlows2 + mainIncBlows3 >= 50) {
                  setMainIncBlows3Str((50 - mainIncBlows1 - mainIncBlows2).toString());
                  setMainIncPen3Str('');
                  setIsMainIncPen3Active(true);
                  setIsMainIncBlows4Active(false);
                  return;
                }
                setIsMainIncPen3Active(false);
                setMainIncPen3Str('75');
                setIsMainIncBlows4Active(true);
              }}
              editable={isMainIncBlows3Active}
              style={(isMainIncBlows3Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
            <TextInput
              value={mainIncPen3Str}
              onChangeText={(text: string) => {
                setMainIncPen3Str(text);
                resetMainInc4();
                resetRecoveryLength();
                const mainIncPen3: number = parseInt(text);
                if (isNaN(mainIncPen3)) {
                  return;
                }
                if (mainIncPen3 > 75) {
                  setMainIncPen3Str('75');
                }
              }}
              editable={isMainIncPen3Active}
              style={(isMainIncPen3Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              value={mainIncBlows4Str}
              onChangeText={(text: string) => {
                setMainIncBlows4Str(text);
                resetRecoveryLength();
                const mainIncBlows4: number = parseInt(text);
                if (isNaN(mainIncBlows4)) {
                  setIsMainIncPen4Active(false);
                  setMainIncPen4Str('');
                  return;
                }
                const mainIncBlows1: number = parseInt(mainIncBlows1Str);
                const mainIncBlows2: number = parseInt(mainIncBlows2Str);
                const mainIncBlows3: number = parseInt(mainIncBlows3Str);
                if (mainIncBlows1 + mainIncBlows2 + mainIncBlows3 + mainIncBlows4 >= 50) {
                  setMainIncBlows4Str((50 - mainIncBlows1 - mainIncBlows2 - mainIncBlows3).toString());
                  setMainIncPen4Str('');
                  setIsMainIncPen4Active(true);
                  return;
                }
                setIsMainIncPen4Active(false);
                setMainIncPen4Str('75');
              }}
              editable={isMainIncBlows4Active}
              style={(isMainIncBlows4Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
            <TextInput
              value={mainIncPen4Str}
              onChangeText={(text: string) => {
                setMainIncPen4Str(text);
                resetRecoveryLength();
                const mainIncPen4: number = parseInt(text);
                if (isNaN(mainIncPen4)) {
                  return;
                }
                if (mainIncPen4 > 75) {
                  setMainIncPen4Str('75');
                }
              }}
              editable={isMainIncPen4Active}
              style={(isMainIncPen4Active) ? styles.smallInputBoxActive : styles.smallInputBoxInactive}
              keyboardType='numeric'
            />
          </View>
        </View>
      </View>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>Recovery(mm)<Text style={{ color: 'red' }}>*</Text>: </Text>
      <TextInput
        value={recoveryLengthInMillimetresStr}
        onChangeText={(text: string) => {
          const totalPenetrationDepthInMillimetres: number = (
            parseInt((!seatingIncPen1Str) ? '0' : seatingIncPen1Str)
            + parseInt((!seatingIncPen2Str) ? '0' : seatingIncPen2Str)
            + parseInt((!mainIncPen1Str) ? '0' : mainIncPen1Str)
            + parseInt((!mainIncPen2Str) ? '0' : mainIncPen2Str)
            + parseInt((!mainIncPen3Str) ? '0' : mainIncPen3Str)
            + parseInt((!mainIncPen4Str) ? '0' : mainIncPen4Str)
          );
          if (isNaN(totalPenetrationDepthInMillimetres) || totalPenetrationDepthInMillimetres === 0) {
            return;
          }
          setRecoveryLengthInMillimetresStr(text);
          const recoveryLength: number = parseInt(text);
          if (isNaN(recoveryLength)) {
            return;
          }
          if (recoveryLength > totalPenetrationDepthInMillimetres) {
            setRecoveryLengthInMillimetresStr(totalPenetrationDepthInMillimetres.toString());
          }
        }}
        style={{ borderWidth: 0.5, textAlign: 'center', padding: 10, width: 70 }}
        keyboardType='numeric'
      />
      <Text>
        {(() => {
          const total = (
            parseInt((!seatingIncPen1Str) ? '0' : seatingIncPen1Str)
            + parseInt((!seatingIncPen2Str) ? '0' : seatingIncPen2Str)
            + parseInt((!mainIncPen1Str) ? '0' : mainIncPen1Str)
            + parseInt((!mainIncPen2Str) ? '0' : mainIncPen2Str)
            + parseInt((!mainIncPen3Str) ? '0' : mainIncPen3Str)
            + parseInt((!mainIncPen4Str) ? '0' : mainIncPen4Str)
          );
          return (total > 0) ? `   /   ${total}` : null;
        })()}
      </Text>
    </View>
    <SoilPropertiesInputQuestions 
      recovery={parseInt(recoveryLengthInMillimetresStr)}
      soilPositionType={DEFAULT_SOIL_POSITION_TYPE}
      dominantColour={dominantColour} setDominantColour={setDominantColour} 
      secondaryColour={secondaryColour} setSecondaryColour={setSecondaryColour} 
      dominantSoilType={dominantSoilType} setDominantSoilType={setDominantSoilType} 
      secondarySoilType={secondarySoilType} setSecondarySoilType={setSecondarySoilType} 
      otherProperties={otherProperties} setOtherProperties={setOtherProperties} 
    />
    </>
  );
}

const styles = StyleSheet.create({
	smallInputBoxActive: {
		borderWidth: 0.5, 
		textAlign: 'center', 
		paddingVertical: 10,
		backgroundColor: 'transparent',
	},
	smallInputBoxInactive: {
		borderWidth: 0.5, 
		textAlign: 'center', 
		paddingVertical: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
	}
});