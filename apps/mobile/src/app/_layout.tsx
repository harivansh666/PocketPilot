import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ backgroundColor: "#0B1120" }}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#0B1120" },
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
