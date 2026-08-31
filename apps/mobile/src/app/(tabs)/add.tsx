import { useEffect, useState } from "react";
import {
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
import { router } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useExpenseStore } from "@/store/useExpenseStore";

const categories = [
  { label: "Rent", icon: "home", color: "#F87171" },
  { label: "Food", icon: "restaurant", color: "#4ADE80" },
  { label: "Petrol", icon: "car", color: "#FBBF24" },
  { label: "Personal", icon: "card", color: "#A78BFA" },
  { label: "Personal", icon: "card", color: "#A78BFA" },

];

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Personal");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  const { category, getCategory } = useExpenseStore();

  useEffect(() => { getCategory() }, []);

  const numericAmount = Number(amount) || 0;
  const isValid = numericAmount > 0;

  const saveExpense = () => {
    if (!isValid) return;
    router.back();
  };

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const monthLabel = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const firstDay = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    1,
  ).getDay();
  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0,
  ).getDate();
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>MARCH 2026</Text>
            <Text style={styles.title}>Add expense</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            accessibilityLabel="Close add expense"
          >
            <Ionicons name="close" size={22} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>HOW MUCH?</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              style={styles.amountInput}
              accessibilityLabel="Expense amount"
            />
          </View>
          <Text style={styles.amountHint}>Add the amount you spent today</Text>
        </View>

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categoryGrid}>
          {(Array.isArray(category) && category.length > 0
            ? category.map((cat: any) => ({
                label: cat.name || cat.label || "Category",
                icon: cat.icon || "pricetag-outline",
                color: cat.color || "#4ADE80",
              }))
            : categories
          ).map((cat: any, index: number) => {
            const label = cat.label;
            const isSelected = selectedCategory === label;
            return (
              <TouchableOpacity
                key={cat.id || `${label}-${index}`}
                onPress={() => setSelectedCategory(label)}
                style={[
                  styles.categoryCard,
                  isSelected && styles.selectedCategory,
                ]}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: `${cat.color}22` },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={cat.color}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.selectedCategoryText,
                  ]}
                >
                  {label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.fieldCard}>
          <TouchableOpacity
            style={styles.fieldRow}
            activeOpacity={0.75}
            onPress={() => {
              setCalendarMonth(date);
              setCalendarVisible(true);
            }}
          >
            <View style={styles.fieldIcon}>
              <Ionicons name="calendar-outline" size={19} color="#94A3B8" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>Date</Text>
              <Text style={styles.fieldValue}>{formattedDate}</Text>
            </View>
            <Text style={styles.changeText}>Choose</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.noteRow}>
            <View style={styles.fieldIcon}>
              <Ionicons name="create-outline" size={19} color="#94A3B8" />
            </View>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a note (optional)"
              placeholderTextColor="#64748B"
              style={styles.noteInput}
            />
          </View>
        </View>

        <View style={styles.budgetNotice}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#4ADE80"
          />
          <Text style={styles.budgetNoticeText}>
            Your monthly and category limits are managed in Budget Setup.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, !isValid && styles.disabledButton]}
          onPress={saveExpense}
          disabled={!isValid}
        >
          <Ionicons
            name="checkmark"
            size={20}
            color={isValid ? "#0B1120" : "#64748B"}
          />
          <Text style={[styles.saveText, !isValid && styles.disabledText]}>
            Save expense
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={calendarVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarTitleButton}
                onPress={() => setYearPickerVisible((visible) => !visible)}
              >
                <Text style={styles.calendarTitle}>{monthLabel}</Text>
                <Ionicons
                  name={yearPickerVisible ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#94A3B8"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <Ionicons name="close" size={20} color="#CBD5E1" />
              </TouchableOpacity>
            </View>
            <View style={styles.monthControls}>
              <TouchableOpacity
                onPress={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
              >
                <Ionicons name="chevron-back" size={20} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
              >
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            {yearPickerVisible && (
              <View style={styles.yearPicker}>
                {Array.from(
                  { length: 9 },
                  (_, index) => calendarMonth.getFullYear() - 4 + index,
                ).map((year) => {
                  const selected = year === calendarMonth.getFullYear();
                  return (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.yearOption,
                        selected && styles.selectedYear,
                      ]}
                      onPress={() => {
                        setCalendarMonth(
                          new Date(year, calendarMonth.getMonth(), 1),
                        );
                        setYearPickerVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.yearText,
                          selected && styles.selectedYearText,
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <View style={styles.weekRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <Text key={`${day}-${index}`} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>
            <View style={styles.daysGrid}>
              {Array.from({ length: firstDay + daysInMonth }, (_, index) => {
                if (index < firstDay)
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                const day = index - firstDay + 1;
                const selected =
                  date.getDate() === day &&
                  date.getMonth() === calendarMonth.getMonth() &&
                  date.getFullYear() === calendarMonth.getFullYear();
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayCell, selected && styles.selectedDay]}
                    onPress={() => {
                      setDate(
                        new Date(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth(),
                          day,
                        ),
                      );
                      setCalendarVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.selectedDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
  monthlyBudgetCard: {
    backgroundColor: "#151E32",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1F2A44",
    marginBottom: 16,
  },
  budgetCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  budgetCardHint: { color: "#94A3B8", fontSize: 12, marginTop: 5 },
  budgetInputRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  currencySmall: {
    color: "#22C55E",
    fontSize: 28,
    fontWeight: "800",
    marginRight: 6,
  },
  budgetInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    paddingVertical: 0,
  },
  amountCard: {
    backgroundColor: "#151E32",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1F2A44",
    marginBottom: 26,
  },
  categoryLimitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151E32",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#1F2A44",
    padding: 14,
    marginBottom: 26,
  },
  limitIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#3A3016",
    alignItems: "center",
    justifyContent: "center",
  },
  limitContent: { flex: 1, marginLeft: 11 },
  limitInputRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  limitCurrency: { color: "#FBBF24", fontSize: 18, fontWeight: "800" },
  limitInput: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
    paddingVertical: 0,
    marginLeft: 4,
    minWidth: 70,
  },
  perMonth: { color: "#64748B", fontSize: 12 },
  amountLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  amountRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  currency: {
    color: "#22C55E",
    fontSize: 38,
    fontWeight: "800",
    marginRight: 7,
  },
  amountInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
    paddingVertical: 0,
  },
  amountHint: { color: "#94A3B8", fontSize: 12, marginTop: 12 },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  categoryCard: {
    width: "48%",
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151E32",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#1F2A44",
    padding: 10,
    marginBottom: 10,
  },
  selectedCategory: { borderColor: "#22C55E", backgroundColor: "#12291F" },
  categoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    flex: 1,
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
  },
  selectedCategoryText: { color: "#F8FAFC" },
  fieldCard: {
    backgroundColor: "#151E32",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#1F2A44",
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  fieldRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  noteRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  fieldIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldContent: { flex: 1, marginLeft: 11 },
  fieldLabel: { color: "#64748B", fontSize: 11, marginBottom: 3 },
  fieldValue: { color: "#E2E8F0", fontSize: 14, fontWeight: "700" },
  changeText: { color: "#4ADE80", fontSize: 12, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#263552" },
  noteInput: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 14,
    marginLeft: 11,
    paddingVertical: 8,
  },
  budgetNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#12291F",
    borderRadius: 14,
    padding: 13,
    marginBottom: 18,
  },
  budgetNoticeText: { flex: 1, color: "#86EFAC", fontSize: 12, lineHeight: 18 },
  warningNotice: { backgroundColor: "#351D22" },
  warningText: { color: "#FCA5A5" },
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
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2, 6, 23, 0.72)",
  },
  calendarCard: {
    backgroundColor: "#151E32",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calendarTitleButton: { flexDirection: "row", alignItems: "center", gap: 7 },
  calendarTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "800" },
  yearPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: "#0F172A",
    borderRadius: 14,
    padding: 10,
    marginTop: 14,
  },
  yearOption: {
    width: "30%",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 9,
  },
  selectedYear: { backgroundColor: "#22C55E" },
  yearText: { color: "#CBD5E1", fontSize: 13, fontWeight: "700" },
  selectedYearText: { color: "#0B1120" },
  monthControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  weekRow: { flexDirection: "row", marginTop: 12 },
  weekDay: {
    width: "14.28%",
    textAlign: "center",
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },
  daysGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  dayCell: {
    width: "14.28%",
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  selectedDay: { backgroundColor: "#22C55E" },
  dayText: { color: "#CBD5E1", fontSize: 14, fontWeight: "600" },
  selectedDayText: { color: "#0B1120", fontWeight: "800" },
  nativePickerWrap: {
    backgroundColor: "#151E32",
    borderRadius: 20,
    alignItems: "center",
    padding: 12,
    marginBottom: 18,
  },
  doneButton: {
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: "#22C55E",
    borderRadius: 12,
    paddingVertical: 11,
    marginTop: 8,
  },
  doneText: { color: "#0B1120", fontSize: 14, fontWeight: "800" },
});
