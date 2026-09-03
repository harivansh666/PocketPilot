import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useExpenseStore } from "@/store/useExpenseStore";
import { MonthPicker } from "@/components/MonthPicker";

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const {
    addBudget,
    category: storeCategories,
    getCategory,
    addCategory,
    getBudget,
    budgetData,
    getDashboard,
    dashboardData,
  } = useExpenseStore();

  const now = useMemo(() => new Date(), []);
  const currentMonthCode = useMemo(
    () => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    [now],
  );
  const [selectedMonth, setSelectedMonth] = useState(currentMonthCode);
  const monthDisplayLabel = useMemo(
    () =>
      new Date(`${selectedMonth}-01T00:00:00`)
        .toLocaleDateString("en-US", { month: "long", year: "numeric" })
        .toUpperCase(),
    [selectedMonth],
  );

  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // New Category Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getCategory();
      getBudget(selectedMonth);
      getDashboard(selectedMonth);
    }, [getCategory, getBudget, getDashboard, selectedMonth]),
  );

  useEffect(() => {
    if (Array.isArray(budgetData)) {
      const savedBudget = budgetData.find(
        (item: any) =>
          item?.type?.toLowerCase() === "budget" &&
          (!item?.month || item.month === selectedMonth),
      );
      if (savedBudget?.amount !== undefined && savedBudget?.amount !== null) {
        setMonthlyBudget(String(savedBudget.amount));
      }
    }
  }, [budgetData, selectedMonth]);

  const activeCategories = useMemo(() => {
    const budgetCategoriesMap = new Map<string, number>();
    if (Array.isArray(budgetData)) {
      budgetData.forEach((item: any) => {
        const key = item?.type;
        if (key && key.toLowerCase() !== "budget") {
          budgetCategoriesMap.set(key.toLowerCase(), Number(item.amount) || 0);
        }
      });
    }
    const categories: any[] = Array.isArray(storeCategories)
      ? [...storeCategories]
      : [];

    if (Array.isArray(budgetData)) {
      budgetData.forEach((item: any) => {
        const label = item?.type;
        if (
          label &&
          label.toLowerCase() !== "budget" &&
          (!item?.month || item.month === selectedMonth) &&
          !categories.some(
            (category: any) =>
              (category.label || category.name || "").toLowerCase() ===
              label.toLowerCase(),
          )
        ) {
          categories.push({ name: label });
        }
      });
    }

    return categories.map((c: any) => {
      const label = c.label || c.name || "Category";
      const savedLimit = budgetCategoriesMap.get(label.toLowerCase());
      return {
        label,
        icon: c.icon || "pricetag",
        color: c.color || "#4ADE80",
        initial: savedLimit !== undefined ? String(savedLimit) : "0",
      };
    });
  }, [storeCategories, budgetData, selectedMonth]);

  const [limits, setLimits] = useState<Record<string, string>>({});

  useEffect(() => {
    setLimits((prev) => {
      const next = { ...prev };
      let updated = false;

      activeCategories.forEach((cat) => {
        const currentVal = next[cat.label];
        if (currentVal === undefined) {
          next[cat.label] = cat.initial || "0";
          updated = true;
        } else if (
          (currentVal === "0" || currentVal === "") &&
          cat.initial &&
          cat.initial !== "0"
        ) {
          next[cat.label] = cat.initial;
          updated = true;
        }
      });

      return updated ? next : prev;
    });
  }, [activeCategories]);

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

  const handleSaveBudget = async () => {
    if (isOverBudget || budget <= 0 || isSaving) return;
    setIsSaving(true);
    const success = await addBudget({
      userId: 1,
      category: "Budget",
      type: "Budget",
      amount: budget,
      limit: totalLimits,
      month: selectedMonth,
      categories: activeCategories.map((category) => ({
        type: category.label,
        amount: Number(limits[category.label]) || 0,
      })),
    });
    setIsSaving(false);
    if (success) {
      router.back();
    }
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setMonthlyBudget("");
    setLimits({});
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim() || isAddingCat) return;
    setIsAddingCat(true);
    const success = await addCategory({
      name: newCatName.trim(),
      type: "Expense",
    });
    setIsAddingCat(false);
    if (success) {
      setNewCatName("");
      setModalVisible(false);
    }
  };

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
            <Text style={styles.eyebrow}>{monthDisplayLabel}</Text>
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

        <MonthPicker
          selectedMonth={selectedMonth}
          onSelect={handleMonthSelect}
        />

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
          <TouchableOpacity
            style={styles.addCatHeaderButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={16} color="#4ADE80" />
            <Text style={styles.addCatHeaderText}>Add Category</Text>
          </TouchableOpacity>
        </View>

        {activeCategories.map((category) => (
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
                value={limits[category.label] || "0"}
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
          style={[
            styles.saveButton,
            (isOverBudget || budget <= 0 || isSaving) && styles.disabledButton,
          ]}
          disabled={isOverBudget || budget <= 0 || isSaving}
          onPress={handleSaveBudget}
        >
          {isSaving ? (
            <ActivityIndicator color="#0B1120" size="small" />
          ) : (
            <>
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
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Add New Category Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Category name (e.g. Shopping)"
              placeholderTextColor="#64748B"
              value={newCatName}
              onChangeText={setNewCatName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createBtn,
                  (!newCatName.trim() || isAddingCat) && styles.disabledButton,
                ]}
                disabled={!newCatName.trim() || isAddingCat}
                onPress={handleAddCategory}
              >
                {isAddingCat ? (
                  <ActivityIndicator color="#0B1120" size="small" />
                ) : (
                  <Text style={styles.createBtnText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addCatHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#151E32",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#22C55E33",
  },
  addCatHeaderText: {
    color: "#4ADE80",
    fontSize: 12,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#151E32",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1F2A44",
  },
  modalTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: "#0B1120",
    borderRadius: 12,
    padding: 12,
    color: "#F8FAFC",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#263552",
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#1E293B",
  },
  cancelBtnText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  createBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 70,
  },
  createBtnText: {
    color: "#0B1120",
    fontSize: 14,
    fontWeight: "700",
  },
});
