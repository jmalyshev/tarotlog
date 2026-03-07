import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '../store/useStore';
import SpreadPreview from '../components/SpreadPreview';

export default function NoteEditor({ navigation, route }) {
  const addNote = useStore(state => state.addNote);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [text, setText] = useState('');
  const [cards, setCards] = useState([]);

  function onSave() {
    const note = { id: Date.now().toString(), date: date.toISOString(), text, cards };
    addNote(note);
    navigation?.goBack();
  }

  return (
    <View style={styles.container}>
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

      <View style={{ marginTop: 8 }}>
        <Button title="Open Fullscreen Builder" onPress={() => navigation.navigate('SpreadBuilder', { initialCards: cards, onDone: (next) => setCards(next) })} />
      </View>

      <View style={styles.actions}>
        <Button title="Save" onPress={onSave} />
        <Button title="Cancel" onPress={() => navigation?.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontWeight: '600', marginTop: 12 },
  textInput: { borderWidth: 1, borderColor: '#ccc', minHeight: 80, padding: 8, marginTop: 8 },
  spreadContainer: { height: 300, borderWidth: 1, borderColor: '#ddd', marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
});
