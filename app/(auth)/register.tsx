import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from '@expo/vector-icons';
import colors from "@/assets/Colors";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleRegister = async () => {
    if (!name || !email || !username || !password) {
      Alert.alert('All fields are required');
      return;
    }
    
    try {
      const res = await fetch(`${backendUrl}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, username, password }),
      });
      
      const data = await res.json();
      console.log('Register response:', data);
      
      if (res.ok) {
        Alert.alert('Success', 'Account created successfully');
        // Navigate to login screen
        router.push("/(auth)");
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };
  
  return (
    <View className="flex-1 relative">
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
      
      {/* Header */}
      <View className="flex-row items-center justify-between p-6">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 items-center justify-center">
            <Feather name="zap" size={16} color="#fff" />
          </View>
          <Text className="text-white text-lg font-bold ml-2">SageLink</Text>
        </View>
        
        <View className="w-10" />
      </View>
      
      {/* Main content - wrapped in ScrollView for smaller screens */}
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          <BlurView intensity={15} tint="dark" className="rounded-3xl overflow-hidden border border-white/10 p-6">
            <Text className="text-3xl font-bold text-white mb-2">Create Account</Text>
            <Text className="text-sky-200 text-lg mb-6">Join SageLink today</Text>
            
            {/* Full Name field */}
            <View className="mb-4">
              <Text className="text-white mb-2 ml-1">Full Name</Text>
              <View className="flex-row items-center bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                <Feather name="user" size={18} color="#CBD5E1" className="mr-2" />
                <TextInput
                  placeholder="Enter your full name"
                  placeholderTextColor="#64748B"
                  className="flex-1 text-white ml-2"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
            
            {/* Email field */}
            <View className="mb-4">
              <Text className="text-white mb-2 ml-1">Email</Text>
              <View className="flex-row items-center bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                <Feather name="mail" size={18} color="#CBD5E1" className="mr-2" />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#64748B"
                  className="flex-1 text-white ml-2"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>
            
            {/* Username field */}
            <View className="mb-4">
              <Text className="text-white mb-2 ml-1">Username</Text>
              <View className="flex-row items-center bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                <Feather name="at-sign" size={18} color="#CBD5E1" className="mr-2" />
                <TextInput
                  placeholder="Choose a username"
                  placeholderTextColor="#64748B"
                  className="flex-1 text-white ml-2"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>
            
            {/* Password field */}
            <View className="mb-6">
              <Text className="text-white mb-2 ml-1">Password</Text>
              <View className="flex-row items-center bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                <Feather name="lock" size={18} color="#CBD5E1" className="mr-2" />
                <TextInput
                  placeholder="Create a password"
                  placeholderTextColor="#64748B"
                  className="flex-1 text-white ml-2"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#CBD5E1" />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-400 text-xs mt-2 ml-1">
                Password must be at least 8 characters
              </Text>
            </View>
            
            {/* Register button */}
            <TouchableOpacity
              onPress={handleRegister}
              className="overflow-hidden rounded-xl mb-6"
            >
              <LinearGradient
                colors={[colors.buttonGradientStart, colors.buttonGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="w-full py-4 items-center justify-center"
              >
                <Text className="text-white font-bold text-base">Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Login link */}
            <View className="flex-row justify-center">
              <Text className="text-white mr-1">Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)")}>
                <Text className="text-sky-300 font-medium">Sign In</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </View>
  );
}