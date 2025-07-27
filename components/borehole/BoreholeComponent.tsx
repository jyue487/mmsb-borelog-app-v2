import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from "react-native";

// Local imports
import { styles } from '@/constants/styles';
import { Borehole } from '@/interfaces/Borehole';

type BoreholeComponentProps = {
  projectName: string,
  borehole: Borehole,
};

export function BoreholeComponent({
  projectName,
  borehole,
}: BoreholeComponentProps) {

  const [isEditState, setIsEditState] = useState<boolean>(false);
    
  if (isEditState) {
    return <></>;
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