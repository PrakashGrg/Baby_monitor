import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary-600 active:bg-primary-700',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-accent active:bg-accent-dark',
    text: 'text-white',
  },
  outline: {
    container: 'bg-transparent border border-primary-600',
    text: 'text-primary-600',
  },
  danger: {
    container: 'bg-danger active:bg-red-700',
    text: 'text-white',
  },
};

export default function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  ...props
}: ButtonProps) {
  const styles = variantStyles[variant];

  return (
    <TouchableOpacity
      className={`
        ${styles.container}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl py-4 px-6 items-center justify-center
        ${disabled || loading ? 'opacity-50' : ''}
      `}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563eb' : '#ffffff'} />
      ) : (
        <Text className={`${styles.text} font-semibold text-base`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}