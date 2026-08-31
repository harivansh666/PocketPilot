import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useExpenseStore } from "@/store/useExpenseStore";

const TOTAL_BUDGET = 10000;
const TOTAL_SPENT = 9000;
const REMAINING = TOTAL_BUDGET - TOTAL_SPENT;

const categories = [
  {
    name: "Room Rent",
    icon: "home",
    budget: 6000,
    spent: 6000,
    color: "#F87171",
  },
  { name: "Petrol", icon: "car", budget: 1500, spent: 300, color: "#FBBF24" },
  {
    name: "Vegetables",
    icon: "nutrition",
    budget: 1500,
    spent: 600,
    color: "#4ADE80",
  },
  {
    name: "Personal",
    icon: "card",
    budget: 1000,
    spent: 2100,
    color: "#A78BFA",
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const { getExpence, getCategory } = useExpenseStore();
  const progress = Math.min((TOTAL_SPENT / TOTAL_BUDGET) * 100, 100);

  useEffect(() => {
    getExpence();
    getCategory();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([getExpence(), getCategory()]);
    setRefreshing(false);
  }, [getExpence, getCategory]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#22C55E"
          colors={["#22C55E"]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Harivansh</Text>
          <Text style={styles.title}>March Budget</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarCircle}
          onPress={() => router.push("/budget" as any)}
          accessibilityLabel="Open budget setup"
        >
          <Ionicons name="wallet-outline" size={19} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Hero Balance Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>REMAINING BALANCE</Text>
        <Text style={styles.heroAmount}>
          ₹{REMAINING.toLocaleString("en-IN")}
        </Text>

        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.heroFooter}>
          <View style={styles.heroFooterItem}>
            <View style={[styles.dot, { backgroundColor: "#22C55E" }]} />
            <Text style={styles.heroFooterText}>
              Spent{" "}
              <Text style={styles.heroFooterValue}>
                ₹{TOTAL_SPENT.toLocaleString("en-IN")}
              </Text>
            </Text>
          </View>
          <Text style={styles.heroPercent}>{progress.toFixed(0)}% used</Text>
        </View>
      </View>

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.section}>Categories</Text>
        <Text style={styles.sectionCount}>{categories.length} active</Text>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {categories.map((item) => {
          const left = item.budget - item.spent;
          const isOver = left < 0;
          const width = Math.min((item.spent / item.budget) * 100, 100);

          return (
            <TouchableOpacity
              key={item.name}
              style={styles.gridCard}
              activeOpacity={0.7}
              onPress={() => router.push("/transactions")}
            >
              <View
                style={[styles.iconBox, { backgroundColor: item.color + "22" }]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={item.color}
                />
              </View>

              <Text style={styles.gridTitle} numberOfLines={1}>
                {item.name}
              </Text>

              <Text style={[styles.gridLeft, isOver && styles.overText]}>
                {isOver ? `+₹${Math.abs(left)}` : `₹${left} left`}
              </Text>

              <View style={styles.progressBgSmall}>
                <View
                  style={[
                    styles.progressFillSmall,
                    {
                      width: `${width}%`,
                      backgroundColor: isOver ? "#F87171" : item.color,
                    },
                  ]}
                />
              </View>

              <Text style={styles.gridSub}>
                ₹{item.spent} / ₹{item.budget}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1120",
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  greeting: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  title: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: -0.3,
  },

  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },

  avatarText: {
    color: "#94A3B8",
    fontWeight: "700",
    fontSize: 15,
  },

  heroCard: {
    backgroundColor: "#151E32",
    borderRadius: 24,
    padding: 22,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#1F2A44",
  },

  heroLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  heroAmount: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 18,
    letterSpacing: -0.5,
  },

  progressBg: {
    height: 8,
    backgroundColor: "#1E293B",
    borderRadius: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#22C55E",
    borderRadius: 8,
  },

  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },

  heroFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  heroFooterText: {
    color: "#94A3B8",
    fontSize: 13,
  },

  heroFooterValue: {
    color: "#E2E8F0",
    fontWeight: "700",
  },

  heroPercent: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 14,
  },

  section: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionCount: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridCard: {
    width: "48%",
    backgroundColor: "#151E32",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1F2A44",
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  gridTitle: {
    color: "#F1F5F9",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },

  gridLeft: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
  },

  overText: {
    color: "#F87171",
  },

  progressBgSmall: {
    height: 4,
    backgroundColor: "#1E293B",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },

  progressFillSmall: {
    height: "100%",
    borderRadius: 4,
  },

  gridSub: {
    color: "#64748B",
    fontSize: 11,
  },
});
