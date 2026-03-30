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
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { Button } from "../../../src/components/ui/button";
import { Container } from "../../../src/components/ui/container";
import { Colors, Spacing } from "../../../src/constants";
import { useAuthStore } from "../../../src/state/auth.store";
import { useEmployeeStore } from "../../../src/state/employee.store";
import { useUIStore } from "../../../src/state/ui.store";
import {
    generateCSVTemplate,
    parseCSV,
    validateCSVFormat,
} from "../../../src/utils/csv-parser";

export default function BulkImportScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  const { user } = useAuthStore();
  const { bulkImportEmployees, isLoading } = useEmployeeStore();
  const { showToast } = useUIStore();

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [csvPreview, setCSVPreview] = useState<string>("");
  const [importCount, setImportCount] = useState(0);

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile(asset);

        // Read file content
        const content = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: "utf8",
        });

        // Validate and show preview
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

        // Count rows
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
      // For web
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
      // For native - save to documents
      const path = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(path, template);
      showToast(`Template saved to Documents: ${fileName}`, "success");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Container padding={Spacing.lg}>
        <View style={{ marginBottom: Spacing.lg }}>
          <Button
            title="← Back"
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
          />
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: colors.text,
            marginBottom: Spacing.md,
          }}
        >
          📥 Bulk Import Employees
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Instructions */}
          <View
            style={{
              backgroundColor: isDark ? "#1f1f1f" : "#f0f9ff",
              borderRadius: 12,
              padding: Spacing.md,
              marginBottom: Spacing.lg,
              borderLeftWidth: 4,
              borderLeftColor: "#0ea5e9",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              📋 Instructions:
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                lineHeight: 18,
              }}
            >
              1. Download the CSV template{"\n"}
              2. Fill in employee data{"\n"}
              3. Select the file to import{"\n"}
              4. Review and confirm{"\n"}
              5. Employees will be added to your company
            </Text>
          </View>

          {/* Template Download */}
          <TouchableOpacity
            onPress={handleDownloadTemplate}
            style={{
              backgroundColor: "#8b5cf6",
              borderRadius: 8,
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.lg,
              marginBottom: Spacing.lg,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
              📥 Download CSV Template
            </Text>
          </TouchableOpacity>

          {/* File Selection */}
          <TouchableOpacity
            disabled={isLoading}
            onPress={handleSelectFile}
            style={{
              backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6",
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: "#3b82f6",
              borderRadius: 12,
              padding: Spacing.lg,
              marginBottom: Spacing.lg,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24, marginBottom: 8 }}>📁</Text>
            <Text
              style={{
                color: "#3b82f6",
                fontWeight: "600",
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              Choose CSV File
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {selectedFile
                ? selectedFile.name
                : "Click to select a file (*.csv)"}
            </Text>
          </TouchableOpacity>

          {/* Preview */}
          {csvPreview && (
            <>
              <View
                style={{
                  backgroundColor: isDark ? "#1f1f1f" : "#f9fafb",
                  borderRadius: 8,
                  padding: Spacing.md,
                  marginBottom: Spacing.md,
                  borderWidth: 1,
                  borderColor: isDark ? "#333" : "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  👁️ Preview (First 5 rows):
                </Text>
                <Text
                  style={{
                    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                    fontSize: 11,
                    color: colors.textSecondary,
                    backgroundColor: isDark ? "#0f0f0f" : "#f3f4f6",
                    padding: Spacing.sm,
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  {csvPreview}
                </Text>
              </View>

              {/* Import Summary */}
              <View
                style={{
                  backgroundColor: "#10b981",
                  borderRadius: 8,
                  paddingVertical: Spacing.md,
                  paddingHorizontal: Spacing.lg,
                  marginBottom: Spacing.lg,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 13, marginBottom: 4 }}>
                  Ready to import
                </Text>
                <Text
                  style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}
                >
                  {importCount} employees
                </Text>
              </View>

              {/* Import Button */}
              <TouchableOpacity
                disabled={isLoading || importCount === 0}
                onPress={handleImport}
                style={{
                  backgroundColor:
                    isLoading || importCount === 0 ? "#9ca3af" : "#10b981",
                  borderRadius: 8,
                  paddingVertical: Spacing.md,
                  alignItems: "center",
                  marginBottom: Spacing.lg,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}
                  >
                    ✓ Confirm & Import
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* CSV Format Info */}
          <View
            style={{
              backgroundColor: isDark ? "#1f1f1f" : "#fef3c7",
              borderRadius: 8,
              padding: Spacing.md,
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#fde68a",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: isDark ? "#fbbf24" : "#b45309",
                marginBottom: 8,
              }}
            >
              ⚠️ Required CSV Columns:
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: isDark ? "#fca5a5" : "#92400e",
                fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                lineHeight: 18,
              }}
            >
              firstName, lastName, email, phone,{"\n"}
              position, department, joiningDate{"\n"}
              {"\n"}
              (Optional: dateOfBirth)
            </Text>
          </View>

          <View style={{ height: Spacing.lg }} />
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
}
