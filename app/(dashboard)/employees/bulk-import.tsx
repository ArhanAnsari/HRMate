import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { useAuthStore } from "../../../src/state/auth.store";
import { useEmployeeStore } from "../../../src/state/employee.store";
import { useUIStore } from "../../../src/state/ui.store";
import { THEME } from "../../../src/theme";
import {
  generateCSVTemplate,
  parseCSV,
  validateCSVFormat,
} from "../../../src/utils/csv-parser";

export default function BulkImportScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const { user } = useAuthStore();
  const { bulkImportEmployees, isLoading } = useEmployeeStore();
  const { showToast } = useUIStore();

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [csvPreview, setCSVPreview] = useState<string>("");
  const [importCount, setImportCount] = useState(0);

  const themeStyles = isDark ? THEME.dark : THEME.light;

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile(asset);

        const content = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: "utf8",
        });

        const validation = validateCSVFormat(content);
        if (!validation.valid) {
          Alert.alert(
            "Invalid CSV Format",
            validation.errors.join("\n") +
              "\n\nExpected columns: firstName, lastName, email, phone, position, department, joiningDate",
          );
          setSelectedFile(null);
          return;
        }

        setCSVPreview(content.split("\n").slice(0, 6).join("\n"));

        const rows = content.split("\n").filter((line) => line.trim());
        setImportCount(Math.max(0, rows.length - 1));
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to select file",
        "error",
      );
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !user?.companyId) {
      showToast("Please select a file first", "error");
      return;
    }

    try {
      const content = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: "utf8",
      });

      const employees = parseCSV(content);
      await bulkImportEmployees(user.companyId, employees);

      showToast(
        `Successfully imported ${employees.length} employees!`,
        "success",
      );
      router.back();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to import employees",
        "error",
      );
    }
  };

  const handleDownloadTemplate = async () => {
    const template = generateCSVTemplate();
    const fileName = `employee-import-template.csv`;

    if (Platform.OS === "web") {
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/csv;charset=utf-8," + encodeURIComponent(template),
      );
      element.setAttribute("download", fileName);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      const path = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(path, template);
      showToast(`Template saved to Documents: ${fileName}`, "success");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background.main }}>
      {/* Premium Header Layout */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: THEME.spacing.lg,
          paddingBottom: THEME.spacing.md,
          paddingTop: THEME.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: themeStyles.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginRight: THEME.spacing.md,
            padding: THEME.spacing.xs,
            borderRadius: THEME.borderRadius.full,
            backgroundColor: isDark ? THEME.colors.dark.backgroundAlt : THEME.colors.background.alt,
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={themeStyles.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: THEME.typography.h4.fontSize, fontWeight: THEME.typography.h4.fontWeight, color: themeStyles.text.primary }}>
            Bulk Import
          </Text>
          <Text style={{ fontSize: THEME.typography.bodyXs.fontSize, color: themeStyles.text.secondary }}>
            Add large teams instantly via spreadsheet
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: THEME.spacing.lg }}>
        
        {/* Dynamic Instructional Blueprint Card */}
        <Animated.View 
          entering={FadeInDown.duration(300)}
          style={{
            backgroundColor: isDark ? THEME.colors.dark.backgroundAlt : THEME.colors.infoLight,
            borderRadius: THEME.borderRadius.lg,
            padding: THEME.spacing.md,
            marginBottom: THEME.spacing.lg,
            borderLeftWidth: 4,
            borderLeftColor: THEME.colors.info,
            ...THEME.shadows.xs,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: THEME.spacing.xs }}>
            <MaterialCommunityIcons name="text-box-check-outline" size={18} color={isDark ? THEME.colors.info : THEME.colors.text.primary} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: isDark ? THEME.colors.dark.text : THEME.colors.text.primary }}>
              Execution Checklist:
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: themeStyles.text.secondary, lineHeight: 20 }}>
            1. Download the unified structural CSV template.{"\n"}
            2. Input records without altering header row definitions.{"\n"}
            3. Target and upload the newly formatted spreadsheet file below.
          </Text>
        </Animated.View>

        {/* Action: Template Download Button */}
        <TouchableOpacity
          onPress={handleDownloadTemplate}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: isDark ? THEME.colors.dark.backgroundAlt : THEME.colors.background.alt,
            borderWidth: 1,
            borderColor: THEME.colors.primary,
            borderRadius: THEME.borderRadius.md,
            paddingVertical: THEME.spacing.md,
            marginBottom: THEME.spacing.lg,
          }}
        >
          <MaterialCommunityIcons name="download-box-outline" size={20} color={THEME.colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ color: THEME.colors.primary, fontWeight: "600", fontSize: 14 }}>
            Download CSV Format Template
          </Text>
        </TouchableOpacity>

        {/* Component: Elegant File Upload Droppanel Zone */}
        <TouchableOpacity
          disabled={isLoading}
          onPress={handleSelectFile}
          style={{
            backgroundColor: isDark ? THEME.colors.dark.backgroundAlt : THEME.colors.background.alt,
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: selectedFile ? THEME.colors.success : THEME.colors.primary,
            borderRadius: THEME.borderRadius.lg,
            paddingVertical: THEME.spacing.xl,
            paddingHorizontal: THEME.spacing.lg,
            marginBottom: THEME.spacing.lg,
            alignItems: "center",
          }}
        >
          <View 
            style={{ 
              width: 54, 
              height: 54, 
              borderRadius: 27, 
              backgroundColor: selectedFile ? THEME.colors.successLight : THEME.colors.primaryLight,
              justifyContent: "center", 
              alignItems: "center",
              marginBottom: THEME.spacing.sm
            }}
          >
            <MaterialCommunityIcons 
              name={selectedFile ? "file-check-outline" : "file-upload-outline"} 
              size={28} 
              color={selectedFile ? THEME.colors.success : THEME.colors.primary} 
            />
          </View>
          <Text style={{ color: themeStyles.text.primary, fontWeight: "700", fontSize: 15, marginBottom: 4 }}>
            {selectedFile ? "Spreadsheet Attached Successfully" : "Target Workspace File"}
          </Text>
          <Text style={{ color: themeStyles.text.tertiary, fontSize: 12, textAlign: "center", paddingHorizontal: THEME.spacing.md }}>
            {selectedFile ? selectedFile.name : "Select or drop a standard .csv data system file"}
          </Text>
        </TouchableOpacity>

        {/* Dynamic Display: Parsing Code Previewer Modules */}
        {csvPreview && (
          <Animated.View entering={FadeInUp.duration(250)}>
            
            {/* Visual File Preview Console */}
            <View
              style={{
                backgroundColor: themeStyles.background.alt,
                borderRadius: THEME.borderRadius.md,
                padding: THEME.spacing.md,
                marginBottom: THEME.spacing.md,
                borderWidth: 1,
                borderColor: themeStyles.border,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: themeStyles.text.primary, marginBottom: THEME.spacing.xs }}>
                📄 System Parsing Log (First 5 Rows):
              </Text>
              <Text
                style={{
                  fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
                  fontSize: 11,
                  color: isDark ? THEME.colors.dark.textSecondary : THEME.colors.text.secondary,
                  backgroundColor: isDark ? THEME.colors.dark.backgroundTertiary : "#f1f5f9",
                  padding: THEME.spacing.sm,
                  borderRadius: THEME.borderRadius.xs,
                  lineHeight: 16,
                }}
              >
                {csvPreview}
              </Text>
            </View>

            {/* Ready Status Bar Indicator */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: THEME.colors.successLight,
                borderRadius: THEME.borderRadius.md,
                padding: THEME.spacing.md,
                marginBottom: THEME.spacing.lg,
                borderWidth: 1,
                borderColor: THEME.colors.success,
              }}
            >
              <MaterialCommunityIcons name="account-multiple-plus" size={24} color={THEME.colors.success} style={{ marginRight: THEME.spacing.md }} />
              <View>
                <Text style={{ color: THEME.colors.success, fontSize: 12, fontWeight: "600" }}>
                  Validation passed successfully
                </Text>
                <Text style={{ color: THEME.colors.text.primary, fontSize: 18, fontWeight: "700" }}>
                  Ready to append {importCount} employees
                </Text>
              </View>
            </View>

            {/* Ultimate Action Commit Trigger */}
            <TouchableOpacity
              disabled={isLoading || importCount === 0}
              onPress={handleImport}
              style={{
                backgroundColor: isLoading || importCount === 0 ? themeStyles.border : THEME.colors.success,
                borderRadius: THEME.borderRadius.md,
                paddingVertical: THEME.spacing.md,
                alignItems: "center",
                marginBottom: THEME.spacing.xl,
                ...THEME.shadows.sm
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                  Commit & Execute Import
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Data Architecture Validation Cheat Sheet */}
        <View
          style={{
            backgroundColor: isDark ? THEME.colors.dark.backgroundAlt : THEME.colors.warningLight,
            borderRadius: THEME.borderRadius.md,
            padding: THEME.spacing.md,
            borderWidth: 1,
            borderColor: isDark ? THEME.colors.dark.border : THEME.colors.warning,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: isDark ? THEME.colors.warning : "#b45309", marginBottom: 4 }}>
            ⚠️ Strict Column Attribute Structural Bounds:
          </Text>
          <Text style={{ fontSize: 11, color: isDark ? THEME.colors.dark.textTertiary : "#92400e", fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", lineHeight: 16 }}>
            firstName, lastName, email, phone, position, department, joiningDate
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
