import React from 'react';
import { Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';

export default function HeaderAuthButton() {
  const user = useStore(s => s.user);
  const navigation = useNavigation();
  return <Button title={user ? 'Account' : 'Sign in'} onPress={() => navigation.navigate('Auth')} />;
}
