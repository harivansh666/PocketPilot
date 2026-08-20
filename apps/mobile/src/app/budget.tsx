import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const categories = [
  { label: "Room rent", icon: "home", color: "#F87171", initial: "6000" },
  {
    label: "Food & vegetables",
    icon: "restaurant",
    color: "#4ADE80",
    initial: "1500",
  },
  { label: "Bike petrol", icon: "car", color: "#FBBF24", initial: "1000" },
  { label: "Personal", icon: "card", color: "#A78BFA", initial: "700" },
];

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const [monthlyBudget, setMonthlyBudget] = useState("10000");
  const [limits, setLimits] = useState(
    Object.fromEntries(
      categories.map((category) => [category.label, category.initial]),
    ),
  );
  const totalLimits = useMemo(
    () =>
      Object.values(limits).reduce(
        (total, value) => total + (Number(value) || 0),
        0,
      ),
    [limits],
  );
  const budget = Number(monthlyBudget) || 0;
  const isOverBudget = totalLimits > budget;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>MARCH 2026</Text>
            <Text style={styles.title}>Budget setup</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            accessibilityLabel="Close budget setup"
          >
            <Ionicons name="close" size={22} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.label}>MONTHLY SPENDING LIMIT</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              value={monthlyBudget}
              onChangeText={setMonthlyBudget}
              keyboardType="numeric"
              style={styles.amountInput}
              selectTextOnFocus
              accessibilityLabel="Monthly spending limit"
            />
          </View>
          <Text style={styles.hint}>
            Decide the maximum you want to spend this month.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Category limits</Text>
            <Text style={styles.sectionHint}>
              How much can each category use?
            </Text>
          </View>
          <Text style={[styles.totalText, isOverBudget && styles.warningText]}>
            ₹{totalLimits.toLocaleString("en-IN")} / ₹
            {budget.toLocaleString("en-IN")}
          </Text>
        </View>

        {categories.map((category) => (
          <View key={category.label} style={styles.categoryRow}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: `${category.color}22` },
              ]}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={category.color}
              />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.label}</Text>
              <Text style={styles.categoryHint}>Monthly limit</Text>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputCurrency}>₹</Text>
              <TextInput
                value={limits[category.label]}
                onChangeText={(value) =>
                  setLimits((current) => ({
                    ...current,
                    [category.label]: value,
                  }))
                }
                keyboardType="numeric"
                style={styles.categoryInput}
                accessibilityLabel={`${category.label} monthly limit`}
              />
            </View>
          </View>
        ))}

        <View style={[styles.notice, isOverBudget && styles.warningNotice]}>
          <Ionicons
            name={isOverBudget ? "warning-outline" : "checkmark-circle-outline"}
            size={20}
            color={isOverBudget ? "#F87171" : "#4ADE80"}
          />
          <Text style={[styles.noticeText, isOverBudget && styles.warningText]}>
            {isOverBudget
              ? `Category limits ₹${(totalLimits - budget).toLocaleString("en-IN")} over your monthly budget.`
              : `₹${(budget - totalLimits).toLocaleString("en-IN")} is still available for savings or emergencies.`}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isOverBudget && styles.disabledButton]}
          disabled={isOverBudget || budget <= 0}
          onPress={() => router.back()}
        >
          <Ionicons
            name="checkmark"
            size={20}
            color={isOverBudget || budget <= 0 ? "#64748B" : "#0B1120"}
          />
          <Text
            style={[
              styles.saveText,
              (isOverBudget || budget <= 0) && styles.disabledText,
            ]}
          >
            Save monthly budget
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0B1120", paddingHorizontal: 20 },
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
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#151E32",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#263552",
  },
  heroCard: {
    backgroundColor: "#151E32",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1F2A44",
    marginBottom: 26,
  },
  label: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  amountRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  currency: {
    color: "#22C55E",
    fontSize: 34,
    fontWeight: "800",
    marginRight: 7,
  },
  amountInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
    paddingVertical: 0,
  },
  hint: { color: "#94A3B8", fontSize: 12, marginTop: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  sectionTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "700" },
  sectionHint: { color: "#64748B", fontSize: 11, marginTop: 4 },
  totalText: { color: "#4ADE80", fontSize: 11, fontWeight: "700" },
  warningText: { color: "#F87171" },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151E32",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1F2A44",
    padding: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryInfo: { flex: 1, marginLeft: 12 },
  categoryName: { color: "#F1F5F9", fontSize: 14, fontWeight: "700" },
  categoryHint: { color: "#64748B", fontSize: 11, marginTop: 4 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 4,
    minWidth: 86,
  },
  inputCurrency: { color: "#22C55E", fontSize: 15, fontWeight: "700" },
  categoryInput: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    paddingVertical: 0,
    paddingLeft: 4,
    flex: 1,
    textAlign: "right",
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#12291F",
    borderRadius: 14,
    padding: 13,
    marginTop: 14,
    marginBottom: 18,
  },
  warningNotice: { backgroundColor: "#351D22" },
  noticeText: { flex: 1, color: "#86EFAC", fontSize: 12, lineHeight: 18 },
  saveButton: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#22C55E",
    borderRadius: 16,
  },
  disabledButton: { backgroundColor: "#1E293B" },
  saveText: { color: "#0B1120", fontSize: 15, fontWeight: "800" },
  disabledText: { color: "#64748B" },
});
