import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Platform, ScrollView, KeyboardAvoidingView, ImageBackground, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '../store/useStore';
import SpreadPreview from '../components/SpreadPreview';
import { saveNotesEncrypted } from '../lib/localdb';

export default function NoteEditor({ navigation, route }) {
  const addNote = useStore(state => state.addNote);
  const updateNote = useStore(state => state.updateNote);
  const notes = useStore(state => state.notes);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [text, setText] = useState('');
  const [cards, setCards] = useState([]);
  const [returnKey, setReturnKey] = useState(null);
  const pendingForReturnKey = useStore(state => (returnKey ? state.pendingSpreads[returnKey] : undefined));

  const editingId = route?.params?.noteId;

  useEffect(() => {
    if (editingId) {
      const note = notes.find(n => n.id === editingId);
      if (note) {
        setDate(new Date(note.date));
        setText(note.text || '');
        setCards(note.cards || []);
      }
    }
  }, [editingId, notes]);

  // Listen for updatedCards set by SpreadBuilder via setParams on this route
  useEffect(() => {
    if (route?.params?.updatedCards) {
      setCards(route.params.updatedCards || []);
      // clear the param so it's not processed again
      try { navigation.setParams({ updatedCards: undefined }); } catch (e) {}
    }
  }, [route?.params?.updatedCards]);

  // Subscribe to pending spread returns (set by SpreadBuilder via store)
  useEffect(() => {
    if (!returnKey) return;
    if (pendingForReturnKey) {
      setCards(pendingForReturnKey || []);
      try { useStore.getState().clearPendingSpread(returnKey); } catch (e) {}
      setReturnKey(null);
    }
  }, [pendingForReturnKey, returnKey]);

  function onSave() {
    const now = new Date().toISOString();
    if (editingId) {
      updateNote(editingId, { date: date.toISOString(), text, cards, updated_at: now });
    } else {
      const note = { id: Date.now().toString(), date: date.toISOString(), text, cards, created_at: now, updated_at: now };
      addNote(note);
    }
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
    <ImageBackground source={require('../assets/starry-background.png')} style={{ flex: 1 }} onError={() => console.warn('Background image not found')}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.container, { paddingBottom: FOOTER_HEIGHT + 24 }]} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
            <Text style={styles.dateBtnText}>{date.toDateString()}</Text>
          </TouchableOpacity>
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
            <TouchableOpacity style={styles.btn} onPress={() => {
              const key = `ret-${Date.now()}`;
              setReturnKey(key);
              navigation.navigate('SpreadBuilder', { initialCards: cards, returnKey: key });
            }}>
              <Text style={styles.btnText}>Builder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={onSave}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: '#ddd' }]} onPress={() => navigation?.goBack()}>
              <Text style={[styles.btnText, { color: '#666' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

// Listen for updatedCards set by SpreadBuilder via setParams on this route
// (removed duplicate effect - handling of updatedCards is already inside the component)

  

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontWeight: '600', marginTop: 12, color: '#fff' },
  textInput: { borderWidth: 1, borderColor: '#ccc', minHeight: 80, padding: 8, marginTop: 8, backgroundColor: '#fff', color: '#333' },
  spreadContainer: { height: 300, marginTop: 8 },
  dateBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginTop: 8, elevation: 2 },
  dateBtnText: { color: '#333', fontSize: 14, fontWeight: '500' },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  footerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 12, gap: 8 },
  btn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, minWidth: 80, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  btnText: { color: '#333', fontSize: 14, fontWeight: '600' }
});
