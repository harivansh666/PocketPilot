import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useExpenseStore } from "@/store/useExpenseStore";
import { getCategoryIconAndColor } from "@/utils/categoryHelpers";

type Transaction = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  icon: string;
  color: string;
};

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const {
    getExpence,
    getCategory,
    getHistory,
    historyData,
    expenceData,
    getDashboard,
    dashboardData,
  } = useExpenseStore();

  useEffect(() => {
    getExpence();
    getCategory();
    getHistory();
    getDashboard();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([getExpence(), getHistory(), getCategory(), getDashboard()]);
    setRefreshing(false);
  }, [getExpence, getHistory, getCategory, getDashboard]);

  const rawList =
    Array.isArray(historyData) && historyData.length > 0
      ? historyData
      : Array.isArray(expenceData)
        ? expenceData
        : [];

  const transactions: Transaction[] = rawList.map((item: any) => {
    const categoryName = item.type || item.category || "Expense";
    const title = item.note || item.type || item.category || "Expense";
    const amount = Number(item.amount) || 0;
    const { icon, color } = getCategoryIconAndColor(categoryName);

    let dateStr = "Recently";
    if (item.date || item.createdAt) {
      try {
        dateStr = new Date(item.date || item.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        });
      } catch (e) {
        dateStr = "Recently";
      }
    }

    return {
      id: item.id || String(Math.random()),
      title,
      category: categoryName,
      date: dateStr,
      amount,
      icon,
      color,
    };
  });

  const totalSpent = historyData?.[0]?.monthlySpent
    ? Number(historyData[0].monthlySpent)
    : transactions.reduce((total, item) => total + item.amount, 0);

  const totalBudget = dashboardData?.expence?.[0]?.totalBudget
    ? Number(dashboardData.expence[0].totalBudget)
    : 10000;

  const remaining = totalBudget - totalSpent;

  const visibleTransactions =
    selectedFilter === "All"
      ? transactions
      : transactions.filter((item) => item.category === selectedFilter);

  const filterOptions = ["All", ...Array.from(new Set(transactions.map((t) => t.category)))];
  const adviceText = historyData?.[0]?.lessThenLimit || "Keep personal spending under ₹1,000 this month";
  const monthYearHeader = `${new Date().toLocaleString("en-US", { month: "long" }).toUpperCase()} ${new Date().getFullYear()}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: 110,
      }}
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
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{monthYearHeader}</Text>
          <Text style={styles.title}>Expense history</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/add")}
          accessibilityLabel="Add expense"
        >
          <Ionicons name="add" size={22} color="#0B1120" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>SPENT THIS MONTH</Text>
        <Text style={styles.summaryAmount}>
          ₹{totalSpent.toLocaleString("en-IN")}
        </Text>
        <View style={styles.remainingPill}>
          <Ionicons name="trending-down" size={15} color="#4ADE80" />
          <Text style={styles.remainingText}>
            ₹{remaining.toLocaleString("en-IN")} left
          </Text>
        </View>
        <View style={styles.summaryTrack}>
          <View
            style={[
              styles.summaryFill,
              { width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` },
            ]}
          />
        </View>
        <Text style={styles.summaryHint}>
          {adviceText}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filterOptions.map((filter: string, index: number) => {
          const isSelected = selectedFilter === filter;
          return (
            <TouchableOpacity
              key={`${filter}-${index}`}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filter,
                isSelected && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  isSelected && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Recent expenses</Text>
        <Text style={styles.count}>{visibleTransactions.length} entries</Text>
      </View>

      {visibleTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={36} color="#64748B" />
          <Text style={styles.emptyText}>No expenses recorded yet</Text>
        </View>
      ) : (
        visibleTransactions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.transactionRow}
            activeOpacity={0.75}
          >
            <View
              style={[styles.iconBox, { backgroundColor: `${item.color}22` }]}
            >
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{item.title}</Text>
              <Text style={styles.transactionMeta}>
                {item.category} · {item.date}
              </Text>
            </View>
            <Text style={styles.transactionAmount}>
              -₹{item.amount.toLocaleString("en-IN")}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {/* Footer Branding */}
      <View style={styles.footerBranding}>
        <Text style={styles.footerBrandingText}>
          Powered by <Text style={styles.footerBrandingHighlight}>Hattionline.in</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1120", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  eyebrow: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  title: { color: "#F8FAFC", fontSize: 25, fontWeight: "700", marginTop: 4 },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    backgroundColor: "#151E32",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1F2A44",
    marginBottom: 22,
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 6,
  },
  remainingPill: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#143425",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  remainingText: { color: "#4ADE80", fontSize: 11, fontWeight: "700" },
  summaryTrack: {
    height: 7,
    backgroundColor: "#1E293B",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 18,
  },
  summaryFill: { height: "100%", backgroundColor: "#FBBF24", borderRadius: 8 },
  summaryHint: { color: "#94A3B8", fontSize: 12, marginTop: 12 },
  filterRow: { gap: 8, paddingBottom: 24 },
  filter: {
    borderWidth: 1,
    borderColor: "#263552",
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  activeFilter: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
  filterText: { color: "#94A3B8", fontSize: 12, fontWeight: "700" },
  activeFilterText: { color: "#0B1120" },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  sectionTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "700" },
  count: { color: "#64748B", fontSize: 12, fontWeight: "600" },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151E32",
    borderWidth: 1,
    borderColor: "#1F2A44",
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: { flex: 1, marginLeft: 12 },
  transactionTitle: { color: "#F1F5F9", fontSize: 14, fontWeight: "700" },
  transactionMeta: { color: "#64748B", fontSize: 11, marginTop: 5 },
  transactionAmount: {
    color: "#FCA5A5",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },
  emptyContainer: {
    backgroundColor: "#151E32",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1F2A44",
    marginTop: 10,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 10,
    fontWeight: "500",
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
