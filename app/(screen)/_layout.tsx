import React from 'react'
import { Stack } from 'expo-router'

const ScreenLayout = () => {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' }
      }} 
    />
  );
}

export default ScreenLayout