import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { signInWithEmail, signOut } from '../lib/supabase';
import { useStore } from '../store/useStore';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const user = useStore(s => s.user);

  async function handleSignIn() {
    if (!email) return Alert.alert('Enter email');
    try {
      await signInWithEmail(email);
      Alert.alert('Check your email', 'A magic link was sent to your email address.');
      setEmail('');
    } catch (e) {
      Alert.alert('Sign-in failed', e.message);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (e) {
      // ignore
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication</Text>
      {user ? (
        <>
          <Text style={{ marginBottom: 12 }}>Signed in as: {user.email}</Text>
          <Button title="Sign out" onPress={handleSignOut} />
        </>
      ) : (
        <>
          <TextInput placeholder="you@example.com" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
          <Button title="Sign in (magic link)" onPress={handleSignIn} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 8, marginBottom: 12 }
});
