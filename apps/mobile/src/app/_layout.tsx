import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import axios from 'axios';

// Adjust this URL if your backend runs elsewhere
const SERVER_URL = 'https://pocketpilotapp.vercel.app/api/v1/update';

export default function RootLayout() {
  const [checking, setChecking] = useState(true);
  const [info, setInfo] = useState<{ updateAvailable: boolean; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await axios.get(SERVER_URL, {
          params: { runtimeVersion: Constants.expoConfig?.runtimeVersion ?? 'unknown' },
        });
        const { updateAvailable, message } = resp.data;
        setInfo({ updateAvailable, message });
        if (updateAvailable) {
          const result = await Updates.checkForUpdateAsync();
          if (result.isAvailable) {
            await Updates.fetchUpdateAsync(); // background download
          }
        }
      } catch (e) {
        console.error('Update check failed', e);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (checking) {
    return (
      <SafeAreaProvider style={{ backgroundColor: '#0B1120' }}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.msg}>Checking for updates…</Text>
        </View>
        <Toast />
      </SafeAreaProvider>
    );
  }

  if (info?.updateAvailable) {
    return (
      <SafeAreaProvider style={{ backgroundColor: '#0B1120' }}>
        <View style={styles.banner}>
          <Text style={styles.bannerMsg}>{info.message}</Text>
          <Button title="Apply now" onPress={() => Updates.reloadAsync()} />
        </View>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: '#0B1120' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="expense/add" options={{ headerShown: false }} />
          <Stack.Screen name="budget" options={{ headerShown: false }} />
        </Stack>
        <Toast />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: '#0B1120' }}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#0B1120' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="expense/add" options={{ headerShown: false }} />
        <Stack.Screen name="budget" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  msg: { marginTop: 12, fontSize: 16 },
  banner: { padding: 12, backgroundColor: '#0B1120', borderBottomWidth: 2, borderBottomColor: '#1A73E8' },
  bannerMsg: { color: '#fff', marginBottom: 6 },
});
