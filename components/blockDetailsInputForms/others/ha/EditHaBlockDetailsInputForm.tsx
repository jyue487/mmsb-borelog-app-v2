import React, { useState } from "react";
import { Button, Keyboard, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { HA_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";
import { Colour } from "@/constants/colour";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";
import { DominantSoilType, SecondarySoilType } from "@/constants/soil";
import { styles } from "@/constants/styles";
import { BaseBlock, Block, HA_BLOCK_TYPE } from "@/interfaces/Block";
import { HaBlock } from "@/interfaces/HaBlock";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { DEFAULT_SOIL_POSITION_TYPE, SoilPropertiesInputQuestions } from "../../../inputQuestions/SoilPropertiesInputQuestions";

export type EditHaBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  oldBlock: BaseBlock & HaBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditHaBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditHaBlockDetailsInputFormProps) {
  const [dayWorkStatusType, setDayWorkStatusType] = useState<DayWorkStatusType>(oldBlock.dayWorkStatus.dayWorkStatusType);
  const [dayStartWorkDate, setDayStartWorkDate] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.date);
  const [dayStartWorkTime, setDayStartWorkTime] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.time);
  const [dayEndWorkDate, setDayEndWorkDate] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.date);
  const [dayEndWorkTime, setDayEndWorkTime] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.time);
  const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : oldBlock.dayWorkStatus.waterLevelInMetres?.toFixed(3) ?? '');
  const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : oldBlock.dayWorkStatus.casingDepthInMetres?.toFixed(3) ?? '');
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(oldBlock.topDepthInMetres.toFixed(3));
  const [baseDepthInMetresStr, setBaseDepthInMetresStr] = useState<string>(oldBlock.baseDepthInMetres.toFixed(3));
  const [requireSample, setRequireSample] = useState<boolean>(oldBlock.requireSample);
  const [isSelectRequireSamplePressed, setIsSelectRequireSamplePressed] = useState<boolean>(false);
  const [dominantColour, setDominantColour] = useState<Colour | null>(oldBlock.dominantColour);
  const [secondaryColour, setSecondaryColour] = useState<Colour | null>(oldBlock.secondaryColour);
  const [dominantSoilType, setDominantSoilType] = useState<DominantSoilType | null>(oldBlock.dominantSoilType);
  const [secondarySoilType, setSecondarySoilType] = useState<SecondarySoilType | null>(oldBlock.secondarySoilType);
  const [otherProperties, setOtherProperties] = useState<string>(oldBlock.otherProperties);

  return (
    <GestureHandlerRootView style={styles.blockDetailsInputForm}>
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

          const haSampleIndex: number = blocks.filter((block: Block) => block.blockType === HA_BLOCK_TYPE).length + 1;

          const newBlock: Block = {
            id: blocks.length + 1,
            blockTypeId: HA_BLOCK_TYPE_ID,
            blockType: HA_BLOCK_TYPE,
            boreholeId: oldBlock.boreholeId, 
            blockId: 1,
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
          setBlocks((blocks: Block[]) => blocks.map((b: Block) => (b === oldBlock) ? {...newBlock, id: b.id, blockId: b.blockId, haSampleIndex: b.haSampleIndex} : b));
          setIsEditState(false);
        }}
      />
      <Button 
        title='Cancel'
        onPress={() => setIsEditState(false)} 
      />
    </GestureHandlerRootView>
  );
}
