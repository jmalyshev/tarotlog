import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useStore } from '../store/useStore';

export default function HomeScreen({ navigation }) {
  const notes = useStore((s) => s.notes);
  
  // Try to load the background image; if it doesn't exist, use a fallback color
  let backgroundSource = null;
  try {
    backgroundSource = require('../assets/starry-background.png');
  } catch (e) {
    console.log('Background image not found, using color fallback');
  }

  const containerContent = (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />

      <Text style={styles.sectionTitle}>Journal Entries</Text>
      <ScrollView style={styles.list}>
        {notes.length === 0 && <Text style={styles.empty}>No notes yet. Tap + to add one.</Text>}
        {notes.map(n => (
          <TouchableOpacity key={n.id} style={styles.noteItem} onPress={() => navigation.navigate('NoteEditor', { noteId: n.id })}>
            <Text style={styles.noteDate}>{new Date(n.date).toDateString()}</Text>
            <Text numberOfLines={2} style={styles.noteText}>{n.text}</Text>
            <Text style={styles.cardCount}>{(n.cards && n.cards.length) ? `${n.cards.length} card(s)` : 'No spread'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NoteEditor')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  if (backgroundSource) {
    return (
      <ImageBackground
        source={backgroundSource}
        style={styles.backgroundContainer}
        resizeMode="cover"
      >
        {containerContent}
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.backgroundContainer, styles.fallbackBackground]}>
      {containerContent}
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: { flex: 1 },
  fallbackBackground: { backgroundColor: '#1a1a2e' },
  container: { flex: 1, padding: 12 },
  logo: { width: 220, height: 160, marginBottom: 2, marginTop: -8, alignSelf: 'center' },
  sectionTitle: { fontSize: 24, fontWeight: '700', marginTop: 2, color: '#fff' },
  list: { marginTop: 8 },
  empty: { color: '#ccc', marginTop: 8 },
  noteItem: { padding: 16, marginVertical: 8, borderRadius: 12, backgroundColor: '#fff', elevation: 3, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  noteDate: { fontWeight: '600', color: '#333' },
  noteText: { color: '#555', marginTop: 4 },
  cardCount: { color: '#888', marginTop: 6 },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0066cc', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 34 }
});
