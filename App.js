import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ErrorBoundary from './src/components/ErrorBoundary';
import HomeScreen from './src/screens/HomeScreen';
import SpreadBuilderScreen from './src/screens/SpreadBuilderScreen';
import NoteEditor from './src/screens/NoteEditor';
import LockScreen from './src/screens/LockScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Lock">
            <Stack.Screen name="Lock" component={LockScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SpreadBuilder" component={SpreadBuilderScreen} options={{ title: 'Spread Builder' }} />
            <Stack.Screen name="NoteEditor" component={NoteEditor} options={{ title: 'New Note' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
