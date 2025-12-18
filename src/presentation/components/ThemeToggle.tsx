import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
    withSpring
} from 'react-native-reanimated';

export function ThemeToggle() {
    const { toggleTheme, isDark } = useTheme();

    // Derived value for animation state (0 for light, 1 for dark)
    const progress = useDerivedValue(() => {
        return isDark ? withSpring(1) : withSpring(0);
    }, [isDark]);

    const rStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['#f3f4f6', '#1f2937'] // gray-100, gray-800
        );
        const borderColor = interpolateColor(
            progress.value,
            [0, 1],
            ['#e5e7eb', '#374151'] // gray-200, gray-700
        );

        return {
            backgroundColor,
            borderColor,
        };
    });

    const rIconStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            progress.value,
            [0, 1],
            [0, 360]
        );
        return {
            transform: [{ rotate: `${rotate}deg` }],
        };
    });

    return (
        <Pressable onPress={toggleTheme}>
            <Animated.View style={[styles.container, rStyle]}>
                <Animated.View style={rIconStyle}>
                    <Ionicons
                        name={isDark ? "moon" : "sunny"}
                        size={20}
                        color={isDark ? "#fbbf24" : "#f59e0b"} // amber-400, amber-500
                    />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    }
});
