import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from "react-native";

// Local imports
import { styles } from '@/constants/styles';
import { Borehole } from '@/interfaces/Borehole';
import { EditBoreholeInputForm } from './EditBoreholeInputForm';

type BoreholeComponentProps = {
  projectName: string,
  borehole: Borehole,
  editBorehole: (boreholeId: number, newBoreholeName: string) => void;
};

export function BoreholeComponent({
  projectName,
  borehole,
  editBorehole
}: BoreholeComponentProps) {

  const [isEditState, setIsEditState] = useState<boolean>(false);
    
  if (isEditState) {
    return <EditBoreholeInputForm oldBorehole={borehole} editBorehole={editBorehole} setIsEditState={setIsEditState} />;
  }

  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: '../borehole/[id]',
          params: { 
            id: borehole.id, 
            projectName: projectName, 
            name: borehole.name 
          },
        })
      }
      onLongPress={() => setIsEditState(true)}
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? 'rgb(222, 246, 255)' : 'rgb(255, 255, 255)',
        },
        styles.boreholeButton
      ]}>
      <Text>{borehole.name.toUpperCase()}</Text>
    </Pressable>
  );
}