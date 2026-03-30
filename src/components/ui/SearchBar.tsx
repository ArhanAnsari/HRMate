/**
 * 🔍 SEARCH BAR COMPONENT - Premium search with filters
 * Real-time filtering, clear button, and filter icon
 */

import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Pressable,
    TextInput,
    TextStyle,
    useColorScheme,
    View,
    ViewStyle,
} from "react-native";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  onFilterPress?: () => void;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value,
  onChangeText,
  onClear,
  onFilterPress,
  icon,
  rightAction,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const containerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    marginVertical: THEME.spacing.md,
  };

  const searchContainerStyle: ViewStyle = {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark
      ? THEME.dark.background.alt
      : THEME.light.background.alt,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: isDark ? THEME.dark.border : THEME.light.border,
    paddingHorizontal: THEME.spacing.sm,
    gap: THEME.spacing.sm,
    height: THEME.componentSizes.input.height,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: THEME.typography.body.fontSize,
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    paddingVertical: THEME.spacing.sm,
  };

  const iconButtonStyle: ViewStyle = {
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
  };

  const clearButtonStyle: ViewStyle = {
    padding: THEME.spacing.xs,
  };

  return (
    <View style={[containerStyle, style]}>
      <View style={searchContainerStyle}>
        {icon || (
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={
              isDark ? THEME.dark.text.secondary : THEME.light.text.secondary
            }
          />
        )}
        <TextInput
          style={inputStyle}
          placeholder={placeholder}
          placeholderTextColor={
            isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
          }
          value={value}
          onChangeText={onChangeText}
        />
        {value && (
          <Pressable
            onPress={() => {
              onChangeText("");
              onClear?.();
            }}
            style={clearButtonStyle}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
            />
          </Pressable>
        )}
      </View>

      {onFilterPress && (
        <Pressable onPress={onFilterPress} style={iconButtonStyle}>
          <MaterialCommunityIcons
            name="tune"
            size={24}
            color={THEME.colors.primary}
          />
        </Pressable>
      )}

      {rightAction && rightAction}
    </View>
  );
};

export default SearchBar;
