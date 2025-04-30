"use client"

import BackgroundGradient from "@/components/BackgroundGradient"
import { useAuthStore } from "@/store/useAuthStore"
import { MaterialIcons } from "@expo/vector-icons"
import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
  Image,
  Linking,
} from "react-native"
import colors from "@/assets/Colors"

function ChatWithLink() {
  const { user, token } = useAuthStore()
  const [videoURL, setVideoURL] = useState<string>("")
  const [transcriptId, setTranscriptId] = useState<string>("")
  const [userEnteredResponse, setUserEnteredResponse] = useState<string>("")
  const [videoId, setVideoId] = useState<string>("")
  const [showModal, setShowModal] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isProcessingVideo, setIsProcessingVideo] = useState<boolean>(false)
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([])
  const [inputMessage, setInputMessage] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [errorType, setErrorType] = useState<"captcha" | "transcript" | "general" | null>(null)
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL
  const scrollViewRef = useRef<ScrollView>(null)
  const blurAnim = useRef(new Animated.Value(0)).current

  // Animate blur effect
  useEffect(() => {
    Animated.timing(blurAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start()
  }, [])

  // Extract video ID from URL for thumbnail
  const extractVideoIdForThumbnail = (url: string) => {
    if (!url) return null

    let videoId = null
    // Handle youtu.be format
    if (url.includes("youtu.be")) {
      const parts = url.split("/")
      const lastPart = parts[parts.length - 1]
      videoId = lastPart.split("?")[0]
    }
    // Handle youtube.com format
    else if (url.includes("youtube.com")) {
      const urlObj = new URL(url)
      videoId = urlObj.searchParams.get("v")
    }

    return videoId
  }

  // Define the getVideoLink function outside useEffect so it can be called from button click
  const getVideoLink = async () => {
    if (!videoURL) return

    setIsProcessingVideo(true)
    setError("")
    setErrorType(null)

    try {
      console.log("Processing URL:", videoURL)
      console.log("User ID:", user?.id)
      console.log("Token:", token?.accessToken ? "Present" : "Missing")

      const response = await fetch(`${backendUrl}/api/youtube/get-transcript`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.accessToken}`,
        },
        body: JSON.stringify({ userId: user?.id, videoURL: videoURL }),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error response:", errorData)

        // Check for specific error types
        if (response.status === 500) {
          setErrorType("captcha")
          throw new Error("YouTube is requiring verification for this video. Try another video or try again later.")
        } else if (errorData.message?.includes("Transcript not found")) {
          setErrorType("transcript")
          throw new Error("This video doesn't have available transcripts. Try another video.")
        } else {
          setErrorType("general")
          throw new Error(errorData.message || "Failed to process video")
        }
      }

      const data = await response.json()
      console.log("Processed video successfully:", data)

      setTranscriptId(data.transcriptId)
      setVideoId(data.videoId)
      setShowModal(false)

      // Add welcome message
      setMessages([
        {
          text: "Hi there! I've processed the video. What would you like to know about it?",
          isUser: false,
        },
      ])
    } catch (error: any) {
      console.error("Error processing video: ", error)
      setError(error.message || "Failed to process video. Please check the URL and try again.")
    } finally {
      setIsProcessingVideo(false)
    }
  }

  // Handle chat with the video
  useEffect(() => {
    const chatWithTheLink = async () => {
      if (!userEnteredResponse || !videoId) return

      setIsLoading(true)

      try {
        const response = await fetch(`${backendUrl}/api/youtube/chat-with-link`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token?.accessToken}`,
          },
          body: JSON.stringify({
            userResponse: userEnteredResponse,
            videoId: videoId,
            userId: user?.id,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to get response")
        }

        const data = await response.json()

        // Add AI response to messages
        setMessages((prev) => [
          ...prev,
          {
            text: data.response || "I couldn't find an answer to that in the video.",
            isUser: false,
          },
        ])
      } catch (error) {
        console.error("Error in chatWithLink: ", error)
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, I encountered an error. Please try again.",
            isUser: false,
          },
        ])
      } finally {
        setIsLoading(false)
        // Scroll to bottom after new message
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }
    }

    if (userEnteredResponse) {
      chatWithTheLink()
    }
  }, [userEnteredResponse])

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        text: inputMessage,
        isUser: true,
      },
    ])

    // Set for API call
    setUserEnteredResponse(inputMessage)

    // Clear input
    setInputMessage("")

    // Dismiss keyboard
    Keyboard.dismiss()

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  // Handle URL submission
  const handleSubmitURL = () => {
    if (!videoURL.trim()) {
      setError("Please enter a valid YouTube URL")
      setErrorType("general")
      return
    }

    // URL validation (basic)
    if (!videoURL.includes("youtube.com") && !videoURL.includes("youtu.be")) {
      setError("Please enter a valid YouTube URL")
      setErrorType("general")
      return
    }

    // Explicitly call getVideoLink when button is clicked
    getVideoLink()
  }

  // Open video in browser (for CAPTCHA cases)
  const openVideoInBrowser = () => {
    if (videoURL) {
      Linking.openURL(videoURL)
    }
  }

  // Get video thumbnail
  const thumbnailId = extractVideoIdForThumbnail(videoURL)
  const thumbnailUrl = thumbnailId ? `https://img.youtube.com/vi/${thumbnailId}/hqdefault.jpg` : null

  return (
    <BackgroundGradient>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: `rgba(15, 23, 42, ${blurAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.7, 0.85],
          })})`,
          backdropFilter: `blur(${blurAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          })}px)`,
        }}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-[rgba(255,255,255,0.1)]">
          <TouchableOpacity className="mr-4">
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>
            Chat with YouTube Video
          </Text>
        </View>

        {/* Chat Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={100}
        >
          <ScrollView ref={scrollViewRef} className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 20 }}>
            {messages.map((message, index) => (
              <View
                key={index}
                className={`mb-4 max-w-[85%] rounded-2xl p-3 ${
                  message.isUser
                    ? "bg-[#2563EB] self-end rounded-tr-none"
                    : "bg-[rgba(255,255,255,0.06)] self-start rounded-tl-none border border-[rgba(255,255,255,0.1)]"
                }`}
              >
                <Text style={{ color: message.isUser ? colors.textPrimary : colors.textSecondary }}>
                  {message.text}
                </Text>
              </View>
            ))}

            {isLoading && (
              <View className="self-start bg-[rgba(255,255,255,0.06)] p-4 rounded-2xl border border-[rgba(255,255,255,0.1)]">
                <ActivityIndicator color={colors.textPrimary} />
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View className="p-4 border-t border-[rgba(255,255,255,0.1)] flex-row items-center">
            <TextInput
              className="flex-1 bg-[rgba(255,255,255,0.06)] rounded-full px-4 py-3 mr-2 border border-[rgba(255,255,255,0.1)]"
              placeholder="Ask about the video..."
              placeholderTextColor={colors.textSecondary}
              value={inputMessage}
              onChangeText={setInputMessage}
              style={{ color: colors.textPrimary }}
              multiline
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              className="bg-[#3B82F6] w-12 h-12 rounded-full items-center justify-center"
              disabled={!inputMessage.trim() || isLoading}
              style={{ opacity: !inputMessage.trim() || isLoading ? 0.5 : 1 }}
            >
              <MaterialIcons name="send" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* URL Input Modal */}
        <Modal visible={showModal} transparent animationType="fade">
          <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: "rgba(15, 23, 42, 0.9)" }}>
            <View className="bg-[rgba(255,255,255,0.06)] p-6 rounded-3xl w-full max-w-md border border-[rgba(255,255,255,0.1)]">
              <Text className="text-xl font-bold mb-4 text-center" style={{ color: colors.textPrimary }}>
                Enter YouTube Video URL
              </Text>

              {thumbnailUrl && (
                <View className="mb-4 rounded-xl overflow-hidden">
                  <Image source={{ uri: thumbnailUrl }} style={{ width: "100%", height: 160 }} resizeMode="cover" />
                </View>
              )}

              <TextInput
                className="bg-[rgba(255,255,255,0.03)] rounded-xl px-4 py-3 mb-4 border border-[rgba(255,255,255,0.1)]"
                placeholder="https://youtube.com/..."
                placeholderTextColor={colors.textSecondary}
                value={videoURL}
                onChangeText={(text) => {
                  setVideoURL(text)
                  setError("")
                  setErrorType(null)
                }}
                style={{ color: colors.textPrimary }}
                autoCapitalize="none"
              />

              {error ? (
                <View className="mb-4 p-3 bg-[rgba(239,68,68,0.1)] rounded-lg border border-[rgba(239,68,68,0.3)]">
                  <Text className="text-[#EF4444]">{error}</Text>

                  {errorType === "captcha" && (
                    <View className="mt-2">
                      <Text className="text-[#EF4444] text-xs mb-2">
                        YouTube is showing a CAPTCHA verification for this video. You may need to:
                      </Text>
                      <TouchableOpacity
                        onPress={openVideoInBrowser}
                        className="bg-[rgba(239,68,68,0.2)] p-2 rounded-lg mt-1"
                      >
                        <Text className="text-[#EF4444] text-center">Open video in browser first</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {errorType === "transcript" && (
                    <Text className="text-[#EF4444] mt-1 text-xs">
                      This video doesn't have captions or transcripts available. Try a different video.
                    </Text>
                  )}

                  {errorType === "general" && (
                    <Text className="text-[#EF4444] mt-1 text-xs">
                      There was a problem processing this video. Please try again or try a different video.
                    </Text>
                  )}
                </View>
              ) : null}

              <TouchableOpacity
                className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] py-3 rounded-xl items-center"
                onPress={handleSubmitURL}
                disabled={isProcessingVideo}
              >
                {isProcessingVideo ? (
                  <ActivityIndicator color={colors.textPrimary} />
                ) : (
                  <Text className="font-bold" style={{ color: colors.textPrimary }}>
                    Process Video
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </BackgroundGradient>
  )
}

export default ChatWithLink
