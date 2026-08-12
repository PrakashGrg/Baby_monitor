import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BabiesStackParamList } from '../types/navigation';
import BabyListScreen from '../screens/babies/BabyListScreen';
import BabyAddScreen from '../screens/babies/BabyAddScreen';
import BabyEditScreen from '../screens/babies/BabyEditScreen';

const Stack = createNativeStackNavigator<BabiesStackParamList>();

export default function BabiesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BabyList" component={BabyListScreen} />
      <Stack.Screen name="BabyAdd" component={BabyAddScreen} />
      <Stack.Screen name="BabyEdit" component={BabyEditScreen} />
    </Stack.Navigator>
  );
}