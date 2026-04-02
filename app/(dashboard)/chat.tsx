/**
 * 🤖 AI ASSISTANT SCREEN - Interactive HR Chat
 * AI-powered chatbot for HR queries, insights, and recommendations
 */

import GeminiAIService from "@/src/services/gemini-ai.service";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
    useColorScheme,
} from "react-native";

interface Message {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: number;
}

const QUICK_PROMPTS = [
  "How can I improve attendance?",
  "Analyze our payroll trends",
  "What are typical HR metrics?",
  "Employee engagement tips",
];

export default function AIAssistantScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      content:
        "Hi! I'm HRMate AI Assistant. I can help you with HR insights, employee analytics, and recommendations. What would you like to know?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      // Get AI response
      const aiResponse = await GeminiAIService.chatWithAI(
        text,
        conversationHistory,
      );

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        content: aiResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Update conversation history
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: aiResponse },
      ]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const titleStyle: TextStyle = {
    fontSize: 28,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.sm,
  };

  const MessageBubble = React.useCallback(
    ({ item }: { item: Message }) => {
      const fadeAnim = React.useRef(new Animated.Value(0)).current;
      const translateYAnim = React.useRef(new Animated.Value(10)).current;

      useEffect(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, []);

      return (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
            alignItems: item.sender === "user" ? "flex-end" : "flex-start",
            marginHorizontal: THEME.spacing.lg,
            marginVertical: THEME.spacing.sm,
          }}
        >
          {item.sender === "ai" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: THEME.spacing.xs,
                marginBottom: THEME.spacing.xs,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: THEME.colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons
                  name="robot-happy-outline"
                  size={13}
                  color="#fff"
                />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: THEME.colors.primary,
                  letterSpacing: 0.3,
                }}
              >
                HRMate AI
              </Text>
            </View>
          )}
          <View
            style={[
              {
                maxWidth: "85%",
                paddingHorizontal: THEME.spacing.lg,
                paddingVertical: THEME.spacing.md,
                borderRadius: 16,
                borderBottomRightRadius: item.sender === "user" ? 4 : 16,
                borderBottomLeftRadius: item.sender === "ai" ? 4 : 16,
                backgroundColor:
                  item.sender === "user"
                    ? THEME.colors.primary
                    : isDark
                      ? THEME.dark.background.tertiary
                      : THEME.light.background.tertiary,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20,
                color:
                  item.sender === "user"
                    ? "#fff"
                    : isDark
                      ? THEME.dark.text.primary
                      : THEME.light.text.primary,
              }}
            >
              {item.content}
            </Text>
          </View>
        </Animated.View>
      );
    },
    [isDark],
  );

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble item={item} />
  );

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            paddingHorizontal: THEME.spacing.lg,
            paddingTop: THEME.spacing.md,
            paddingBottom: THEME.spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            gap: THEME.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? THEME.dark.border : THEME.light.border,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: THEME.colors.primary,
              justifyContent: "center",
              alignItems: "center",
              ...THEME.shadows.md,
            }}
          >
            <MaterialCommunityIcons name="robot-happy-outline" size={26} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: THEME.typography.h5.fontSize,
                fontWeight: "700",
                color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
              }}
            >
              HRMate AI
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: THEME.colors.success,
                }}
              />
              <Text
                style={{
                  fontSize: 13,
                  color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
                }}
              >
                Online · Ask me anything about HR
              </Text>
            </View>
          </View>
        </View>

        {messages.length === 1 && (
          <View
            style={{
              paddingTop: THEME.spacing.md,
              paddingBottom: THEME.spacing.sm,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: isDark
                  ? THEME.dark.text.secondary
                  : THEME.light.text.secondary,
                paddingHorizontal: THEME.spacing.lg,
                marginBottom: THEME.spacing.sm,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Suggested questions
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: THEME.spacing.lg,
                gap: THEME.spacing.sm,
              }}
            >
              {QUICK_PROMPTS.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSendMessage(prompt)}
                  style={{
                    paddingHorizontal: THEME.spacing.md,
                    paddingVertical: THEME.spacing.sm,
                    borderRadius: THEME.borderRadius.full,
                    borderWidth: 1,
                    borderColor: THEME.colors.primary,
                    backgroundColor: isDark
                      ? THEME.dark.background.alt
                      : THEME.colors.primaryLight,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: THEME.spacing.xs,
                  }}
                >
                  <MaterialCommunityIcons name="lightbulb-outline" size={14} color={THEME.colors.primary} />
                  <Text
                    style={{
                      fontSize: 13,
                      color: THEME.colors.primary,
                      fontWeight: "500",
                    }}
                  >
                    {prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: THEME.spacing.lg }}
          showsVerticalScrollIndicator={false}
        />

        {loading && (
          <View
            style={{
              alignItems: "center",
              paddingVertical: THEME.spacing.md,
            }}
          >
            <ActivityIndicator size="small" color={THEME.colors.primary} />
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: isDark ? THEME.dark.border : THEME.light.border,
              backgroundColor: isDark
                ? THEME.dark.background.main
                : THEME.light.background.main,
              paddingHorizontal: THEME.spacing.lg,
              paddingVertical: THEME.spacing.md,
              paddingBottom: THEME.spacing.lg,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: THEME.spacing.sm,
              }}
            >
              <TextInput
                placeholder="Type your message..."
                placeholderTextColor={
                  isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
                }
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                style={{
                  flex: 1,
                  minHeight: 44,
                  maxHeight: 120,
                  paddingHorizontal: THEME.spacing.md,
                  paddingVertical: THEME.spacing.sm,
                  borderRadius: THEME.borderRadius.xl,
                  backgroundColor: isDark
                    ? THEME.dark.background.alt
                    : THEME.light.background.alt,
                  color: isDark
                    ? THEME.dark.text.primary
                    : THEME.light.text.primary,
                  borderWidth: 1,
                  borderColor: isDark ? THEME.dark.border : THEME.light.border,
                  fontSize: 14,
                  lineHeight: 20,
                }}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => handleSendMessage(inputText)}
                disabled={loading || !inputText.trim()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor:
                    loading || !inputText.trim()
                      ? isDark
                        ? THEME.dark.background.tertiary
                        : THEME.light.background.tertiary
                      : THEME.colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  ...THEME.shadows.sm,
                }}
              >
                <MaterialCommunityIcons
                  name="send"
                  size={20}
                  color={
                    loading || !inputText.trim()
                      ? isDark
                        ? THEME.dark.text.tertiary
                        : THEME.light.text.tertiary
                      : "#FFFFFF"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
