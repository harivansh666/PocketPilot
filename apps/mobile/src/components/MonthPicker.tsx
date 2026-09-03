import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

type MonthPickerProps = {
  selectedMonth: string;
  onSelect: (month: string) => void;
};

function monthCode(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthPicker({ selectedMonth, onSelect }: MonthPickerProps) {
  const months = useMemo(() => {
    const current = new Date();
    return Array.from({ length: 13 }, (_, index) => {
      const date = new Date(
        current.getFullYear(),
        current.getMonth() - 6 + index,
        1,
      );
      return {
        code: monthCode(date),
        label: date.toLocaleString("en-US", { month: "short" }),
      };
    });
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {months.map((month) => {
        const isSelected = month.code === selectedMonth;
        return (
          <TouchableOpacity
            key={month.code}
            onPress={() => onSelect(month.code)}
            style={[styles.month, isSelected && styles.selectedMonth]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Select ${month.label} ${month.code.slice(0, 4)}`}
          >
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
              {month.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingBottom: 18 },
  month: {
    minWidth: 58,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1F2A44",
    backgroundColor: "#151E32",
    alignItems: "center",
  },
  selectedMonth: { backgroundColor: "#22C55E", borderColor: "#22C55E" },
  label: { color: "#94A3B8", fontSize: 13, fontWeight: "700" },
  selectedLabel: { color: "#07130B" },
});
