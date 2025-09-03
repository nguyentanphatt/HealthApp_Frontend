import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View>
      <Text className="text-3xl font-bold text-center mt-12 text-white">
        Welcome to Expo Router!
      </Text>
      <Button
        title="Reset Introduction"
        onPress={async () => {
          await AsyncStorage.removeItem("hasSeenIntroduction");
          alert("Introduction flag removed!");
        }}
      />
    </View>
  );
}