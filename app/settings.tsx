import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDarkMode } from "./contexts/DarkModeContext";

export default function SettingsScreen() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Settings</Text>
      </View>
      
      <View style={[styles.settingsContainer, isDarkMode && styles.settingsContainerDark]}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, isDarkMode && styles.settingTitleDark]}>
              Dark Mode
            </Text>
            <Text style={[styles.settingDescription, isDarkMode && styles.settingDescriptionDark]}>
              Switch between light and dark themes
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.darkModeToggle, isDarkMode && styles.darkModeToggleActive]} 
            onPress={toggleDarkMode}
          >
            <Text style={styles.darkModeToggleText}>
              {isDarkMode ? '🌙' : '☀️'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.settingItem, styles.settingItemBorder, isDarkMode && styles.settingItemBorderDark]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, isDarkMode && styles.settingTitleDark]}>
              App Version
            </Text>
            <Text style={[styles.settingDescription, isDarkMode && styles.settingDescriptionDark]}>
              Calendar App v1.0.0
            </Text>
          </View>
        </View>
        
        <View style={[styles.settingItem, styles.settingItemBorder, isDarkMode && styles.settingItemBorderDark]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, isDarkMode && styles.settingTitleDark]}>
              Database
            </Text>
            <Text style={[styles.settingDescription, isDarkMode && styles.settingDescriptionDark]}>
              MySQL - calendarapp
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  containerDark: {
    backgroundColor: "#1C1C1E",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerDark: {
    backgroundColor: "#2C2C2E",
    borderBottomColor: "#38383A",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  titleDark: {
    color: "#FFFFFF",
  },
  settingsContainer: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingsContainerDark: {
    backgroundColor: "#2C2C2E",
    shadowColor: "#000",
    shadowOpacity: 0.3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  settingItemBorder: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  settingItemBorderDark: {
    borderTopColor: '#38383A',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  settingTitleDark: {
    color: '#FFFFFF',
  },
  settingDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  settingDescriptionDark: {
    color: '#AEAEB2',
  },
  darkModeToggle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkModeToggleActive: {
    backgroundColor: '#38383A',
  },
  darkModeToggleText: {
    fontSize: 20,
  },
}); 