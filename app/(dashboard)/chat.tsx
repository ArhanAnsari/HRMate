/**
 * 💬 CHAT SCREEN - Team Communication
 */

import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { chatService } from "@/src/services/domain.service";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const msgs = await chatService.getMessages();
      setMessages(msgs);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        sender: "You",
        content: newMessage,
        timestamp: "now",
      },
    ]);
    setNewMessage("");
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  };

  const titleStyle: TextStyle = {
    fontSize: 28,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.sm,
  };

  const renderMessage = ({ item }: { item: any }) => (
    <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: THEME.spacing.md,
        }}
      >
        <MaterialCommunityIcons
          name="account-circle"
          size={32}
          color={THEME.colors.primary}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: isDark
                ? THEME.dark.text.primary
                : THEME.light.text.primary,
            }}
          >
            {item.sender}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: isDark
                ? THEME.dark.text.secondary
                : THEME.light.text.secondary,
              marginTop: THEME.spacing.xs,
            }}
          >
            {item.content}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: isDark
                ? THEME.dark.text.tertiary
                : THEME.light.text.tertiary,
              marginTop: THEME.spacing.xs,
            }}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    </PremiumCard>
  );

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={contentStyle}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadMessages} />
          }
          ListHeaderComponent={() => (
            <View style={{ marginBottom: THEME.spacing.lg }}>
              <Text style={titleStyle}>Chat</Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark
                    ? THEME.dark.text.secondary
                    : THEME.light.text.secondary,
                }}
              >
                Team conversation
              </Text>
            </View>
          )}
        />
        <View
          style={{
            paddingHorizontal: THEME.spacing.lg,
            paddingVertical: THEME.spacing.md,
            borderTopWidth: 1,
            borderTopColor: isDark ? THEME.dark.border : THEME.light.border,
          }}
        >
          <View style={{ flexDirection: "row", gap: THEME.spacing.md }}>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
              value={newMessage}
              onChangeText={setNewMessage}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: isDark ? THEME.dark.border : THEME.light.border,
                borderRadius: THEME.borderRadius.md,
                paddingHorizontal: THEME.spacing.md,
                paddingVertical: THEME.spacing.md,
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: 44,
                height: 44,
                borderRadius: THEME.borderRadius.md,
                backgroundColor: THEME.colors.primary,
              }}
            >
              <MaterialCommunityIcons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
