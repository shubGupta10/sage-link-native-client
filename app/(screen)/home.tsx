import { useAuthStore } from '@/store/useAuthStore';
import React from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StatusBar,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  ScrollView
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import colors from '@/assets/Colors';
import BackgroundGradient from '@/components/BackgroundGradient';
import { useRouter } from 'expo-router';

interface User {
  name?: string;
  username?: string;
}

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface UserAvatarProps {
  user: User | null;
}

interface OptionBoxProps {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, style }) => {
  return (
    <BlurView 
      intensity={60} 
      tint="dark" 
      className="overflow-hidden rounded-3xl"
      style={style}
    >
      <View className="border border-opacity-30 rounded-3xl overflow-hidden" style={{ borderColor: colors.glassBorder }}>
        {children}
      </View>
    </BlurView>
  );
};

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const getInitials = (): string => {
    if (user?.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'User';
  };

  return (
    <View
      className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
      style={{
        backgroundColor: colors.secondary,
        shadowColor: colors.secondary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <Text className="text-lg font-bold" style={{ color: colors.buttonText, fontFamily: 'Poppins_600SemiBold' }}>
        {getInitials()}
      </Text>
    </View>
  );
};

const OptionBox: React.FC<OptionBoxProps> = ({ title, description, icon, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      className="mb-5 overflow-hidden"
      style={{ shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 }}
    >
      <GlassCard>
        <View className="p-6">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${colors.primary}20` }}>
              <Feather name={icon} size={24} color={colors.primary} />
            </View>
            <Text className="text-xl flex-1" style={{ color: colors.textPrimary, fontFamily: 'Poppins_700Bold' }}>
              {title}
            </Text>
          </View>
          
          <Text className="text-base mb-4" style={{ color: colors.textSecondary, fontFamily: 'Poppins_400Regular' }}>
            {description}
          </Text>
          
          <View className="flex-row justify-end">
            <Pressable 
              className="flex-row items-center py-2 px-4 rounded-full"
              style={{ backgroundColor: `${colors.primary}15` }}
            >
              <Text className="text-sm mr-2" style={{ color: colors.primary, fontFamily: 'Poppins_500Medium' }}>
                Open
              </Text>
              <Feather name="arrow-right" size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
};

const Home: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleChatWithLink = (): void => {
    router.push('/(screen)/chatWithLink')
  };

  const handleChatWithDoc = (): void => {
    router.push('/(screen)/chatWithDoc')
  };

  const handleSettings = (): void => {
    console.log('Settings pressed');
  };

  return (
    <BackgroundGradient>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="pt-14 px-6">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <UserAvatar user={user} />
              <View className="ml-3">
                <Text className="text-xs" style={{ color: colors.textSecondary, fontFamily: 'Poppins_400Regular' }}>
                  Welcome back
                </Text>
                <Text className="text-lg" style={{ color: colors.textPrimary, fontFamily: 'Poppins_600SemiBold' }}>
                  {user?.name || user?.username || 'User'}
                </Text>
              </View>
            </View>
            
            <Pressable
              onPress={handleSettings}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.backgroundGlass }}
            >
              <Feather name="settings" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <Text className="text-3xl mb-8" style={{ color: colors.textPrimary, fontFamily: 'Poppins_700Bold' }}>
            What can I do to help you?
          </Text>
          
          <View className="mt-2">
            <OptionBox
              title="Chat With Link"
              description="Import content from any URL to analyze and get insights"
              icon="link"
              onPress={handleChatWithLink}
            />
            
            <OptionBox
              title="Chat With Doc"
              description="Upload and analyze any document with AI assistance"
              icon="file-text"
              onPress={handleChatWithDoc}
            />
            
            <View className="h-20" />
          </View>
        </View>
      </ScrollView>
    </BackgroundGradient>
  );
};

export default Home;