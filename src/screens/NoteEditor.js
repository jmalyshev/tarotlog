import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '../store/useStore';
import SpreadPreview from '../components/SpreadPreview';
import { saveNotesEncrypted } from '../lib/localdb';

export default function NoteEditor({ navigation, route }) {
  const addNote = useStore(state => state.addNote);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [text, setText] = useState('');
  const [cards, setCards] = useState([]);

  function onSave() {
    const now = new Date().toISOString();
    const note = { id: Date.now().toString(), date: date.toISOString(), text, cards, created_at: now, updated_at: now };
    addNote(note);
    // persist locally (encrypted) using last unlocked password stored in memory
    try {
      const pw = useStore.getState().lastUnlockedPassword;
      if (pw) {
        const notes = useStore.getState().notes;
        saveNotesEncrypted(notes, pw).catch(e => console.warn('save encrypted failed', e.message));
      }
    } catch (e) {
      console.warn('local save warning', e.message);
    }
    navigation?.goBack();
  }

  const FOOTER_HEIGHT = 84;
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: FOOTER_HEIGHT + 24 }]} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Date</Text>
          <Button title={date.toDateString()} onPress={() => setShowPicker(true)} />
          {showPicker && (
            <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, d) => { setShowPicker(false); if (d) setDate(d); }} />
          )}

          <Text style={styles.label}>Notes</Text>
          <TextInput style={styles.textInput} multiline value={text} onChangeText={setText} placeholder="Write your journal notes here..." />

          <Text style={styles.label}>Spread (preview)</Text>
          <View style={styles.spreadContainer}>
            <SpreadPreview cards={cards} />
          </View>
        </ScrollView>

        <View style={[styles.footer, { height: FOOTER_HEIGHT }]}> 
          <View style={styles.footerInner}>
            <Button title="Open Fullscreen Builder" onPress={() => navigation.navigate('SpreadBuilder', { initialCards: cards, onDone: (next) => setCards(next) })} />
            <View style={{ width: 12 }} />
            <Button title="Save" onPress={onSave} />
            <View style={{ width: 12 }} />
            <Button title="Cancel" color="#888" onPress={() => navigation?.goBack()} />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontWeight: '600', marginTop: 12 },
  textInput: { borderWidth: 1, borderColor: '#ccc', minHeight: 80, padding: 8, marginTop: 8 },
  spreadContainer: { height: 300, borderWidth: 1, borderColor: '#ddd', marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  footerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 12 }
});
