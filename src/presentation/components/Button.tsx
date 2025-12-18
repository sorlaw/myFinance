import { ReactNode } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    variant?: 'primary' | 'secondary' | 'danger';
    title?: string;
    children?: ReactNode;
}

export const Button = ({ variant = 'primary', title, children, className, ...props }: ButtonProps) => {
    const baseStyle = "p-4 rounded-xl items-center justify-center";
    const variants = {
        primary: "bg-blue-600",
        secondary: "bg-gray-200",
        danger: "bg-red-500",
    };
    const textVariants = {
        primary: "text-white font-bold text-lg",
        secondary: "text-gray-800 font-bold text-lg",
        danger: "text-white font-bold text-lg",
    };

    return (
        <TouchableOpacity className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {title ? <Text className={textVariants[variant]}>{title}</Text> : children}
        </TouchableOpacity>
    );
};
