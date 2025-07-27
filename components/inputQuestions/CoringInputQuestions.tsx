import React, { useState } from "react";
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { CORING_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";
import { Colour, DOMINANT_COLOUR_LIST, SECONDARY_COLOUR_LIST } from "@/constants/colour";
import { OTHER_PROPERTIES_LIST_BASED_ON_ROCK_TYPE, ROCK_TYPE_LIST, RockType } from "@/constants/rock";
import { Block, CORING_BLOCK_TYPE } from "@/interfaces/Block";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { stringToDecimalPoint } from "@/utils/numbers";
import { styles } from "@/constants/styles";

type CoringInputQuestionsProps = {
  dayWorkStatusType: DayWorkStatusType; setDayWorkStatusType: React.Dispatch<React.SetStateAction<DayWorkStatusType>>;
  dayStartWorkDate: Date; setDayStartWorkDate: React.Dispatch<React.SetStateAction<Date>>;
  dayStartWorkTime: Date; setDayStartWorkTime: React.Dispatch<React.SetStateAction<Date>>;
  dayEndWorkDate: Date; setDayEndWorkDate: React.Dispatch<React.SetStateAction<Date>>;
  dayEndWorkTime: Date; setDayEndWorkTime: React.Dispatch<React.SetStateAction<Date>>;
  waterLevelInMetresStr: string; setWaterLevelInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  casingDepthInMetresStr: string; setCasingDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  topDepthInMetresStr: string; setTopDepthInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  coreRunInMetresStr: string; setCoreRunInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  coreRecoveryInMetresStr: string; setCoreRecoveryInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  rqdInMetresStr: string; setRqdInMetresStr: React.Dispatch<React.SetStateAction<string>>;
  dominantColour: Colour | null; setDominantColour: React.Dispatch<React.SetStateAction<Colour | null>>;
  isSelectDominantColourPressed: boolean; setIsSelectDominantColourPressed: React.Dispatch<React.SetStateAction<boolean>>;
  secondaryColour: Colour | null; setSecondaryColour: React.Dispatch<React.SetStateAction<Colour | null>>;
  isSelectSecondaryColourPressed: boolean; setIsSelectSecondaryColourPressed: React.Dispatch<React.SetStateAction<boolean>>;
  rockType: RockType | null; setRockType: React.Dispatch<React.SetStateAction<RockType | null>>;
  isSelectRockTypePressed: boolean; setIsSelectRockTypePressed: React.Dispatch<React.SetStateAction<boolean>>;
  otherRockType: string; setOtherRockType: React.Dispatch<React.SetStateAction<string>>;
  otherProperties: string; setOtherProperties: React.Dispatch<React.SetStateAction<string>>;
  isSelectOtherPropertiesPressed: boolean; setIsSelectOtherPropertiesPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function CoringInputQuestions({
  dayWorkStatusType, setDayWorkStatusType,
  dayStartWorkDate, setDayStartWorkDate,
  dayStartWorkTime, setDayStartWorkTime,
  dayEndWorkDate, setDayEndWorkDate,
  dayEndWorkTime, setDayEndWorkTime,
  waterLevelInMetresStr, setWaterLevelInMetresStr,
  casingDepthInMetresStr, setCasingDepthInMetresStr,
  topDepthInMetresStr, setTopDepthInMetresStr,
  coreRunInMetresStr, setCoreRunInMetresStr,
  coreRecoveryInMetresStr, setCoreRecoveryInMetresStr,
  rqdInMetresStr, setRqdInMetresStr,
  dominantColour, setDominantColour,
  isSelectDominantColourPressed, setIsSelectDominantColourPressed,
  secondaryColour, setSecondaryColour,
  isSelectSecondaryColourPressed, setIsSelectSecondaryColourPressed,
  rockType, setRockType,
  isSelectRockTypePressed, setIsSelectRockTypePressed,
  otherRockType, setOtherRockType,
  otherProperties, setOtherProperties,
  isSelectOtherPropertiesPressed, setIsSelectOtherPropertiesPressed,
  }: CoringInputQuestionsProps) {

  const resetCoreRecovery = () => {
    setCoreRecoveryInMetresStr('');
  };
  const resetRqd = () => {
    setRqdInMetresStr('');
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
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>Core Run(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
      <TextInput
        value={coreRunInMetresStr}
        onChangeText={(text: string) => {
          setCoreRunInMetresStr(text);
          resetCoreRecovery();
          resetRqd();
        }}
        style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
        keyboardType='numeric'
      />
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>Core Recovery(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
      <TextInput
        value={coreRecoveryInMetresStr}
        onChangeText={(text: string) => {
          const coreRunInMetres: number = stringToDecimalPoint(coreRunInMetresStr, 3);
          if (isNaN(coreRunInMetres) || coreRunInMetres <= 0) {
            return;
          }
          setCoreRecoveryInMetresStr(text);
          const coreRecoveryInMetres: number = stringToDecimalPoint(text, 3);
          if (isNaN(coreRecoveryInMetres)) {
            return;
          }
          if (coreRecoveryInMetres > coreRunInMetres) {
            setCoreRecoveryInMetresStr(coreRunInMetres.toString());
          }
        }}
        style={{ borderWidth: 0.5, textAlign: 'center', padding: 10, width: 70 }}
        keyboardType='numeric'
      />
      <Text>
        {(() => {
          const coreRunInMetres: number = stringToDecimalPoint(coreRunInMetresStr, 3);
          return (coreRunInMetres > 0) ? `   /   ${coreRunInMetres}` : undefined;
        })()}
      </Text>
    </View>
    {
      !isNaN(parseFloat(coreRecoveryInMetresStr)) && stringToDecimalPoint(coreRecoveryInMetresStr, 3) > 0 && (
        <>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>R.Q.D.(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
          <TextInput
            value={rqdInMetresStr}
            onChangeText={(text: string) => {
              const coreRecoveryInMetres: number = stringToDecimalPoint(coreRecoveryInMetresStr, 3);
              if (isNaN(coreRecoveryInMetres) || coreRecoveryInMetres <= 0) {
                return;
              }
              setRqdInMetresStr(text);
              const rqdInMetres: number = stringToDecimalPoint(text, 3);
              if (isNaN(rqdInMetres)) {
                return;
              }
              if (rqdInMetres > coreRecoveryInMetres) {
                setRqdInMetresStr(coreRecoveryInMetres.toString());
              }
            }}
            style={{ borderWidth: 0.5, textAlign: 'center', padding: 10, width: 70 }}
            keyboardType='numeric'
          />
          <Text>
            {(() => {
              const coreRunInMetres: number = stringToDecimalPoint(coreRunInMetresStr, 3);
              return (coreRunInMetres > 0) ? `   /   ${coreRunInMetres}` : undefined;
            })()}
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ paddingVertical: 10 }}>Dominant Colour<Text style={{ color: 'red' }}>*</Text>: </Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                setIsSelectDominantColourPressed(prev => !prev);
              }}
              style={{
                borderWidth: 0.5,
                alignItems: 'center',
                padding: 10,
                width: '100%',
                backgroundColor: (!dominantColour) ? 'transparent' : dominantColour.colourCode,
              }}>
              {
                (!dominantColour) 
                ? <Text></Text> 
                : <Text style={{ color: dominantColour.colourTagFontColour }}>{dominantColour.colourTag}</Text>
              }
            </TouchableOpacity>
            {
              isSelectDominantColourPressed && (
                <FlatList
                  data={DOMINANT_COLOUR_LIST}
                  keyExtractor={item => item.colourCode}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        Keyboard.dismiss();
                        setDominantColour(item);
                        setIsSelectDominantColourPressed(false);
                        setSecondaryColour(null);
                        setIsSelectSecondaryColourPressed(false);
                      }}
                      style={[styles.listItem, { backgroundColor: item.colourCode }]}>
                      <Text style={{ color: item.colourTagFontColour }}>{item.colourTag}</Text>
                    </TouchableOpacity>
                  )}
                  nestedScrollEnabled={true}
                  style={{ maxHeight: 500 }}
                />
              )
            }
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ paddingVertical: 10 }}>Secondary Colour: </Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                setIsSelectSecondaryColourPressed(prev => !prev);
              }}
              style={{
                borderWidth: 0.5,
                alignItems: 'center',
                padding: 10,
                width: '100%',
                backgroundColor: (!secondaryColour) ? 'transparent' : secondaryColour.colourCode,
              }}>
              {
                (!secondaryColour) 
                ? <Text></Text> 
                : <Text style={{ color: secondaryColour.colourTagFontColour }}>{secondaryColour.colourTag}</Text>
              }
            </TouchableOpacity>
            {
              isSelectSecondaryColourPressed && (
                <FlatList
                  data={SECONDARY_COLOUR_LIST.filter((colour: Colour) => dominantColour && colour.colourFamily != dominantColour.colourFamily)}
                  keyExtractor={item => item.colourCode}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        Keyboard.dismiss();
                        setSecondaryColour(item);
                        setIsSelectSecondaryColourPressed(false);
                      }}
                      style={[styles.listItem, { backgroundColor: item.colourCode }]}>
                      <Text style={{ color: item.colourTagFontColour }}>{item.colourTag}</Text>
                    </TouchableOpacity>
                  )}
                  nestedScrollEnabled={true}
                  style={{ maxHeight: 500 }}
                />
              )
            }
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ paddingVertical: 10 }}>Rock Type<Text style={{ color: 'red' }}>*</Text>: </Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                setIsSelectRockTypePressed(prev => !prev);
              }}
              style={{
                borderWidth: 0.5,
                alignItems: 'center',
                padding: 10,
                width: '100%',
              }}>
              <Text>{rockType}</Text>
            </TouchableOpacity>
            {
              isSelectRockTypePressed && (
                <FlatList
                  data={ROCK_TYPE_LIST}
                  keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        Keyboard.dismiss();
                        setRockType(item);
                        setIsSelectRockTypePressed(false);
                        setOtherRockType('');
                      }}
                      style={[styles.listItem]}>
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 500 }}
                />
              )
            }
            {
              rockType === 'OTHERS' && (
                <TextInput
                  value={otherRockType}
                  onChangeText={(text: string) => {
                    setOtherRockType(text.toUpperCase());
                  }}
                  style={{ borderWidth: 0.5, padding: 10, textAlign: 'center' }}
                />
              )
            }
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ paddingVertical: 10 }}>Other Properties: </Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                setIsSelectOtherPropertiesPressed(prev => !prev);
              }}
              style={{
                borderWidth: 0.5,
                alignItems: 'center',
                padding: 10,
                width: '100%',
              }}>
              <Text>{otherProperties}</Text>
            </TouchableOpacity>
            {
              isSelectOtherPropertiesPressed && (
                <FlatList
                  data={(!rockType) ? [] : OTHER_PROPERTIES_LIST_BASED_ON_ROCK_TYPE[rockType]}
                  keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        Keyboard.dismiss();
                        setOtherProperties(item);
                        setIsSelectOtherPropertiesPressed(false);
                      }}
                      style={[styles.listItem]}>
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 500 }}
                />
              )
            }
          </View>
        </View>
        </>
      )
    }
    </>
  );
}
