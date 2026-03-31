/**
 * 🎨 HRMate Logo Component
 * Reusable logo component for auth screens, dashboard, splash, and empty states
 */

import React from "react";
import { Image, ImageStyle, View, ViewStyle } from "react-native";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
}

const LOGO_SIZES = {
  sm: 48,
  md: 64,
  lg: 96,
  xl: 128,
};

export const Logo: React.FC<LogoProps> = ({
  size = "lg",
  containerStyle,
  imageStyle,
}) => {
  const logoSize = LOGO_SIZES[size];

  return (
    <View
      style={[
        { justifyContent: "center", alignItems: "center" },
        containerStyle,
      ]}
    >
      <Image
        source={require("../../../assets/images/logo.png")}
        style={[
          {
            width: logoSize,
            height: logoSize,
            resizeMode: "contain",
          },
          imageStyle,
        ]}
      />
    </View>
  );
};

export default Logo;
