import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import colors from "@/assets/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from '@expo/vector-icons';

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
    
  return (
    <View className="flex-1 relative" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Modern gradient background */}
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        locations={[0, 0.5, 1]}
        className="absolute inset-0"
      />
      
      {/* Ambient light effects */}
      <View className="absolute inset-0">
        <View className="absolute w-96 h-96 rounded-full bg-blue-400 opacity-10 blur-3xl top-0 -left-20" />
        <View className="absolute w-96 h-96 rounded-full bg-violet-400 opacity-10 blur-3xl -bottom-20 -right-20" />
      </View>
      
      {/* Main container */}
      <View className="flex-1 justify-between px-5">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 items-center justify-center">
              <Feather name="zap" size={20} color="#fff" />
            </View>
            <Text className="text-white text-lg font-bold ml-2">SageLink</Text>
          </View>
          
          <Pressable className="px-3 py-2 rounded-lg bg-white/10">
            <Text className="text-white text-sm font-medium">Help</Text>
          </Pressable>
        </View>
        
        {/* Hero content */}
        <View className="items-center px-2 -mt-6">
          {/* App image with reflection effect */}
          <View className="mb-8 items-center">
            <Image
              source={require("@/assets/images/landingImage.png")}
              className="w-72 h-72 rounded-3xl"
              alt="App Preview"
            />
            <View className="w-64 h-4 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full mt-2 blur-sm" />
          </View>
          
          {/* Main text content */}
          <View className="items-center mb-6">
            <Text className="text-3xl font-bold text-center text-white">
              AI-Powered Insights
            </Text>
            <Text className="text-lg font-medium text-center text-sky-200 mt-2 mb-4">
              From PDFs & Videos to Answers
            </Text>
            
            <BlurView intensity={15} tint="dark" className="w-full rounded-xl overflow-hidden mb-6 border border-white/10">
              <View className="p-4">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                    <Feather name="file-text" size={16} color={colors.textHighlight} />
                  </View>
                  <Text className="text-white font-medium">Upload PDFs & get instant analysis</Text>
                </View>
                
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-violet-500/20 items-center justify-center mr-3">
                    <Feather name="youtube" size={16} color={colors.textHighlight} />
                  </View>
                  <Text className="text-white font-medium">Extract key insights from YouTube</Text>
                </View>
              </View>
            </BlurView>
          </View>
        </View>
        
        {/* Action buttons */}
        <View className="px-2 mb-8">
          {/* Primary button */}
          <Pressable
            onPress={() => router.push("/(auth)")}
            className="w-full mb-4 overflow-hidden rounded-xl active:scale-98"
          >
            <LinearGradient
              colors={[colors.buttonGradientStart, colors.buttonGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 items-center justify-center"
            >
              <View className="flex-row items-center">
                <Text className="text-white font-bold text-lg mr-2">Get Started</Text>
                <Feather name="arrow-right" size={20} color="white" />
              </View>
            </LinearGradient>
          </Pressable>
          
        </View>
      </View>
    </View>
  );
}