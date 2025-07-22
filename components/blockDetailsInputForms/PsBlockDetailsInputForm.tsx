import React, { useState } from "react";
import { Button, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View, type ViewProps } from "react-native";
import { FlatList, GestureHandlerRootView } from "react-native-gesture-handler";

import { PS_BLOCK_TYPE_ID } from "@/constants/BlockTypeId";
import { Colour, DOMINANT_COLOUR_LIST, SECONDARY_COLOUR_LIST } from "@/constants/colour";
import {
  DOMINANT_SOIL_TYPE_LIST,
  DominantSoilType,
  OTHER_PROPERTIES_LIST_BASED_ON_DOMINANT_SOIL_TYPE,
  SECONDARY_SOIL_TYPE_LIST_BASED_ON_DOMINANT_SOIL_TYPE,
  SecondarySoilType
} from "@/constants/soil";
import { Block } from "@/types/Block";

export type PsBlockDetailsInputFormProps = ViewProps & {
  boreholeId: number;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  setIsAddNewBlockButtonPressed: (isPressed: boolean) => void;
};

export function PsBlockDetailsInputForm({ style, boreholeId, blocks, setBlocks, setIsAddNewBlockButtonPressed, ...otherProps }: PsBlockDetailsInputFormProps) {
  const [topDepthInMetresStr, setTopDepthInMetresStr] = useState<string>('');
  const [penetrationDepthInMetresStr, setPenetrationDepthInMetresStr] = useState<string>('');
  const [topDominantColour, setTopDominantColour] = useState<Colour>();
  const [isSelectTopDominantColourPressed, setIsSelectTopDominantColourPressed] = useState<boolean>(false);
  const [topSecondaryColour, setTopSecondaryColour] = useState<Colour>();
  const [isSelectTopSecondaryColourPressed, setIsSelectTopSecondaryColourPressed] = useState<boolean>(false);
  const [topDominantSoilType, setTopDominantSoilType] = useState<DominantSoilType>();
  const [isSelectTopDominantSoilTypePressed, setIsSelectTopDominantSoilTypePressed] = useState<boolean>(false);
  const [topSecondarySoilType, setTopSecondarySoilType] = useState<SecondarySoilType>();
  const [isSelectTopSecondarySoilTypePressed, setIsSelectTopSecondarySoilTypePressed] = useState<boolean>(false);
  const [topOtherProperties, setTopOtherProperties] = useState<string>('');
  const [isSelectTopOtherPropertiesPressed, setIsSelectTopOtherPropertiesPressed] = useState<boolean>(false);
  const [baseDitto, setBaseDitto] = useState<boolean>(true);
  const [isSelectBaseDitto, setIsSelectBaseDitto] = useState<boolean>(false);
  const [baseDominantColour, setBaseDominantColour] = useState<Colour>();
  const [isSelectBaseDominantColour, setIsSelectBaseDominantColourPressed] = useState<boolean>(false);
  const [baseSecondaryColour, setBaseSecondaryColour] = useState<Colour>();
  const [isSelectBaseSecondaryColourPressed, setIsSelectBaseSecondaryColourPressed] = useState<boolean>(false);
  const [baseDominantSoilType, setBaseDominantSoilType] = useState<DominantSoilType>();
  const [isSelectBaseDominantSoilTypePressed, setIsSelectBaseDominantSoilTypePressed] = useState<boolean>(false);
  const [baseSecondarySoilType, setBaseSecondarySoilType] = useState<SecondarySoilType>();
  const [isSelectBaseSecondarySoilTypePressed, setIsSelectBaseSecondarySoilTypePressed] = useState<boolean>(false);
  const [baseOtherProperties, setBaseOtherProperties] = useState<string>('');
  const [isSelectBaseOtherPropertiesPressed, setIsSelectBaseOtherPropertiesPressed] = useState<boolean>(false);
  const [recoveryLengthInMetresStr, setRecoveryLengthInMetresStr] = useState<string>('');

  const resetRecoveryLength = () => {
		setRecoveryLengthInMetresStr('');
	};

  return (
    <GestureHandlerRootView>
      <View style={{ paddingVertical: 20, gap: 20 }}>
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
              setPenetrationDepthInMetresStr(text);
              resetRecoveryLength();
            }}
            style={{ borderWidth: 0.5, alignItems: 'center', padding: 10, flex: 1 }}
            keyboardType='numeric'
          />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ paddingVertical: 10 }}>Top Dominant Colour<Text style={{ color: 'red' }}>*</Text>: </Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                setIsSelectTopDominantColourPressed(prev => !prev);
              }}
              style={{
                borderWidth: 0.5,
                alignItems: 'center',
                padding: 10,
                width: '100%',
                backgroundColor: (!topDominantColour) ? 'transparent' : topDominantColour.colourCode,
              }}>
              {
                (!topDominantColour) 
                ? <Text></Text> 
                : <Text style={{ color: topDominantColour.colourTagFontColour }}>{topDominantColour.colourTag}</Text>
              }
            </TouchableOpacity>
            {
              isSelectTopDominantColourPressed && (
                <FlatList
                  data={DOMINANT_COLOUR_LIST}
                  keyExtractor={item => item.colourCode}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        setTopDominantColour(item);
                        setIsSelectTopDominantColourPressed(false);
                        setTopSecondaryColour(undefined);
                        setIsSelectTopSecondaryColourPressed(false);
                      }}
                      style={[styles.listItem, {backgroundColor: item.colourCode}]}>
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
          <Text style={{ paddingVertical: 10 }}>Top Secondary Colour: </Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                setIsSelectTopSecondaryColourPressed(prev => !prev);
              }}
              style={{
                borderWidth: 0.5,
                alignItems: 'center',
                padding: 10,
                width: '100%',
                backgroundColor: (!topSecondaryColour) ? 'transparent' : topSecondaryColour.colourCode,
              }}>
              {
                (!topSecondaryColour) 
                ? <Text></Text> 
                : <Text style={{ color: topSecondaryColour.colourTagFontColour }}>{topSecondaryColour.colourTag}</Text>
              }
            </TouchableOpacity>
            {
              isSelectTopSecondaryColourPressed && (
                <FlatList
                  data={SECONDARY_COLOUR_LIST.filter((colour: Colour) => topDominantColour && colour.colourFamily != topDominantColour.colourFamily)}
                  keyExtractor={item => item.colourCode}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        setTopSecondaryColour(item);
                        setIsSelectTopSecondaryColourPressed(false);
                      }}
                      style={[styles.listItem, {backgroundColor: item.colourCode}]}>
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
          <Text style={{ paddingVertical: 10 }}>Top Dominant Soil Type<Text style={{ color: 'red' }}>*</Text>: </Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                setIsSelectTopDominantSoilTypePressed(prev => !prev);
              }}
              style={{
                borderWidth: 0.5,
                alignItems: 'center',
                padding: 10,
                width: '100%',
              }}>
              <Text>{topDominantSoilType}</Text>
            </TouchableOpacity>
            {
              isSelectTopDominantSoilTypePressed && (
                <FlatList
                  data={DOMINANT_SOIL_TYPE_LIST}
                  keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        setTopDominantSoilType(item);
                        setIsSelectTopDominantSoilTypePressed(false);
                        setTopSecondarySoilType(undefined);
                        setIsSelectTopSecondarySoilTypePressed(false);
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
          <Text style={{ paddingVertical: 10 }}>Top Secondary Soil Type: </Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                setIsSelectTopSecondarySoilTypePressed(prev => !prev);
              }}
              style={{
                borderWidth: 0.5,
                alignItems: 'center',
                padding: 10,
                width: '100%',
              }}>
              <Text>{topSecondarySoilType}</Text>
            </TouchableOpacity>
            {
              isSelectTopSecondarySoilTypePressed && (
                <FlatList
                  data={(!topDominantSoilType) ? [] : SECONDARY_SOIL_TYPE_LIST_BASED_ON_DOMINANT_SOIL_TYPE[topDominantSoilType]}
                  keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        setTopSecondarySoilType(item);
                        setIsSelectTopSecondarySoilTypePressed(false);
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
          <Text style={{ paddingVertical: 10 }}>Top Other Properties: </Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                setIsSelectTopOtherPropertiesPressed(prev => !prev)
              }}
              style={{
                borderWidth: 0.5,
                alignItems: 'center',
                padding: 10,
                width: '100%',
              }}>
              <Text>{topOtherProperties}</Text>
            </TouchableOpacity>
            {
              isSelectTopOtherPropertiesPressed && (
                <FlatList
                  data={(!topDominantSoilType) ? [] : OTHER_PROPERTIES_LIST_BASED_ON_DOMINANT_SOIL_TYPE[topDominantSoilType]}
                  keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        setTopOtherProperties(item);
                        setIsSelectTopOtherPropertiesPressed(false);
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
          <Text style={{ paddingVertical: 10 }}>Bottom Ditto?<Text style={{ color: 'red' }}>*</Text>: </Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity 
              onPress={() => {
                Keyboard.dismiss();
                setIsSelectBaseDitto(prev => !prev);
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
              isSelectBaseDitto && (
                <FlatList
                  data={['YES', 'NO']}
                  keyExtractor={item => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      onPress={() => {
                        setBaseDitto((item === 'YES') ? true : false);
                        setIsSelectBaseDitto(false);
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
            <>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ paddingVertical: 10 }}>Bottom Dominant Colour<Text style={{ color: 'red' }}>*</Text>: </Text>
              <View style={{ flex: 1 }}>
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsSelectBaseDominantColourPressed(prev => !prev);
                  }}
                  style={{
                    borderWidth: 0.5,
                    alignItems: 'center',
                    padding: 10,
                    width: '100%',
                    backgroundColor: (!baseDominantColour) ? 'transparent' : baseDominantColour.colourCode,
                  }}>
                  {
                    (!baseDominantColour) 
                    ? <Text></Text> 
                    : <Text style={{ color: baseDominantColour.colourTagFontColour }}>{baseDominantColour.colourTag}</Text>
                  }
                </TouchableOpacity>
                {
                  isSelectBaseDominantColour && (
                    <FlatList
                      data={DOMINANT_COLOUR_LIST}
                      keyExtractor={item => item.colourCode}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          onPress={() => {
                            setBaseDominantColour(item);
                            setIsSelectBaseDominantColourPressed(false);
                            setBaseSecondaryColour(undefined);
                            setIsSelectBaseSecondaryColourPressed(false);
                          }}
                          style={[styles.listItem, {backgroundColor: item.colourCode}]}>
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
              <Text style={{ paddingVertical: 10 }}>Bottom Secondary Colour: </Text>
              <View style={{ flex: 1 }}>
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsSelectBaseSecondaryColourPressed(prev => !prev);
                  }}
                  style={{
                    borderWidth: 0.5,
                    alignItems: 'center',
                    padding: 10,
                    width: '100%',
                    backgroundColor: (!baseSecondaryColour) ? 'transparent' : baseSecondaryColour.colourCode,
                  }}>
                  {
                    (!baseSecondaryColour) 
                    ? <Text></Text> 
                    : <Text style={{ color: baseSecondaryColour.colourTagFontColour }}>{baseSecondaryColour.colourTag}</Text>
                  }
                </TouchableOpacity>
                {
                  isSelectBaseSecondaryColourPressed && (
                    <FlatList
                      data={SECONDARY_COLOUR_LIST.filter((colour: Colour) => baseDominantColour && colour.colourFamily != baseDominantColour.colourFamily)}
                      keyExtractor={item => item.colourCode}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          onPress={() => {
                            setBaseSecondaryColour(item);
                            setIsSelectBaseSecondaryColourPressed(false);
                          }}
                          style={[styles.listItem, {backgroundColor: item.colourCode}]}>
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
              <Text style={{ paddingVertical: 10 }}>Bottom Dominant Soil Type<Text style={{ color: 'red' }}>*</Text>: </Text>
              <View style={{ flex: 1 }}>
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsSelectBaseDominantSoilTypePressed(prev => !prev);
                  }}
                  style={{
                    borderWidth: 0.5,
                    alignItems: 'center',
                    padding: 10,
                    width: '100%',
                  }}>
                  <Text>{baseDominantSoilType}</Text>
                </TouchableOpacity>
                {
                  isSelectBaseDominantSoilTypePressed && (
                    <FlatList
                      data={DOMINANT_SOIL_TYPE_LIST}
                      keyExtractor={item => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          onPress={() => {
                            setBaseDominantSoilType(item);
                            setIsSelectBaseDominantSoilTypePressed(false);
                            setBaseSecondarySoilType(undefined);
                            setIsSelectBaseSecondarySoilTypePressed(false);
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
              <Text style={{ paddingVertical: 10 }}>Bottom Secondary Soil Type: </Text>
              <View style={{ flex: 1 }}>
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsSelectBaseSecondarySoilTypePressed(prev => !prev);
                  }}
                  style={{
                    borderWidth: 0.5,
                    alignItems: 'center',
                    padding: 10,
                    width: '100%',
                  }}>
                  <Text>{baseSecondarySoilType}</Text>
                </TouchableOpacity>
                {
                  isSelectBaseSecondarySoilTypePressed && (
                    <FlatList
                      data={(!baseDominantSoilType) ? [] : SECONDARY_SOIL_TYPE_LIST_BASED_ON_DOMINANT_SOIL_TYPE[baseDominantSoilType]}
                      keyExtractor={item => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          onPress={() => {
                            setBaseSecondarySoilType(item);
                            setIsSelectBaseSecondarySoilTypePressed(false);
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
              <Text style={{ paddingVertical: 10 }}>Bottom Other Properties: </Text>
              <View style={{ flex: 1 }}>
                <TouchableOpacity 
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsSelectBaseOtherPropertiesPressed(prev => !prev);
                  }}
                  style={{
                    borderWidth: 0.5,
                    alignItems: 'center',
                    padding: 10,
                    width: '100%',
                  }}>
                  <Text>{baseOtherProperties}</Text>
                </TouchableOpacity>
                {
                  isSelectBaseOtherPropertiesPressed && (
                    <FlatList
                      data={(!baseDominantSoilType) ? [] : OTHER_PROPERTIES_LIST_BASED_ON_DOMINANT_SOIL_TYPE[baseDominantSoilType]}
                      keyExtractor={item => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          onPress={() => {
                            setBaseOtherProperties(item);
                            setIsSelectBaseOtherPropertiesPressed(false);
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
            </>
          )
        }
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>Recovery(m)<Text style={{ color: 'red' }}>*</Text>: </Text>
          <TextInput
            value={recoveryLengthInMetresStr}
            onChangeText={(text: string) => {
              const penetrationDepthInMetres: number = parseFloat(parseFloat(penetrationDepthInMetresStr).toFixed(3));
              if (isNaN(penetrationDepthInMetres)) {
                return;
              }
              setRecoveryLengthInMetresStr(text);
              const recoveryLengthInMetres: number = parseFloat(parseFloat(text).toFixed(3));
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
              const penetrationDepthInMetres: number = parseFloat(parseFloat(penetrationDepthInMetresStr).toFixed(3));
              return (penetrationDepthInMetres > 0) ? `   /   ${penetrationDepthInMetres}` : undefined;
            })()}
          </Text>
        </View>
      </View>
      <Button
        title='Confirm'
        onPress={() => {
          if (isNaN(parseFloat(topDepthInMetresStr)) || parseFloat(topDepthInMetresStr) < 0) {
						alert('Error: Top Depth');
						return;
					}
          if (isNaN(parseFloat(penetrationDepthInMetresStr)) || parseFloat(penetrationDepthInMetresStr) < 0) {
						alert('Error: Penetration Depth');
						return;
					}
          if (!topDominantColour) {
						alert('Error: Top Dominant Colour');
						return;
					}
					if (!topDominantSoilType) {
						alert('Error: Top Dominant Soil Type');
						return;
					}
          if (!baseDitto) {
            if (!baseDominantColour) {
              alert('Error: Base Dominant Colour');
              return;
            }
            if (!baseDominantSoilType) {
              alert('Error: Base Dominant Soil Type');
              return;
            }
          }
          if (isNaN(parseFloat(recoveryLengthInMetresStr)) || parseFloat(recoveryLengthInMetresStr) < 0) {
						alert('Error: Recovery Length');
						return;
					}

          const topDepthInMetres: number = parseFloat(parseFloat(topDepthInMetresStr).toFixed(3));
          const topDepthInMillimetres: number = topDepthInMetres * 1000;
          const penetrationDepthInMetres: number = parseFloat(parseFloat(penetrationDepthInMetresStr).toFixed(3));
          const penetrationDepthInMillimetres: number = penetrationDepthInMetres * 1000;
          const baseDepthInMetres: number = (topDepthInMillimetres + penetrationDepthInMillimetres) / 1000;
          const recoveryLengthInMetres: number = parseFloat(parseFloat(recoveryLengthInMetresStr).toFixed(3));

          let topSoilDescription: string = '';

          const topTotalColourLevel = topDominantColour.level;
					if (topTotalColourLevel <= 1) {
						topSoilDescription += 'Dark';
					} else if (topTotalColourLevel <= 2) {
						topSoilDescription += 'Medium';
					} else if (topTotalColourLevel <= 3) {
						topSoilDescription += 'Light';
					} else {
						topSoilDescription += 'Pale';
					}

					if (!topSecondaryColour) {
						topSoilDescription += ` ${topDominantColour.colourNameForSoilDescription}`;
					} else {
						topSoilDescription += ` ${topSecondaryColour.colourNameForSoilDescription} ${topDominantColour.colourNameForSoilDescription}`;
					}

					if (!topSecondarySoilType) {
						topSoilDescription += ` ${topDominantSoilType}`;
					} else {
						topSoilDescription += ` ${topSecondarySoilType} ${topDominantSoilType}`;
					}

					if (topOtherProperties) {
						topSoilDescription += ` ${topOtherProperties}`;
					}

          let baseSoilDescription: string = '';

          if (baseDitto) {
            baseSoilDescription = '--  ditto  --';
          } else {
            if (!baseDominantColour) {
              alert('Error: Base Dominant Colour');
              return;
            }
            if (!baseDominantSoilType) {
              alert('Error: Base Dominant Soil Type');
              return;
            }

            const baseTotalColourLevel = baseDominantColour.level;
            if (baseTotalColourLevel <= 1) {
              baseSoilDescription += 'Dark';
            } else if (baseTotalColourLevel <= 2) {
              baseSoilDescription += 'Medium';
            } else if (baseTotalColourLevel <= 3) {
              baseSoilDescription += 'Light';
            } else {
              baseSoilDescription += 'Pale';
            }

            if (!baseSecondaryColour) {
              baseSoilDescription += ` ${baseDominantColour.colourNameForSoilDescription}`;
            } else {
              baseSoilDescription += ` ${baseSecondaryColour.colourNameForSoilDescription} ${baseDominantColour.colourNameForSoilDescription}`;
            }

            if (!baseSecondarySoilType) {
              baseSoilDescription += ` ${baseDominantSoilType}`;
            } else {
              baseSoilDescription += ` ${baseSecondarySoilType} ${baseDominantSoilType}`;
            }

            if (baseOtherProperties) {
              baseSoilDescription += ` ${baseOtherProperties}`;
            }
          }

          const pistonSampleIndex: number = (recoveryLengthInMetres === 0) ? -1 : blocks.filter((block: Block) => block.blockType === 'Ps' && block.recoveryLengthInMetres > 0).length + 1;

          const newPsBlock: Block = {
            id: blocks.length + 1,
            blockTypeId: PS_BLOCK_TYPE_ID,
            blockType: 'Ps',
            boreholeId: boreholeId, 
            blockId: 1,
            pistonSampleIndex: pistonSampleIndex,
            topDepthInMetres: topDepthInMetres,
            baseDepthInMetres: baseDepthInMetres,
            topSoilDescription: topSoilDescription,
            baseSoilDescription: baseSoilDescription,
            recoveryLengthInMetres: recoveryLengthInMetres,
          };
          setBlocks(blocks => [...blocks, newPsBlock]);
          setIsAddNewBlockButtonPressed(false);
        }}
      />
    </GestureHandlerRootView>
  );
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