/**
 * 🛡️ ERROR BOUNDARY COMPONENT
 * Graceful error handling and crash prevention
 */

import { THEME } from "@/src/theme";
import React from "react";
import {
    ScrollView,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error) {
    console.error("Error caught by boundary:", error);
    // Here you could send the error to a logging service
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const containerStyle: ViewStyle = {
        flex: 1,
        backgroundColor: THEME.light.background.main,
        justifyContent: "center",
        alignItems: "center",
      };

      const contentStyle: ViewStyle = {
        paddingHorizontal: THEME.spacing.lg,
        alignItems: "center",
      };

      const iconStyle: TextStyle = {
        fontSize: 64,
        marginBottom: THEME.spacing.lg,
      };

      const titleStyle: TextStyle = {
        fontSize: 24,
        fontWeight: "700",
        color: THEME.light.text.primary,
        marginBottom: THEME.spacing.md,
        textAlign: "center",
      };

      const messageStyle: TextStyle = {
        fontSize: 14,
        color: THEME.light.text.secondary,
        textAlign: "center",
        marginBottom: THEME.spacing.lg,
        lineHeight: 20,
      };

      const errorDetailsStyle: ViewStyle = {
        backgroundColor: THEME.light.background.tertiary,
        borderRadius: THEME.borderRadius.md,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.lg,
        maxHeight: 200,
        width: "100%",
      };

      const errorTextStyle: TextStyle = {
        fontSize: 11,
        color: THEME.colors.danger,
        fontFamily: "monospace",
      };

      return (
        <SafeAreaView style={containerStyle}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={contentStyle}>
              <Text style={iconStyle}>⚠️</Text>
              <Text style={titleStyle}>Something went wrong</Text>
              <Text style={messageStyle}>
                We encountered an unexpected error. Please try again, or contact
                support if the problem persists.
              </Text>

              {this.state.error && (
                <View style={errorDetailsStyle}>
                  <Text style={errorTextStyle}>{this.state.error.message}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={this.resetError}
                style={{
                  backgroundColor: THEME.colors.primary,
                  borderRadius: THEME.borderRadius.md,
                  paddingVertical: THEME.spacing.md,
                  paddingHorizontal: THEME.spacing.xl,
                  width: "100%",
                  alignItems: "center",
                  marginBottom: THEME.spacing.md,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Try Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  // Navigate home or reload app
                  this.resetError();
                }}
                style={{
                  backgroundColor: "transparent",
                  borderRadius: THEME.borderRadius.md,
                  paddingVertical: THEME.spacing.md,
                  paddingHorizontal: THEME.spacing.xl,
                  width: "100%",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: THEME.light.border,
                }}
              >
                <Text
                  style={{
                    color: THEME.light.text.primary,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Go to Home
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
