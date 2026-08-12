import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
      )}
      <TextInput
        className={`
          w-full bg-white rounded-xl px-4 py-3.5 text-base text-slate-900
          border ${error ? 'border-danger' : focused ? 'border-primary-600' : 'border-slate-200'}
        `}
        placeholderTextColor="#94a3b8"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text className="text-danger text-xs mt-1">{error}</Text>}
    </View>
  );
}