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

type Transaction = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  icon: string;
  color: string;
};

const filters = ["All", "Rent", "Food", "Petrol", "Personal"];
const transactions: Transaction[] = [
  {
    id: "rent",
    title: "Room rent",
    category: "Rent",
    date: "Today, 9:00 AM",
    amount: 6000,
    icon: "home",
    color: "#F87171",
  },
  {
    id: "petrol",
    title: "Bike petrol",
    category: "Petrol",
    date: "Yesterday, 6:20 PM",
    amount: 300,
    icon: "car",
    color: "#FBBF24",
  },
  {
    id: "vegetables",
    title: "Vegetables",
    category: "Food",
    date: "Yesterday, 10:45 AM",
    amount: 600,
    icon: "nutrition",
    color: "#4ADE80",
  },
  {
    id: "chai",
    title: "Tea and snacks",
    category: "Personal",
    date: "20 Mar, 5:30 PM",
    amount: 120,
    icon: "cafe",
    color: "#A78BFA",
  },
  {
    id: "recharge",
    title: "Mobile recharge",
    category: "Personal",
    date: "18 Mar, 8:10 PM",
    amount: 249,
    icon: "phone-portrait",
    color: "#60A5FA",
  },
];

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const { getExpence } = useExpenseStore();

  useEffect(() => {
    getExpence();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getExpence();
    setRefreshing(false);
  }, [getExpence]);

  const totalSpent = transactions.reduce(
    (total, item) => total + item.amount,
    0,
  );
  const visibleTransactions =
    selectedFilter === "All"
      ? transactions
      : transactions.filter((item) => item.category === selectedFilter);

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
          <Text style={styles.eyebrow}>MARCH 2026</Text>
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
            ₹{(10000 - totalSpent).toLocaleString("en-IN")} left
          </Text>
        </View>
        <View style={styles.summaryTrack}>
          <View
            style={[
              styles.summaryFill,
              { width: `${(totalSpent / 10000) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.summaryHint}>
          Keep personal spending under ₹1,000 this month
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[
              styles.filter,
              selectedFilter === filter && styles.activeFilter,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Recent expenses</Text>
        <Text style={styles.count}>{visibleTransactions.length} entries</Text>
      </View>

      {visibleTransactions.map((item) => (
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
      ))}
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
});
