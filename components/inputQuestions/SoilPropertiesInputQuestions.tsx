import { useState } from "react";
import { View, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";

import {
  CUSTOM_OTHER_PROPERTIES_FOR_SOIL,
	DOMINANT_SOIL_TYPE_LIST,
	DominantSoilType,
	OTHER_PROPERTIES_LIST_BASED_ON_DOMINANT_SOIL_TYPE,
	SECONDARY_SOIL_TYPE_LIST_BASED_ON_DOMINANT_SOIL_TYPE,
	SecondarySoilType
} from "@/constants/soil";
import { styles } from "@/constants/styles";
import { SoilProperties } from "@/interfaces/SoilProperties";

export type SoilPropertiesInputQuestionsProps = {
  questionPrefix: string;
  soilProperties: SoilProperties;
  setSoilProperties: React.Dispatch<React.SetStateAction<SoilProperties>>;
}

export function SoilPropertiesInputQuestions({
  questionPrefix,
  soilProperties,
  setSoilProperties,
}: SoilPropertiesInputQuestionsProps) {

  const [dominantSoilType, setDominantSoilType] = useState<DominantSoilType | null>(soilProperties.dominantSoilType);
  const [secondarySoilType, setSecondarySoilType] = useState<SecondarySoilType | null>(soilProperties.secondarySoilType);
  const [otherProperties, setOtherProperties] = useState<string>(soilProperties.otherProperties);
  const [customOtherProperties, setCustomOtherProperties] = useState<string>(soilProperties.customOtherProperties);
  const [isSelectDominantSoilTypePressed, setIsSelectDominantSoilTypePressed] = useState<boolean>(false);
  const [isSelectSecondarySoilTypePressed, setIsSelectSecondarySoilTypePressed] = useState<boolean>(false);
  const [isSelectOtherPropertiesPressed, setIsSelectOtherPropertiesPressed] = useState<boolean>(false);

  const selectDominantSoilType = (dominantSoilType: DominantSoilType) => {
    setDominantSoilType(dominantSoilType);
    setIsSelectDominantSoilTypePressed(false);
    setSoilProperties((sp: SoilProperties): SoilProperties => ({...sp, dominantSoilType: dominantSoilType}));
  };
  const selectSecondarySoilType = (secondarySoilType: SecondarySoilType) => {
    setSecondarySoilType(secondarySoilType);
    setIsSelectSecondarySoilTypePressed(false);
    setSoilProperties((sp: SoilProperties): SoilProperties => ({...sp, secondarySoilType: secondarySoilType}));
  };
  const selectOtherProperties = (otherProperties: string) => {
    setOtherProperties(otherProperties);
    setIsSelectOtherPropertiesPressed(false);
    setSoilProperties((sp: SoilProperties): SoilProperties => ({...sp, otherProperties: otherProperties}));
  };
  const saveCustomOtherProperties = (customOtherProperties: string) => {
    setCustomOtherProperties(customOtherProperties);
    setSoilProperties((sp: SoilProperties): SoilProperties => ({...sp, customOtherProperties: customOtherProperties}));
  };
  const resetSecondarySoilType = () => {
    setSecondarySoilType(null);
    setIsSelectSecondarySoilTypePressed(false);
    setSoilProperties((sp: SoilProperties): SoilProperties => ({...sp, secondarySoilType: null}));
  };

  return (
    <>
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ paddingVertical: 10 }}>{questionPrefix}Dominant Soil Type<Text style={{ color: 'red' }}>*</Text>: </Text>
      <View style={{ flex: 1 }}>
        <TouchableOpacity 
          onPress={() => {
            Keyboard.dismiss();
            setIsSelectDominantSoilTypePressed(prev => !prev);
          }}
          style={{
            borderWidth: 0.5,
            alignItems: 'center',
            padding: 10,
            width: '100%',
          }}>
          <Text>{dominantSoilType}</Text>
        </TouchableOpacity>
        {
          isSelectDominantSoilTypePressed && (
            <FlatList
              data={DOMINANT_SOIL_TYPE_LIST}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    selectDominantSoilType(item);
                    resetSecondarySoilType();
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
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ paddingVertical: 10 }}>{questionPrefix}Secondary Soil Type: </Text>
      <View style={{ flex: 1 }}>
        <TouchableOpacity 
          onPress={() => {
            Keyboard.dismiss();
            setIsSelectSecondarySoilTypePressed(prev => !prev);
          }}
          style={{
            borderWidth: 0.5,
            alignItems: 'center',
            padding: 10,
            width: '100%',
          }}>
          <Text>{secondarySoilType}</Text>
        </TouchableOpacity>
        {
          isSelectSecondarySoilTypePressed && (
            <FlatList
              data={(!dominantSoilType) ? [] : SECONDARY_SOIL_TYPE_LIST_BASED_ON_DOMINANT_SOIL_TYPE[dominantSoilType]}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    selectSecondarySoilType(item);
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
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ paddingVertical: 10 }}>{questionPrefix}Other Properties: </Text>
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
              data={(!dominantSoilType) ? [] : OTHER_PROPERTIES_LIST_BASED_ON_DOMINANT_SOIL_TYPE[dominantSoilType]}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    selectOtherProperties(item);
                  }}
                  style={[styles.listItem]}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )
        }
        {
          otherProperties === CUSTOM_OTHER_PROPERTIES_FOR_SOIL && (
            <TextInput
              value={customOtherProperties}
              onChangeText={saveCustomOtherProperties}
              style={{ borderWidth: 0.5, padding: 10, textAlign: 'center' }}
            />
          )
        }
      </View>
    </View>
    </>
  );
}
