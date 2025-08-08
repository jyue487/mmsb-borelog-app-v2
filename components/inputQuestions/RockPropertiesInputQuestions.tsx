import React, { useState } from "react";
import { Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { OTHER_PROPERTIES_LIST_BASED_ON_ROCK_TYPE, ROCK_TYPE_LIST, RockType } from "@/constants/rock";
import { styles } from "@/constants/styles";
import { RockProperties } from "@/interfaces/RockProperties";

type Props = {
  rockProperties: RockProperties;
  setRockProperties: React.Dispatch<React.SetStateAction<RockProperties>>;
}

export function RockPropertiesInputQuestions({
  rockProperties,
  setRockProperties
}: Props) {

  const [rockType, setRockType] = useState<RockType | null>(rockProperties.rockType);
  const [otherRockType, setOtherRockType] = useState<string>(rockProperties.otherRockType);
  const [otherProperties, setOtherProperties] = useState<string>(rockProperties.otherProperties);
  const [isSelectRockTypePressed, setIsSelectRockTypePressed] = useState<boolean>(false);
  const [isSelectOtherPropertiesPressed, setIsSelectOtherPropertiesPressed] = useState<boolean>(false);

  const selectRockType = (rockType: RockType) => {
    setRockType(rockType);
    setIsSelectRockTypePressed(false);
    setOtherRockType('');
    setRockProperties((rp: RockProperties): RockProperties => ({...rp, rockType: rockType, otherRockType: ''}));
  };
  const saveOtherRockType = (otherRockType: string) => {
    setOtherRockType(otherRockType.toUpperCase());
    setRockProperties((rp: RockProperties): RockProperties => ({...rp, otherRockType: otherRockType}));
  };
  const selectOtherProperties = (otherProperties: string) => {
    setOtherProperties(otherProperties);
    setIsSelectOtherPropertiesPressed(false);
    setRockProperties((rp: RockProperties): RockProperties => ({...rp, otherProperties: otherProperties}));
  }

  return (
    <>
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
                    selectRockType(item);
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
              onChangeText={saveOtherRockType}
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
                    selectOtherProperties(item)
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
  );
}