import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { DarkModeProvider } from './contexts/DarkModeContext';

export default function Layout() {
  return (
    <DarkModeProvider>
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
    </DarkModeProvider>
  );
}
