import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text } from 'react-native';
import { DarkModeProvider, useDarkMode } from './contexts/DarkModeContext';

function ThemedTabs() {
  const { isDarkMode } = useDarkMode();
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={isDarkMode ? '#1C1C1E' : '#FFFFFF'} />
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
      }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color }) => <Text style={{ color }}>🗓️</Text>,
            tabBarLabel: 'Calendar',
          }}
        />
        <Tabs.Screen
          name="list"
          options={{
            title: 'List',
            tabBarIcon: ({ color }) => <Text style={{ color }}>📋</Text>,
            tabBarLabel: 'List',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Text style={{ color }}>⚙️</Text>,
            tabBarLabel: 'Settings',
          }}
        />
      </Tabs>
    </>
  );
}

export default function Layout() {
  return (
    <DarkModeProvider>
      <ThemedTabs />
    </DarkModeProvider>
  );
}
