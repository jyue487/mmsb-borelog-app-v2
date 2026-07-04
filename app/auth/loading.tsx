import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

type Props = {
  displayText: string
};

export default function LoadingScreen({ displayText }: Props) {
  const [dots, setDots] = useState<string>('');

  useEffect(() => {
    let intervalId;
    
    intervalId = setInterval(() => {
      setDots((prevDots) => (prevDots === '...') ? '' : prevDots + '.');
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: '' }}/>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", bottom: 50 }}>  
        <Text style={{ fontSize: 25, fontWeight: "bold" }}>{displayText}{dots}</Text>
      </View>
    </>
  );
}