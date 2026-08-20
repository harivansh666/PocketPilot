import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CustomTabBarProps = {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
  navigation: {
    emit: (event: {
      type: "tabPress";
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented?: boolean };
    navigate: (routeName: string) => void;
  };
};

type IconName =
  | "home"
  | "home-outline"
  | "add"
  | "add-outline"
  | "receipt"
  | "receipt-outline";

export default function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 12 }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isCenter = route.name === "add";

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName: IconName =
          route.name === "index"
            ? isFocused
              ? "home"
              : "home-outline"
            : route.name === "transactions"
              ? isFocused
                ? "receipt"
                : "receipt-outline"
              : "add";

        if (isCenter) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.centerButton}
            >
              <Ionicons name={iconName} size={28} color="#fff" />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? "#fff" : "#888"}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#151E32", // ✅ same as heroCard/gridCard — cohesive lagega    paddingTop: 12,
    width: "100%",
    paddingTop: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  centerButton: {
    backgroundColor: "#22C55E",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
