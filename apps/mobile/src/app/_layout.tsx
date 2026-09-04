import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Updates from 'expo-updates';

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      if (__DEV__) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Toast.show({ type: 'info', text1: 'Applying update…' });
          await Updates.reloadAsync();
        }
      } catch (e) {
        console.log('OTA update check error or offline fallback:', e);
      }
    })();
  }, []);

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
