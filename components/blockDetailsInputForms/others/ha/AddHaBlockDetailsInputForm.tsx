import React, { useState } from "react";
import { Button, Keyboard, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { Colour } from "@/constants/colour";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";
import { DominantSoilType, SecondarySoilType } from "@/constants/soil";
import { styles } from "@/constants/styles";
import { Block, HA_BLOCK_TYPE_ID } from "@/interfaces/Block";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { DEFAULT_SOIL_POSITION_TYPE, SoilPropertiesInputQuestions } from "../../../inputQuestions/SoilPropertiesInputQuestions";

export type AddHaBlockDetailsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
};

export function AddHaBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: AddHaBlockDetailsInputFormProps) {
  const [dayWorkStatusType, setDayWorkStatusType] = useState<DayWorkStatusType>(DAY_CONTINUE_WORK_TYPE);
  const [dayStartWorkDate, setDayStartWorkDate] = useState<Date>(new Date());
  const [dayStartWorkTime, setDayStartWorkTime] = useState<Date>(new Date());
  const [dayEndWorkDate, setDayEndWorkDate] = useState<Date>(new Date());
  const [dayEndWorkTime, setDayEndWorkTime] = useState<Date>(new Date());
  const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>('');
  const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>('');
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>('');
  const [requireSample, setRequireSample] = useState<boolean>(false);
  const [isSelectRequireSamplePressed, setIsSelectRequireSamplePressed] = useState<boolean>(false);
  const [dominantColour, setDominantColour] = useState<Colour | null>(null);
  const [secondaryColour, setSecondaryColour] = useState<Colour | null>(null);
  const [dominantSoilType, setDominantSoilType] = useState<DominantSoilType | null>(null);
  const [secondarySoilType, setSecondarySoilType] = useState<SecondarySoilType | null>(null);
  const [otherProperties, setOtherProperties] = useState<string>('');

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
        <Text>Base Depth(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
        <TextInput
          value={baseDepthInMetresStr}
          onChangeText={setBaseDepthInMetresStr}
          style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
          keyboardType='numeric'
        />
      </View>

      <View style={{ flexDirection: 'row' }}>
        <Text style={{ paddingVertical: 10 }}>Require Sample?<Text style={{ color: 'red' }}>*</Text>: </Text>
        <View style={{ flex: 1 }}>
          <TouchableOpacity 
            onPress={() => {
              Keyboard.dismiss();
              setIsSelectRequireSamplePressed(prev => !prev);
            }}
            style={{
              borderWidth: 0.5,
              alignItems: 'center',
              padding: 10,
              width: '100%',
            }}>
            <Text>{requireSample ? 'YES' : 'NO'}</Text>
          </TouchableOpacity>
          {
            isSelectRequireSamplePressed && (
              <FlatList
                data={['YES', 'NO']}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => {
                      Keyboard.dismiss();
                      setRequireSample((item === 'YES') ? true : false);
                      setIsSelectRequireSamplePressed(false);
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
        requireSample && (
          <SoilPropertiesInputQuestions 
            recovery={1}
            soilPositionType={DEFAULT_SOIL_POSITION_TYPE}
            dominantColour={dominantColour} setDominantColour={setDominantColour} 
            secondaryColour={secondaryColour} setSecondaryColour={setSecondaryColour} 
            dominantSoilType={dominantSoilType} setDominantSoilType={setDominantSoilType} 
            secondarySoilType={secondarySoilType} setSecondarySoilType={setSecondarySoilType} 
            otherProperties={otherProperties} setOtherProperties={setOtherProperties} 
          />
        )
      }
      <Button
        title='Confirm'
        onPress={() => {
          const dayWorkStatus: DayWorkStatus | undefined = checkAndReturnDayWorkStatus({
            dayWorkStatusType: dayWorkStatusType,
            dayStartWorkDate: dayStartWorkDate,
            dayStartWorkTime: dayStartWorkTime,
            dayEndWorkDate: dayEndWorkDate,
            dayEndWorkTime: dayEndWorkTime,
            waterLevelInMetresStr: waterLevelInMetresStr,
            casingDepthInMetresStr: casingDepthInMetresStr,
          });
          if (!dayWorkStatus) {
            return;
          }
          if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
						alert('Error: Top Depth');
						return;
					}
          if (isNaN(parseFloat(baseDepthInMetresStr)) || parseFloat(baseDepthInMetresStr) < parseFloat(topDepthInMetresStr)) {
						alert('Error: Base Depth');
						return;
					}

          let description: string = '';
          if (!requireSample) {
            description = 'Hand Auger';
          } else {
            if (!dominantColour) {
              alert('Error: Dominant Colour');
              return;
            }
            if (!dominantSoilType) {
              alert('Error: Dominant Soil Type');
              return;
            }
            const totalColourLevel = dominantColour.level;
            if (totalColourLevel <= 1) {
              description += 'Dark';
            } else if (totalColourLevel <= 2) {
              description += 'Medium';
            } else if (totalColourLevel <= 3) {
              description += 'Light';
            } else {
              description += 'Pale';
            }
            if (!secondaryColour) {
              description += ` ${dominantColour.colourNameForSoilDescription}`;
            } else {
              description += ` ${secondaryColour.colourNameForSoilDescription} ${dominantColour.colourNameForSoilDescription}`;
            }
            if (!secondarySoilType) {
              description += ` ${dominantSoilType}`;
            } else {
              description += ` ${secondarySoilType} ${dominantSoilType}`;
            }
            if (otherProperties) {
              description += ` ${otherProperties}`;
            }
          }

          const topDepthInMetres: number = parseFloat(parseFloat(topDepthInMetresStr).toFixed(3));
          const baseDepthInMetres: number = parseFloat(parseFloat(baseDepthInMetresStr).toFixed(3));

          const haSampleIndex: number = blocks.filter((block: Block) => block.blockTypeId === HA_BLOCK_TYPE_ID).length + 1;

          const newHaBlock: Block = {
            id: blocks.length + 1,
            blockId: blocks.length + 1,
            blockTypeId: HA_BLOCK_TYPE_ID,
            boreholeId: boreholeId, 
            haSampleIndex: haSampleIndex,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetres: topDepthInMetres,
            baseDepthInMetres: baseDepthInMetres,
            description: description,
            requireSample: requireSample,
            dominantColour: dominantColour,
            secondaryColour: secondaryColour,
            dominantSoilType: dominantSoilType,
            secondarySoilType: secondarySoilType,
            otherProperties: otherProperties,
          };
          setBlocks(blocks => [...blocks, newHaBlock]);
          setIsAddNewBlockButtonPressed(false);
        }}
      />
    </>
  );
}
