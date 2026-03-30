import { BorderRadius, Colors, Spacing } from "@/src/constants";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import React from "react";
import { Text, TextInput, View, ViewStyle } from "react-native";

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  disabled?: boolean;
  error?: string;
  label?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  editable?: boolean;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      placeholder,
      value,
      onChangeText,
      secureTextEntry = false,
      keyboardType = "default",
      disabled = false,
      error,
      label,
      multiline = false,
      numberOfLines = 1,
      style,
      editable = true,
    },
    ref,
  ) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const colors = isDark ? Colors.dark : Colors.light;

    const containerStyle: ViewStyle = {
      marginBottom: Spacing.md,
    };

    const inputStyle: any = {
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: error ? colors.danger : colors.border,
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      fontSize: 16,
      color: colors.text,
      minHeight: multiline ? 100 : 44,
    };

    return (
      <View style={containerStyle}>
        {label && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.text,
              marginBottom: Spacing.sm,
            }}
          >
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable && !disabled}
          placeholderTextColor={colors.textTertiary}
          style={[inputStyle, style]}
          multiline={multiline}
          numberOfLines={numberOfLines}
          selectionColor={colors.tint}
        />
        {error && (
          <Text
            style={{
              fontSize: 12,
              color: colors.danger,
              marginTop: Spacing.sm,
            }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";
