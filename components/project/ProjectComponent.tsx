import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from "react-native";

// Local imports
import { styles } from '@/constants/styles';
import { Project } from '@/interfaces/Project';
import { EditProjectInputForm } from './EditProjectInputForm';

type ProjectComponentProps = {
  project: Project
  editProject: (projectId: number, newProjectName: string) => void;
  deleteProject: (projectId: number) => void;
};

export function ProjectComponent({
  project,
  editProject,
  deleteProject,
}: ProjectComponentProps) {

  const [isEditState, setIsEditState] = useState<boolean>(false);
    
  if (isEditState) {
    return <EditProjectInputForm oldProject={project} editProject={editProject} deleteProject={deleteProject} setIsEditState={setIsEditState} />
  }

  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: '/project/[id]',
          params: { 
            id: project.id,
            name: project.name
          },
        })
      }
      onLongPress={() => setIsEditState(true)}
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? 'rgb(222, 246, 255)' : 'rgb(255, 255, 255)',
        },
        styles.projectButton
      ]}>
      <Text>{project.name.toUpperCase()}</Text>
    </Pressable>
  );
}