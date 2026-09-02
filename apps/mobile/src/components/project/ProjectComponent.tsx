import { router } from 'expo-router';
import { Pressable, Text } from "react-native";

// Local imports
import { styles } from '@/src/constants/styles';
import { Project } from '@/src/interfaces/Project';

type ProjectComponentProps = {
  project: Project;
};

export function ProjectComponent({ project }: ProjectComponentProps) {
  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: '/project/[id]',
          params: { 
            id: project.id,
            title: project.title
          },
        })
      }
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? 'rgb(222, 246, 255)' : 'rgb(255, 255, 255)',
        },
        styles.projectButton
      ]}>
      <Text>{project.title}</Text>
    </Pressable>
  );
}