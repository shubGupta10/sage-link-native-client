import { Stack, useRouter, useSegments } from "expo-router"
import "./globals.css"
import SafeScreen from "@/components/SafeScreen"
import { StatusBar } from "expo-status-bar"
import { useAuthStore } from "@/store/useAuthStore"
import { useEffect } from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { View } from "react-native"
import BackgroundGradient from "@/components/BackgroundGradient"

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()
  const { user, hydrated } = useAuthStore()

  useEffect(() => {
    if (!hydrated) return

    const isAuthScreen = segments[0] === "(auth)"
    const isScreen = segments[0] === "(screen)"
    const isLoggedIn = !!user

    if (!isLoggedIn && !isAuthScreen && !isScreen) {
      router.replace("/")
    } else if (isLoggedIn && isAuthScreen) {
      router.replace("/(screen)/home")
    }
  }, [hydrated, user, segments])

  if (!hydrated) {
    return (
      <View className="flex-1 justify-center items-center">
        <MaterialIcons name="hourglass-empty" size={32} color="black" />
      </View>
    )
  }

  return (
    <BackgroundGradient>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(screen)" />
        </Stack>
        <StatusBar style="light" />
      </SafeScreen>
    </BackgroundGradient>
  )
}