import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ImageBackground, TouchableOpacity } from 'react-native';
import { hasPassword, setPassword, verifyPassword, loadNotesEncrypted } from '../lib/localdb';
import { useStore } from '../store/useStore';

export default function LockScreen({ navigation }) {
  const [exists, setExists] = useState(false);
  const [password, setPass] = useState('');
  const [status, setStatus] = useState('');
  const setNotes = useStore(s => s.setNotes);

  useEffect(() => {
    (async () => {
      setExists(await hasPassword());
    })();
  }, []);

  async function handleSet() {
    if (!password || password.length < 4) {
      Alert.alert('Choose a password at least 4 chars');
      return;
    }
    setStatus('Setting password...');
    try {
      console.log('LockScreen: setting password');
      await setPassword(password);
      // try loading any existing notes (if any). If none, initialize to empty array
      let notes = [];
      try {
        notes = await loadNotesEncrypted(password) || [];
      } catch (e) {
        // ignore decryption errors for a fresh password
        console.log('LockScreen: no existing notes or decryption failed for new password', e?.message);
        notes = [];
      }
      // ensure store has notes and remember unlocked password in-memory
      setNotes(notes);
      useStore.getState().setLastUnlockedPassword(password);
      setStatus('Password set');
      Alert.alert('Password set', 'You can now use the app.');
      navigation.replace('Home');
    } catch (err) {
      console.error('LockScreen: setPassword failed', err);
      setStatus('Failed to set password');
      Alert.alert('Error', 'Failed to set password. See logs.');
    }
  }

  async function handleUnlock() {
    setStatus('Verifying...');
    try {
      const ok = await verifyPassword(password);
      if (!ok) {
        setStatus('Incorrect password');
        return Alert.alert('Incorrect password');
      }
      try {
        const notes = await loadNotesEncrypted(password);
        setNotes(notes || []);
        useStore.getState().setLastUnlockedPassword(password);
        setStatus('Unlocked');
      } catch (e) {
        console.log('LockScreen: load notes failed on unlock', e?.message);
        setNotes([]);
      }
      navigation.replace('Home');
    } catch (err) {
      console.error('LockScreen: unlock failed', err);
      setStatus('Unlock failed');
      Alert.alert('Error', 'Unlock failed. See logs.');
    }
  }

  return (
    <ImageBackground source={require('../assets/starry-background.png')} style={{ flex: 1 }} onError={() => console.warn('Background image not found')}>
      <View style={styles.container}>
        <Text style={styles.title}>{exists ? 'Unlock TarotLog' : 'Set a password'}</Text>
        <TextInput secureTextEntry placeholder="Password" value={password} onChangeText={setPass} style={styles.input} placeholderTextColor="#999" />
        {exists ? (
          <TouchableOpacity style={styles.btn} onPress={handleUnlock}>
            <Text style={styles.btnText}>Unlock</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={handleSet}>
            <Text style={styles.btnText}>Set Password</Text>
          </TouchableOpacity>
        )}
        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24, color: '#fff', textAlign: 'center' },
  input: { width: '100%', maxWidth: 300, borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 16, backgroundColor: '#fff', color: '#333', borderRadius: 8, fontSize: 16 },
  btn: { backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, minWidth: 140, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  btnText: { color: '#333', fontSize: 16, fontWeight: '700' },
  status: { marginTop: 16, color: '#fff', fontSize: 14, textAlign: 'center' }
});
