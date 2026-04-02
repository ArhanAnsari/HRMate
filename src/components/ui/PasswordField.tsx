import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  error?: string;
}

export function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  error,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const borderColor = error
    ? THEME.colors.danger
    : isDark
      ? THEME.dark.border
      : THEME.light.border;

  return (
    <View style={{ marginBottom: THEME.spacing.md }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
          marginBottom: THEME.spacing.sm,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor,
          borderRadius: THEME.borderRadius.md,
          backgroundColor: isDark
            ? THEME.dark.background.alt
            : THEME.light.background.alt,
          minHeight: 44,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={
            isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
          }
          secureTextEntry={!showPassword}
          editable={editable}
          style={{
            flex: 1,
            paddingHorizontal: THEME.spacing.md,
            paddingVertical: THEME.spacing.md,
            fontSize: 16,
            color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
          }}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          style={{ paddingHorizontal: THEME.spacing.md }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
          />
        </TouchableOpacity>
      </View>
      {error ? (
        <Text
          style={{
            fontSize: 12,
            color: THEME.colors.danger,
            marginTop: THEME.spacing.sm,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
