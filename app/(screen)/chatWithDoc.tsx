"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
  TouchableWithoutFeedback
} from "react-native"
import * as DocumentPicker from "expo-document-picker"
import colors from "@/assets/Colors"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

function ChatWithDoc() {
  const { user, token } = useAuthStore()
  const [fileId, setFileId] = useState("")
  const [userResponse, setUserResponse] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<DocumentPicker.DocumentPickerAsset[]>([])
  const [showFileUpload, setShowFileUpload] = useState(true)
  const scrollViewRef = useRef<ScrollView>(null)
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL!
  
  const MAX_DOCUMENTS = 5 // Maximum number of documents allowed

  const handleSelectFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: true
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Check if adding new documents exceeds the maximum limit
        if (selectedDocuments.length + result.assets.length <= MAX_DOCUMENTS) {
          setSelectedDocuments((prevDocs) => [...prevDocs, ...result.assets]);
        } else {
          Alert.alert(
            "Document Limit Exceeded", 
            `You can select a maximum of ${MAX_DOCUMENTS} documents. Please remove some documents before adding more.`
          );
        }
      }
    } catch (error) {
      console.error("Document picking error:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  }
  
  const removeDocument = (index: number) => {
    setSelectedDocuments((prevDocs) => 
      prevDocs.filter((_, i) => i !== index)
    );
  }
  
  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'Word';
      case 'xls':
      case 'xlsx':
        return 'Excel';
      default:
        return 'Unknown';
    }
  }

  const getFileSize = (bytes?: number): string => {
    if (!bytes) return "Unknown size";
    
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  const uploadDocuments = async () => {
    if (selectedDocuments.length === 0) {
      Alert.alert("No Documents", "Please select at least one document to upload");
      return;
    }

    setIsUploading(true);

    try {
      // For now we'll just use the first document in the array
      const selectedFile = selectedDocuments[0];
      
      // Create form data
      const formData = new FormData();
      
      // Add file to form data
      const fileToUpload = {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || "application/pdf",
      } as unknown as Blob;
      
      formData.append("file", fileToUpload);
      formData.append("userId", user?.id ?? '');

      const response = await fetch(`${backendUrl}/api/chatdoc/upload-document`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token?.refreshToken}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFileId(data.fileId);
        setShowFileUpload(false);
        
        setMessages([
          {
            id: Date.now().toString(),
            text: "I've processed your document. What would you like to know about it?",
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      } else {
        console.error("Upload failed:", data.message);
        Alert.alert("Upload Failed", data.message || "Please try again later");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  }

  const sendMessage = async () => {
    if (!userResponse.trim() || !fileId) return

    const userMessage = {
      id: Date.now().toString(),
      text: userResponse,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])
    setIsLoading(true)
    const currentUserResponse = userResponse
    setUserResponse("")

    try {
      const response = await fetch(`${backendUrl}/api/chatdoc/chat-with-doc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.refreshToken}`,
        },
        body: JSON.stringify({
          fileId: fileId,
          userId: user?.id,
          message: currentUserResponse,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date(),
        }

        setMessages((prevMessages) => [...prevMessages, aiMessage])
      } else {
        console.error("Error:", data.error)
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I encountered an error processing your request.",
            isUser: false,
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I encountered an error processing your request.",
          isUser: false,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <View className="flex-1 bg-white dark:bg-slate-900">
        {showFileUpload ? (
          <View className="flex-1 justify-center items-center p-6">
            <View className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <Text className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-50">
                Upload Documents
              </Text>

              <View className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 mb-6 items-center justify-center">
                <MaterialIcons name="file-upload" size={48} color={colors.primary} />

                {selectedDocuments.length > 0 ? (
                  <View className="w-full mt-4">
                    <Text className="text-slate-800 dark:text-slate-200 font-medium mb-2">
                      Selected Documents ({selectedDocuments.length}/{MAX_DOCUMENTS})
                    </Text>
                    <FlatList
                      data={selectedDocuments}
                      keyExtractor={(item, index) => `doc-${index}`}
                      renderItem={({ item, index }) => (
                        <View className="flex-row justify-between items-center py-2 px-3 bg-slate-100 dark:bg-slate-700 rounded-lg mb-2">
                          <View className="flex-1 mr-2">
                            <Text className="text-slate-800 dark:text-slate-200 font-medium" numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                              {getFileType(item.name)} • {getFileSize(item.size)}
                            </Text>
                          </View>
                          <Button 
                            onPress={() => removeDocument(index)}
                            title="Remove"
                            color="#FF5252"
                          />
                        </View>
                      )}
                      style={{ maxHeight: 150 }}
                    />
                  </View>
                ) : (
                  <Text className="text-slate-500 dark:text-slate-400 text-center mt-4">
                    Select PDF documents to chat with
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <Button 
                  onPress={handleSelectFiles}
                  title="Select PDF Documents"
                  color="#3B82F6" // bg-blue-500
                />
              </View>

              <Button
                onPress={selectedDocuments.length > 0 ? uploadDocuments : undefined}
                title={isUploading ? "Uploading..." : "Upload & Start Chat"}
                disabled={selectedDocuments.length === 0}
                color={selectedDocuments.length > 0 ? "#4F46E5" : "#9CA3AF"} // Indigo or gray
              />
            </View>
          </View>
        ) : (
          <>
            <View className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-md">
              <Text className="text-white text-lg font-bold">Chat with Document</Text>
              <Text className="text-blue-100 text-sm">Ask questions about your uploaded document</Text>
            </View>

            <ScrollView ref={scrollViewRef} className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 20 }}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  className={`mb-4 max-w-[85%] ${message.isUser ? "self-end ml-auto" : "self-start mr-auto"}`}
                >
                  <View
                    className={`rounded-2xl p-3 ${
                      message.isUser ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <Text className={`${message.isUser ? "text-white" : "text-slate-800 dark:text-slate-200"}`}>
                      {message.text}
                    </Text>
                  </View>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {message.isUser ? "You" : "AI"} • {formatTime(message.timestamp)}
                  </Text>
                </View>
              ))}

              {isLoading && (
                <View className="self-start mr-auto mb-4">
                  <View className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4">
                    <ActivityIndicator color={colors.primary} />
                  </View>
                </View>
              )}
            </ScrollView>

            <View className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-full px-4 py-2 mr-2"
                  placeholder="Ask about your document..."
                  placeholderTextColor="#9CA3AF"
                  value={userResponse}
                  onChangeText={setUserResponse}
                  multiline
                />
                <TouchableWithoutFeedback onPress={userResponse.trim() ? sendMessage : undefined}>
                  <View className={`rounded-full p-3 ${
                    userResponse.trim()
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}>
                    <Ionicons name="send" size={18} color={userResponse.trim() ? "white" : "#9CA3AF"} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

export default ChatWithDoc