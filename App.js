import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './src/screens/HomeScreen';
import SpreadBuilderScreen from './src/screens/SpreadBuilderScreen';
import NoteEditor from './src/screens/NoteEditor';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="SpreadBuilder" component={SpreadBuilderScreen} options={{ title: 'Spread Builder' }} />
          <Stack.Screen name="NoteEditor" component={NoteEditor} options={{ title: 'New Note' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
