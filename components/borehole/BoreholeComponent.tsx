import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from "react-native";

// Local imports
import { styles } from '@/constants/styles';
import { Borehole, EditBoreholeParams } from '@/interfaces/Borehole';
import { EditBoreholeInputForm } from './EditBoreholeInputForm';

type BoreholeComponentProps = {
  projectTitle: string,
  borehole: Borehole,
  editBorehole: (editBoreholeParams: EditBoreholeParams) => void;
  deleteBorehole: (boreholeId: number) => void;
};

export function BoreholeComponent({
  projectTitle,
  borehole,
  editBorehole,
  deleteBorehole,
}: BoreholeComponentProps) {

  const [isEditState, setIsEditState] = useState<boolean>(false);
    
  if (isEditState) {
    return <EditBoreholeInputForm oldBorehole={borehole} editBorehole={editBorehole} deleteBorehole={deleteBorehole} setIsEditState={setIsEditState} />;
  }

  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: '../borehole/[id]',
          params: { 
            id: borehole.id, 
            projectTitle: projectTitle, 
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