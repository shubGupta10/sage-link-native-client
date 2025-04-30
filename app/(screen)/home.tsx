import { useAuthStore } from '@/store/useAuthStore'
import React from 'react'
import { View, Text, ScrollView } from 'react-native'

const Home = () => {
  const { token, user } = useAuthStore()

  return (
    <ScrollView className="p-4">
      <Text className="text-xl font-bold mb-4 text-blue-800">🏠 Home</Text>

      {/* Token Info */}
      <Text className="text-lg font-semibold text-blue-600">🔐 Access Token:</Text>
      <Text selectable className="text-sm text-gray-700 mb-2">{token?.accessToken || 'N/A'}</Text>

      <Text className="text-lg font-semibold text-blue-600">♻️ Refresh Token:</Text>
      <Text selectable className="text-sm text-gray-700 mb-2">{token?.refreshToken || 'N/A'}</Text>

      <Text className="text-lg font-semibold text-green-700">⏳ Access Token Expires:</Text>
      <Text className="text-sm text-gray-700 mb-4">{token?.accessTokenExpiresAt || 'N/A'}</Text>

      <Text className="text-lg font-semibold text-green-700">🕒 Refresh Token Expires:</Text>
      <Text className="text-sm text-gray-700 mb-4">{token?.refreshTokenExpiresAt || 'N/A'}</Text>

      {/* User Info */}
      <Text className="text-lg font-semibold text-purple-700">🙋 Username:</Text>
      <Text className="text-sm text-gray-700 mb-2">{user?.username || 'N/A'}</Text>

      <Text className="text-lg font-semibold text-purple-700">📧 Email:</Text>
      <Text className="text-sm text-gray-700 mb-2">{user?.email || 'N/A'}</Text>

      <Text className="text-lg font-semibold text-purple-700">🆔 User ID:</Text>
      <Text className="text-sm text-gray-700 mb-2">{user?.id || 'N/A'}</Text>

      <Text className="text-lg font-semibold text-purple-700">📛 Full Name:</Text>
      <Text className="text-sm text-gray-700 mb-2">{user?.name || 'N/A'}</Text>

      <Text className="text-lg font-semibold text-purple-700">🖼️ Profile Photo:</Text>
      <Text className="text-sm text-gray-700">{user?.profilePhoto || 'Not uploaded'}</Text>
    </ScrollView>
  )
}

export default Home
