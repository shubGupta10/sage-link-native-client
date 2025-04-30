import React, { PropsWithChildren } from 'react';
import colors from '@/assets/Colors';

import { View } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";

const BackgroundGradient = ({ children }: PropsWithChildren) => {
  return (
    <View className="flex-1 relative">
      {/* Modern gradient background */}
      <LinearGradient
        colors={[colors.backgroundDark, '#1E293B', colors.backgroundDark]}
        locations={[0, 0.5, 1]}
        className="absolute inset-0"
      />
      
      {/* Ambient light effects */}
      <View className="absolute inset-0">
        <View className="absolute w-96 h-96 rounded-full bg-blue-400 opacity-10 blur-3xl top-0 -left-20" />
        <View className="absolute w-96 h-96 rounded-full bg-violet-400 opacity-10 blur-3xl -bottom-20 -right-20" />
      </View>
      
      {/* Content */}
      {children}
    </View>
  );
};

export default BackgroundGradient;