/**
 * 🛠️ ADMINISTRATIVE WAGES SETUP SCREEN
 */

import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { payrollService } from "@/src/services/payroll.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function WagesSetupScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form input rules state mapping
  const [basicSalary, setBasicSalary] = useState("");
  const [allowances, setAllowances] = useState("");
  const [deductions, setDeductions] = useState("");
  const [taxRate, setTaxRate] = useState("");

  const themeStyles = isDark ? THEME.dark : THEME.light;

  useEffect(() => {
    loadExistingStructure();
  }, []);

  const loadExistingStructure = async () => {
    if (!user?.companyId) return;
    setLoading(true);
    try {
      // 1. 👇 FIXED: Changed from getSalaryStructure to getSalaryStructures
      const response = await payrollService.getSalaryStructures(user.companyId);
      
      // 2. 👇 Extract the first configured schema element from the returned array array
      if (response && response.length > 0) {
        const structure = response[0];
        setBasicSalary(String(structure.basic_salary ?? ""));
        setAllowances(String(structure.allowances ?? ""));
        setDeductions(String(structure.deductions ?? ""));
        setTaxRate(String(structure.tax ?? ""));
      }
    } catch (error) {
      console.warn("No active schema structure established yet.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStructure = async () => {
    if (!user?.companyId) return;
    
    const payload = {
      basic_salary: Number(basicSalary) || 0,
      allowances: Number(allowances) || 0,
      deductions: Number(deductions) || 0,
      tax: Number(taxRate) || 0,
    };

    setSaving(true);
    try {
      await payrollService.createSalaryStructure(user.companyId, payload as any);
      Alert.alert("Success", "Corporate default wage matrices updated successfully!");
      router.back();
    } catch (error: any) {
      Alert.alert("Save Failed", error.message || "Could not push payroll guidelines.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: themeStyles.border,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.sm,
    color: themeStyles.text.primary,
    backgroundColor: isDark ? THEME.colors.dark.backgroundTertiary : "#f8fafc",
    marginBottom: THEME.spacing.md,
    fontSize: 14,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background.main }}>
      {/* Header element */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: THEME.spacing.lg, paddingVertical: THEME.spacing.md, borderBottomWidth: 1, borderBottomColor: themeStyles.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: THEME.spacing.sm, padding: THEME.spacing.xs }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={themeStyles.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: themeStyles.text.primary }}>Wages Matrix Configuration</Text>
          <Text style={{ fontSize: 12, color: themeStyles.text.secondary }}>Establish default base rates for payroll cycles</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator size="large" color={THEME.colors.primary} /></View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: THEME.spacing.lg }} showsVerticalScrollIndicator={false}>
            <PremiumCard style={{ padding: THEME.spacing.lg }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: themeStyles.text.secondary, marginBottom: 6 }}>Baseline Basic Salary (₹)</Text>
              <TextInput value={basicSalary} onChangeText={setBasicSalary} placeholder="e.g. 25000" placeholderTextColor={themeStyles.text.tertiary} keyboardType="numeric" style={inputStyle} />

              <Text style={{ fontSize: 13, fontWeight: "600", color: themeStyles.text.secondary, marginBottom: 6 }}>Standard Allowances (₹)</Text>
              <TextInput value={allowances} onChangeText={setAllowances} placeholder="e.g. 5000" placeholderTextColor={themeStyles.text.tertiary} keyboardType="numeric" style={inputStyle} />

              <Text style={{ fontSize: 13, fontWeight: "600", color: themeStyles.text.secondary, marginBottom: 6 }}>Default Fixed Deductions (₹)</Text>
              <TextInput value={deductions} onChangeText={setDeductions} placeholder="e.g. 1500" placeholderTextColor={themeStyles.text.tertiary} keyboardType="numeric" style={inputStyle} />

              <Text style={{ fontSize: 13, fontWeight: "600", color: themeStyles.text.secondary, marginBottom: 6 }}>Estimated Professional Tax Rate (₹)</Text>
              <TextInput value={taxRate} onChangeText={setTaxRate} placeholder="e.g. 200" placeholderTextColor={themeStyles.text.tertiary} keyboardType="numeric" style={inputStyle} />

              <TouchableOpacity
                disabled={saving}
                onPress={handleSaveStructure}
                style={{
                  backgroundColor: THEME.colors.primary,
                  paddingVertical: 14,
                  borderRadius: THEME.borderRadius.md,
                  alignItems: "center",
                  marginTop: THEME.spacing.sm,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="content-save-outline" size={18} color="#fff" />
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Commit Parameters</Text>
                  </>
                )}
              </TouchableOpacity>
            </PremiumCard>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}