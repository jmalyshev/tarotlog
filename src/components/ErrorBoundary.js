import React from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    // Save to state so we can render it and copy
    this.setState({ error, info });
    // Also log to console so it appears in Metro / adb logs
    console.error('ErrorBoundary caught an error:', error);
    console.error(info.componentStack || info);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>An error occurred</Text>
          <ScrollView style={styles.stack}>
            <Text selectable style={styles.errorText}>{String(this.state.error)}</Text>
            <Text selectable style={styles.stackText}>{this.state.info?.componentStack || ''}</Text>
          </ScrollView>
          <Button title="Reload App" onPress={() => {
            // Try a hard reload by throwing to Metro or calling RN Restart if available
            // For now, just clear error state to attempt a re-render
            this.setState({ error: null, info: null });
          }} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  stack: { flex: 1, marginBottom: 12 },
  errorText: { color: '#b00020', marginBottom: 8 },
  stackText: { color: '#333', fontFamily: undefined }
});
