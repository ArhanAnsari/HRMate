/**
 * 📥 BULK EMPLOYEE IMPORT SCREEN
 * Import employees from CSV with validation
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { usePermission } from "@/src/utils/rbac";
import { ValidationService } from "@/src/utils/validation.service";

interface EmployeeImportData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joiningDate: string;
  employmentType: "full_time" | "part_time" | "contract";
  baseSalary: number;
}

interface ImportResult {
  row: number;
  status: "success" | "error";
  message: string;
  data?: EmployeeImportData;
}

export default function BulkImportScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();

  const canBulkImport = usePermission("canBulkImport" as any);

  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [fileContent, setFileContent] = useState<EmployeeImportData[]>([]);

  const handleSelectFile = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setSelectedFile({
        name: file.name,
        size: file.size || 0,
      });

      // Read file content
      if (file.uri) {
        const content = await FileSystem.readAsStringAsync(file.uri);
        parseCSVContent(content);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      Alert.alert("Error", "Failed to select file");
    } finally {
      setUploading(false);
    }
  };

  const parseCSVContent = (content: string) => {
    try {
      const lines = content.split("\n").filter((line) => line.trim());

      // Skip header row
      const dataLines = lines.slice(1);
      const employees: EmployeeImportData[] = [];

      dataLines.forEach((line, index) => {
        const [
          firstName,
          lastName,
          email,
          phone,
          position,
          department,
          joiningDate,
          employmentType,
          baseSalary,
        ] = line.split(",").map((val) => val.trim());

        if (firstName && lastName && email && phone && position && department) {
          employees.push({
            firstName,
            lastName,
            email,
            phone,
            position,
            department,
            joiningDate: joiningDate || new Date().toISOString().split("T")[0],
            employmentType: (employmentType as any) || "full_time",
            baseSalary: parseFloat(baseSalary) || 0,
          });
        }
      });

      setFileContent(employees);
      Alert.alert("Success", `Parsed ${employees.length} employees from CSV`);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      Alert.alert("Error", "Failed to parse CSV file");
    }
  };

  const handleImportEmployees = async () => {
    if (fileContent.length === 0) {
      Alert.alert("Error", "No employees to import");
      return;
    }

    setImporting(true);
    try {
      const importResults: ImportResult[] = [];

      for (let i = 0; i < fileContent.length; i++) {
        const employee = fileContent[i];
        const rowNumber = i + 2; // +2 because of 0-indexing and header row

        try {
          // Validate employee data
          const validation = ValidationService.validateEmployeeForm({
            name: `${employee.firstName} ${employee.lastName}`,
            email: employee.email,
            phone: employee.phone,
            department: employee.department,
            role: employee.position,
            salary: employee.baseSalary,
            joinDate: employee.joiningDate,
          });

          if (!validation.valid) {
            importResults.push({
              row: rowNumber,
              status: "error",
              message: Object.values(validation.errors).join(", "),
            });
            continue;
          }

          // TODO: Call your API to create employee
          // For now, just simulate success
          importResults.push({
            row: rowNumber,
            status: "success",
            message: "Employee imported successfully",
            data: employee,
          });
        } catch (error) {
          importResults.push({
            row: rowNumber,
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      setResults(importResults);

      const successCount = importResults.filter(
        (r) => r.status === "success",
      ).length;
      const errorCount = importResults.filter(
        (r) => r.status === "error",
      ).length;

      Alert.alert(
        "Import Complete",
        `✅ ${successCount} imported\n❌ ${errorCount} failed`,
      );
    } finally {
      setImporting(false);
    }
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const styles = StyleSheet.create({
    container: containerStyle,
    header: {
      paddingHorizontal: THEME.spacing.lg,
      paddingVertical: THEME.spacing.md,
      backgroundColor: isDark
        ? THEME.dark.background.alt
        : THEME.light.background.alt,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? THEME.dark.border : THEME.light.border,
    },
    headerTitle: {
      fontSize: THEME.typography.h2.fontSize,
      fontWeight: "700",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    },
    content: {
      flex: 1,
      padding: THEME.spacing.lg,
    },
    noPermission: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: THEME.spacing.lg,
    },
    noPermissionIcon: {
      fontSize: 48,
      color: "#EF4444",
      marginBottom: THEME.spacing.md,
    },
    noPermissionText: {
      fontSize: THEME.typography.body.fontSize,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
      textAlign: "center",
    },
    section: {
      marginBottom: THEME.spacing.lg,
    },
    sectionTitle: {
      fontSize: THEME.typography.h3.fontSize,
      fontWeight: "700",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      marginBottom: THEME.spacing.md,
    },
    fileCard: {
      backgroundColor: isDark
        ? THEME.dark.background.alt
        : THEME.light.background.alt,
      borderRadius: THEME.spacing.md,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: THEME.colors.primary,
      padding: THEME.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 120,
    },
    fileIcon: {
      fontSize: 32,
      color: THEME.colors.primary,
      marginBottom: THEME.spacing.sm,
    },
    fileName: {
      fontSize: THEME.typography.body.fontSize,
      fontWeight: "600",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      marginTop: THEME.spacing.md,
    },
    fileSize: {
      fontSize: THEME.typography.bodySm.fontSize,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
      marginTop: THEME.spacing.xs,
    },
    selectButton: {
      marginTop: THEME.spacing.md,
    },
    importButton: {
      marginTop: THEME.spacing.md,
    },
    templateButton: {
      backgroundColor: isDark
        ? THEME.dark.background.tertiary
        : THEME.light.background.tertiary,
      padding: THEME.spacing.md,
      borderRadius: THEME.spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: THEME.spacing.md,
      marginBottom: THEME.spacing.md,
    },
    templateText: {
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      fontWeight: "600",
    },
    templateIcon: {
      fontSize: 20,
      color: THEME.colors.primary,
    },
    resultsList: {
      maxHeight: 300,
    },
    resultItem: {
      padding: THEME.spacing.md,
      marginBottom: THEME.spacing.sm,
      borderRadius: THEME.spacing.sm,
      borderLeftWidth: 4,
    },
    resultSuccess: {
      backgroundColor: "#DCFCE7",
      borderLeftColor: "#16A34A",
    },
    resultError: {
      backgroundColor: "#FEE2E2",
      borderLeftColor: "#DC2626",
    },
    resultRow: {
      fontWeight: "600",
      marginBottom: THEME.spacing.xs,
    },
    resultMessage: {
      fontSize: THEME.typography.bodySm.fontSize,
    },
    csvTemplate: {
      backgroundColor: isDark
        ? THEME.dark.background.tertiary
        : THEME.light.background.tertiary,
      padding: THEME.spacing.md,
      borderRadius: THEME.spacing.sm,
      marginTop: THEME.spacing.md,
    },
    csvText: {
      fontSize: 11,
      fontFamily: "Courier New",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      lineHeight: 18,
    },
  });

  if (!canBulkImport) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bulk Import</Text>
        </View>
        <View style={styles.noPermission}>
          <MaterialCommunityIcons
            name="lock-outline"
            style={styles.noPermissionIcon}
          />
          <Text style={styles.noPermissionText}>
            You don't have permission to import employees
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bulk Import Employees</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select CSV File</Text>
          <PremiumCard>
            {selectedFile ? (
              <>
                <View style={styles.fileCard}>
                  <MaterialCommunityIcons
                    name="file-delimited"
                    style={styles.fileIcon}
                  />
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                  <Text style={styles.fileSize}>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={handleSelectFile}
                  disabled={uploading}
                >
                  <Text
                    style={{
                      color: THEME.colors.primary,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Choose Different File
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.fileCard}>
                <MaterialCommunityIcons
                  name="cloud-upload-outline"
                  style={styles.fileIcon}
                />
                <Text
                  style={{
                    color: isDark
                      ? THEME.dark.text.secondary
                      : THEME.light.text.secondary,
                    marginTop: THEME.spacing.md,
                  }}
                >
                  No file selected. Click below to choose a CSV file.
                </Text>
              </View>
            )}

            <PrimaryButton
              label={uploading ? "Selecting..." : "Select CSV File"}
              onPress={handleSelectFile}
              style={styles.selectButton}
              disabled={uploading}
            />
          </PremiumCard>
        </View>

        {fileContent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Preview ({fileContent.length} employees)
            </Text>
            <PremiumCard>
              <FlatList
                data={fileContent.slice(0, 5)}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      paddingVertical: THEME.spacing.sm,
                      borderBottomWidth: index < 4 ? 1 : 0,
                      borderBottomColor: isDark
                        ? THEME.dark.border
                        : THEME.light.border,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        color: isDark
                          ? THEME.dark.text.primary
                          : THEME.light.text.primary,
                      }}
                    >
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDark
                          ? THEME.dark.text.secondary
                          : THEME.light.text.secondary,
                      }}
                    >
                      {item.email} • {item.position}
                    </Text>
                  </View>
                )}
                scrollEnabled={false}
              />
              {fileContent.length > 5 && (
                <Text
                  style={{
                    marginTop: THEME.spacing.md,
                    color: THEME.colors.primary,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  ...and {fileContent.length - 5} more
                </Text>
              )}
            </PremiumCard>

            <PrimaryButton
              label={
                importing
                  ? "Importing..."
                  : `Import ${fileContent.length} Employees`
              }
              onPress={handleImportEmployees}
              style={styles.importButton}
              disabled={importing || fileContent.length === 0}
            />
          </View>
        )}

        {results.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Import Results</Text>
            <View style={styles.resultsList}>
              {results.map((result, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.resultItem,
                    result.status === "success"
                      ? styles.resultSuccess
                      : styles.resultError,
                  ]}
                >
                  <Text style={styles.resultRow}>Row {result.row}</Text>
                  <Text style={styles.resultMessage}>{result.message}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CSV Template</Text>
          <PremiumCard>
            <Text style={{ marginBottom: THEME.spacing.md }}>
              Use this template format for your CSV file:
            </Text>
            <View style={styles.csvTemplate}>
              <Text style={styles.csvText}>
                firstName,lastName,email,phone,position,department,joiningDate,employmentType,baseSalary
              </Text>
              <Text style={styles.csvText}>
                John,Doe,john@example.com,9876543210,Software
                Engineer,Engineering,2024-01-15,full_time,50000
              </Text>
              <Text style={styles.csvText}>
                Jane,Smith,jane@example.com,9876543211,Product
                Manager,Product,2024-02-20,full_time,60000
              </Text>
              <Text style={styles.csvText}>
                Bob,Johnson,bob@example.com,9876543212,Intern,Engineering,2024-03-01,intern,15000
              </Text>
            </View>
          </PremiumCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
