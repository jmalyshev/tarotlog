import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useStore } from '../store/useStore';

export default function HomeScreen({ navigation }) {
  const notes = useStore((s) => s.notes);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TarotLog</Text>
      
      <Text style={styles.sectionTitle}>Journal Entries</Text>
      <ScrollView style={styles.list}>
        {notes.length === 0 && <Text style={styles.empty}>No notes yet. Tap + to add one.</Text>}
        {notes.map(n => (
          <TouchableOpacity key={n.id} style={styles.noteItem} onPress={() => navigation.navigate('NoteEditor', { noteId: n.id })}>
            <Text style={styles.noteDate}>{new Date(n.date).toDateString()}</Text>
            <Text numberOfLines={2} style={styles.noteText}>{n.text}</Text>
            <Text style={{ color: '#666', marginTop: 6 }}>{(n.cards && n.cards.length) ? `${n.cards.length} card(s)` : 'No spread'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NoteEditor')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  list: { marginTop: 8 },
  empty: { color: '#666', marginTop: 8 },
  noteItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  noteDate: { fontWeight: '600' },
  noteText: { color: '#444', marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0066cc', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 34 }
});
