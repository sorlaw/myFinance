import { useUser } from '@/src/presentation/context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
    const [name, setName] = useState('');
    const { setUserName } = useUser();
    const router = useRouter();
    const { width } = Dimensions.get('window');

    const handleStart = async () => {
        if (name.trim().length > 0) {
            await setUserName(name.trim());
            router.replace('/');
        }
    };

    return (
        <View className="flex-1 bg-white">
            <LinearGradient
                colors={['#4f46e5', '#818cf8', '#ffffff']}
                className="absolute w-full h-full opacity-20"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View entering={FadeInUp.delay(200).springify()} className="items-center mb-12">
                            <View className="w-24 h-24 bg-indigo-600 rounded-3xl items-center justify-center mb-6 shadow-xl shadow-indigo-500/30">
                                <Text className="text-5xl">👋</Text>
                            </View>
                            <Text className="text-4xl font-bold text-gray-900 text-center mb-2">
                                Welcome!
                            </Text>
                            <Text className="text-gray-500 text-center text-lg">
                                Let's get to know each other.
                            </Text>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).springify()} className="w-full">
                            <View className="mb-8">
                                <Text className="text-gray-900 font-bold mb-3 text-lg ml-1">What's your name?</Text>
                                <TextInput
                                    className="w-full bg-white p-5 rounded-2xl text-xl font-bold text-gray-900 border border-gray-200 focus:border-indigo-500"
                                    placeholder="Your Name"
                                    placeholderTextColor="#9ca3af"
                                    value={name}
                                    onChangeText={setName}
                                    // Removed autoFocus as it can sometimes cause jumpy behavior on mount
                                    style={{
                                        shadowColor: "#000",
                                        shadowOffset: {
                                            width: 0,
                                            height: 2,
                                        },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 3.84,
                                        elevation: 2,
                                    }}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleStart}
                                activeOpacity={0.8}
                                disabled={name.trim().length === 0}
                                className={`w-full py-5 rounded-2xl items-center shadow-lg shadow-indigo-500/30 ${name.trim().length > 0 ? 'bg-indigo-600' : 'bg-gray-300'}`}
                            >
                                <Text className="text-white font-bold text-xl">
                                    Get Started
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
