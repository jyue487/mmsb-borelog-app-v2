import React, { useState } from "react";
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";

import { DayWorkStatusInputQuestions } from '@/components/inputQuestions/DayWorkStatusInputQuestions';
import { PS_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";
import { DAY_CONTINUE_WORK_TYPE, DayWorkStatus, DayWorkStatusType } from "@/constants/DayStatus";
import { Colour } from "@/constants/colour";
import {
  DominantSoilType,
  SecondarySoilType
} from "@/constants/soil";
import { BaseBlock, Block, PS_BLOCK_TYPE } from "@/interfaces/Block";
import { checkAndReturnDayWorkStatus } from "@/utils/checkFunctions/checkAndReturnDayWorkStatus";
import { isNonNegativeFloat, stringToDecimalPoint } from "@/utils/numbers";
import { constructUndisturbedSampleSoilDescription } from "@/utils/undisturbedSampleSoilDescription";
import { BOTTOM_SOIL_POSITION_TYPE, SoilPropertiesInputQuestions, TOP_SOIL_POSITION_TYPE } from "../../../inputQuestions/SoilPropertiesInputQuestions";
import { PsBlock } from "@/interfaces/PsBlock";
import { styles } from "@/constants/styles";

export type EditPsBlockDetailsInputFormProps = ViewProps & {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  oldBlock: BaseBlock & PsBlock;
  setIsEditState: React.Dispatch<React.SetStateAction<boolean>>;
};

export function EditPsBlockDetailsInputForm({ style, blocks, setBlocks, oldBlock, setIsEditState, ...otherProps }: EditPsBlockDetailsInputFormProps) {
  const [dayWorkStatusType, setDayWorkStatusType] = useState<DayWorkStatusType>(oldBlock.dayWorkStatus.dayWorkStatusType);
  const [dayStartWorkDate, setDayStartWorkDate] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.date);
  const [dayStartWorkTime, setDayStartWorkTime] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.time);
  const [dayEndWorkDate, setDayEndWorkDate] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.date);
  const [dayEndWorkTime, setDayEndWorkTime] = useState<Date>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? new Date() : oldBlock.dayWorkStatus.time);
  const [waterLevelInMetresStr, setWaterLevelInMetresStr] = useState<string>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : oldBlock.dayWorkStatus.waterLevelInMetres?.toFixed(3) ?? '');
  const [casingDepthInMetresStr, setCasingDepthInMetresStr] = useState<string>((oldBlock.dayWorkStatus.dayWorkStatusType === DAY_CONTINUE_WORK_TYPE) ? '' : oldBlock.dayWorkStatus.casingDepthInMetres?.toFixed(3) ?? '');
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>(oldBlock.topDepthInMetres.toFixed(3));
  const [penetrationDepthInMetresStr, setPenetrationDepthInMetresStr] = useState<string>(oldBlock.penetrationDepthInMetres.toFixed(3));
  const [topDominantColour, setTopDominantColour] = useState<Colour | null>(oldBlock.topDominantColour);
  const [topSecondaryColour, setTopSecondaryColour] = useState<Colour | null>(oldBlock.topSecondaryColour);
  const [topDominantSoilType, setTopDominantSoilType] = useState<DominantSoilType | null>(oldBlock.topDominantSoilType);
  const [topSecondarySoilType, setTopSecondarySoilType] = useState<SecondarySoilType | null>(oldBlock.topSecondarySoilType);
  const [topOtherProperties, setTopOtherProperties] = useState<string>(oldBlock.topOtherProperties);
  const [baseDitto, setBaseDitto] = useState<boolean>(oldBlock.baseDitto);
  const [isSelectBaseDittoPressed, setIsSelectBaseDittoPressed] = useState<boolean>(false);
  const [baseDominantColour, setBaseDominantColour] = useState<Colour | null>(oldBlock.baseDominantColour);
  const [baseSecondaryColour, setBaseSecondaryColour] = useState<Colour | null>(oldBlock.baseSecondaryColour);
  const [baseDominantSoilType, setBaseDominantSoilType] = useState<DominantSoilType | null>(oldBlock.baseDominantSoilType);
  const [baseSecondarySoilType, setBaseSecondarySoilType] = useState<SecondarySoilType | null>(oldBlock.baseSecondarySoilType);
  const [baseOtherProperties, setBaseOtherProperties] = useState<string>(oldBlock.baseOtherProperties);
  const [recoveryLengthInMetresStr, setRecoveryLengthInMetresStr] = useState<string>(oldBlock.recoveryLengthInMetres.toFixed(3));

  const resetRecoveryLength = () => {
    setRecoveryLengthInMetresStr('');
  };

  return (
    <GestureHandlerRootView style={styles.inputForm}>
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
        <Text>Penetration Depth(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
        <TextInput
          value={penetrationDepthInMetresStr}
          onChangeText={(text: string) => {
            resetRecoveryLength();
            setPenetrationDepthInMetresStr(text);
            const penetrationDepthInMetres: number = parseFloat(text);
            if (isNaN(penetrationDepthInMetres)) {
              return;
            }
            if (penetrationDepthInMetres > 1) {
              setPenetrationDepthInMetresStr('1');
            }
          }}
          style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
          keyboardType='numeric'
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Recovery(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
        <TextInput
          value={recoveryLengthInMetresStr}
          onChangeText={(text: string) => {
            const penetrationDepthInMetres: number = stringToDecimalPoint(penetrationDepthInMetresStr, 3);
            if (isNaN(penetrationDepthInMetres)) {
              return;
            }
            setRecoveryLengthInMetresStr(text);
            const recoveryLengthInMetres: number = stringToDecimalPoint(text, 3);
            if (isNaN(recoveryLengthInMetres)) {
              return;
            }
            if (recoveryLengthInMetres > penetrationDepthInMetres) {
              setRecoveryLengthInMetresStr(penetrationDepthInMetres.toString());
            }
          }}
          style={{ borderWidth: 0.5, textAlign: 'center', padding: 10, width: 70 }}
          keyboardType='numeric'
        />
        <Text>
          {(() => {
            const penetrationDepthInMetres: number = stringToDecimalPoint(penetrationDepthInMetresStr, 3);
            return (penetrationDepthInMetres > 0) ? `   /   ${penetrationDepthInMetres}` : undefined;
          })()}
        </Text>
      </View>
      <SoilPropertiesInputQuestions
        recovery={stringToDecimalPoint(recoveryLengthInMetresStr, 3)}
        soilPositionType={TOP_SOIL_POSITION_TYPE}
        dominantColour={topDominantColour} setDominantColour={setTopDominantColour}
        secondaryColour={topSecondaryColour} setSecondaryColour={setTopSecondaryColour}
        dominantSoilType={topDominantSoilType} setDominantSoilType={setTopDominantSoilType}
        secondarySoilType={topSecondarySoilType} setSecondarySoilType={setTopSecondarySoilType}
        otherProperties={topOtherProperties} setOtherProperties={setTopOtherProperties}
      />
      {
        (!isNaN(parseFloat(recoveryLengthInMetresStr)) && stringToDecimalPoint(recoveryLengthInMetresStr, 3) > 0) && (
          <>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ paddingVertical: 10 }}>Bottom Ditto?<Text style={{ color: 'red' }}>*</Text>: </Text>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsSelectBaseDittoPressed(prev => !prev);
                  }}
                  style={{
                    borderWidth: 0.5,
                    alignItems: 'center',
                    padding: 10,
                    width: '100%',
                  }}>
                  <Text>{baseDitto ? 'YES' : 'NO'}</Text>
                </TouchableOpacity>
                {
                  isSelectBaseDittoPressed && (
                    <FlatList
                      data={['YES', 'NO']}
                      keyExtractor={item => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => {
                            Keyboard.dismiss();
                            setBaseDitto((item === 'YES') ? true : false);
                            setIsSelectBaseDittoPressed(false);
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
              !baseDitto && (
                <SoilPropertiesInputQuestions
                  recovery={stringToDecimalPoint(recoveryLengthInMetresStr, 3)}
                  soilPositionType={BOTTOM_SOIL_POSITION_TYPE}
                  dominantColour={baseDominantColour} setDominantColour={setBaseDominantColour}
                  secondaryColour={baseSecondaryColour} setSecondaryColour={setBaseSecondaryColour}
                  dominantSoilType={baseDominantSoilType} setDominantSoilType={setBaseDominantSoilType}
                  secondarySoilType={baseSecondarySoilType} setSecondarySoilType={setBaseSecondarySoilType}
                  otherProperties={baseOtherProperties} setOtherProperties={setBaseOtherProperties}
                />
              )
            }
          </>
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
          if (!isNonNegativeFloat(topDepthInMetresStr)) {
            alert('Error: Top Depth');
            return;
          }
          if (!isNonNegativeFloat(penetrationDepthInMetresStr)) {
            alert('Error: Penetration Depth');
            return;
          }
          if (!isNonNegativeFloat(recoveryLengthInMetresStr)) {
            alert('Error: Recovery Length');
            return;
          }

          const topDepthInMetres: number = stringToDecimalPoint(topDepthInMetresStr, 3);
          const topDepthInMillimetres: number = topDepthInMetres * 1000;
          const penetrationDepthInMetres: number = stringToDecimalPoint(penetrationDepthInMetresStr, 3);
          const penetrationDepthInMillimetres: number = penetrationDepthInMetres * 1000;
          const baseDepthInMetres: number = (topDepthInMillimetres + penetrationDepthInMillimetres) / 1000;
          const recoveryLengthInMetres: number = stringToDecimalPoint(recoveryLengthInMetresStr, 3);
          const recoveryInPercentage: number = parseFloat((recoveryLengthInMetres / penetrationDepthInMetres * 100).toFixed(1));

          const soilDescription: string | null = constructUndisturbedSampleSoilDescription({
            recoveryLengthInMetres: recoveryLengthInMetres,
            topDominantColour: topDominantColour,
            topSecondaryColour: topSecondaryColour,
            topDominantSoilType: topDominantSoilType,
            topSecondarySoilType: topSecondarySoilType,
            topOtherProperties: topOtherProperties,
            baseDitto: baseDitto,
            baseDominantColour: baseDominantColour,
            baseSecondaryColour: baseSecondaryColour,
            baseDominantSoilType: baseDominantSoilType,
            baseSecondarySoilType: baseSecondarySoilType,
            baseOtherProperties: baseOtherProperties,
          });
          if (!soilDescription) {
            return;
          }

          const pistonSampleIndex: number = (recoveryLengthInMetres === 0) ? -1 : blocks.filter((block: Block) => block.blockType === PS_BLOCK_TYPE && block.recoveryInPercentage > 0).length + 1;

          const newBlock: Block = {
            id: blocks.length + 1,
            blockTypeId: PS_BLOCK_TYPE_ID,
            blockType: PS_BLOCK_TYPE,
            boreholeId: oldBlock.boreholeId,
            blockId: 1,
            pistonSampleIndex: pistonSampleIndex,
            dayWorkStatus: dayWorkStatus,
            topDepthInMetres: topDepthInMetres,
            baseDepthInMetres: baseDepthInMetres,
            soilDescription: soilDescription,
            recoveryInPercentage: recoveryInPercentage,
            penetrationDepthInMetres: penetrationDepthInMetres,
            topDominantColour: topDominantColour,
            topSecondaryColour: topSecondaryColour,
            topDominantSoilType: topDominantSoilType,
            topSecondarySoilType: topSecondarySoilType,
            topOtherProperties: topOtherProperties,
            baseDitto: baseDitto,
            isSelectBaseDittoPressed: isSelectBaseDittoPressed,
            baseDominantColour: baseDominantColour,
            baseSecondaryColour: baseSecondaryColour,
            baseDominantSoilType: baseDominantSoilType,
            baseSecondarySoilType: baseSecondarySoilType,
            baseOtherProperties: baseOtherProperties,
            recoveryLengthInMetres: recoveryLengthInMetres,
          };
          setBlocks((blocks: Block[]) => {
            let pistonSampleIndex: number = 1;
            return blocks.map((b: Block) => {
              if (b.blockType !== PS_BLOCK_TYPE) {
                return b;
              }
              const updatedBlock: Block = (b === oldBlock) ? { ...newBlock } : { ...b };
              updatedBlock.id = b.id;
              updatedBlock.pistonSampleIndex = (updatedBlock.recoveryInPercentage === 0) ? -1 : pistonSampleIndex++;
              return updatedBlock;
            });
          });
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
