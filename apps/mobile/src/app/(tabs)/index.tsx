import { useCallback, useEffect, useState } from "react";
import {
  Image,
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
import { getCategoryIconAndColor } from "@/utils/categoryHelpers";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const { getExpence, getCategory, getDashboard, dashboardData } = useExpenseStore();

  useEffect(() => {
    getDashboard();
    getExpence();
    getCategory();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([getDashboard(), getExpence(), getCategory()]);
    setRefreshing(false);
  }, [getDashboard, getExpence, getCategory]);

  const categoriesData = dashboardData?.categories;
  const categories =
    categoriesData && Array.isArray(categoriesData)
      ? categoriesData.map((cat: any) => {
        const rawName = cat.type || cat.name || cat.category || "Uncategorized";
        const name = (rawName === "Expense" || rawName === "Income") && cat.type && cat.type !== rawName ? cat.type : rawName;
        const budget = Number(cat.budget) || 0;
        const spent = Number(cat.spent) || 0;
        const { icon, color } = getCategoryIconAndColor(name);
        return {
          name,
          icon,
          budget,
          spent,
          color,
        };
      })
      : [];

  const categoryTotalBudget = categories.reduce((sum, item) => sum + item.budget, 0);
  const categoryTotalSpent = categories.reduce((sum, item) => sum + item.spent, 0);

  const expenceSettings = dashboardData?.expence;
  const overallBudgetInfo =
    expenceSettings && Array.isArray(expenceSettings) && expenceSettings[0]
      ? expenceSettings[0]
      : null;

  const totalBudget =
    categoryTotalBudget > 0
      ? categoryTotalBudget
      : Number(overallBudgetInfo?.totalBudget) || 0;

  const totalSpent =
    overallBudgetInfo?.totalSpent !== undefined
      ? Number(overallBudgetInfo.totalSpent)
      : categoryTotalSpent;

  const remaining =
    overallBudgetInfo?.remaining !== undefined
      ? Number(overallBudgetInfo.remaining)
      : totalBudget - totalSpent;

  const progress = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const monthTitle = `${new Date().toLocaleString("en-US", { month: "long" })} Budget`;

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
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/images/Untitled.png")}
            style={styles.appLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.greeting}>Hello, Harivansh  sharma !!!</Text>
            <Text style={styles.title}>{monthTitle}</Text>
          </View>
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
          ₹{remaining.toLocaleString("en-IN")}
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
                ₹{totalSpent.toLocaleString("en-IN")}
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

      {/* Empty State when zero categories exist */}
      {categories.length === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons name="receipt-outline" size={32} color="#64748B" />
          <Text style={styles.emptyText}>No category expenses found yet</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/expense/add" as any)}
          >
            <Text style={styles.emptyButtonText}>+ Add Expense</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Grid */}
      <View style={styles.grid}>
        {categories.map((item) => {
          const left = item.budget - item.spent;
          const isOver = left < 0;
          const width = item.budget > 0 ? Math.min((item.spent / item.budget) * 100, 100) : 0;

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

      {/* Footer Branding */}
      <View style={styles.footerBranding}>
        <Text style={styles.footerBrandingText}>
          Powered by <Text style={styles.footerBrandingHighlight}>Hattionline.in Harivansh Sharma ji</Text>
        </Text>
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

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  appLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
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

  emptyCard: {
    backgroundColor: "#151E32",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1F2A44",
    marginBottom: 20,
  },

  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 10,
    marginBottom: 14,
    fontWeight: "500",
  },

  emptyButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  footerBranding: {
    marginTop: 28,
    marginBottom: 10,
    alignItems: "center",
  },

  footerBrandingText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

  footerBrandingHighlight: {
    color: "#22C55E",
    fontWeight: "700",
  },
});
