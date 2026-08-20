import { Tabs } from "expo-router";
import CustomTabBar from "../../components/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="add" />
      <Tabs.Screen name="transactions" />
    </Tabs>
  );
}
