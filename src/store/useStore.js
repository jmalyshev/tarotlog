import create from 'zustand';

export const useStore = create((set) => ({
  entries: [],
  addEntry: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
  // Notes: each note contains { id, date, notes, spread: { cards: [...] }, createdAt }
  notes: [],
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (id, patch) => set((s) => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...patch } : n) })),
  removeNote: (id) => set((s) => ({ notes: s.notes.filter(n => n.id !== id) })),
  // add more store actions as needed
}));
