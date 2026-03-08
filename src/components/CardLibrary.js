import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import TAROT_DECK from '../data/tarot_deck.json';

export default function CardLibrary({ onAddCard }) {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const term = (q || '').trim().toLowerCase();
    if (!term) return [];
    return TAROT_DECK.filter(c => c.name.toLowerCase().includes(term));
  }, [q]);

  return (
    <View style={styles.library}>
      <TextInput placeholder="Search cards..." value={q} onChangeText={setQ} style={styles.search} autoFocus={false} />

      {q.trim().length > 0 && (
        <ScrollView contentContainerStyle={{ paddingVertical: 8 }} style={styles.results}>
          {results.length === 0 ? (
            <Text style={styles.empty}>No cards match "{q}"</Text>
          ) : (
            results.map((item) => (
              <TouchableOpacity key={item.id} style={styles.resultItem} onPress={() => { setQ(''); onAddCard(item); }}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  library: { padding: 12, borderTopWidth: 1, borderColor: '#eee' },
  title: { fontWeight: '600', marginBottom: 8 },
  search: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 6 },
  results: { maxHeight: 200, marginTop: 8 },
  resultItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' }
  ,
  empty: { color: '#666', padding: 10 }
});
