import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  const handleSettingPress = (settingName: string) => {
    Alert.alert(
      settingName,
      `This would open ${settingName} settings.`,
      [{ text: "OK" }]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showSwitch = false,
    switchValue = false,
    onSwitchChange = () => {},
    showArrow = true,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color="#007AFF" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#E5E5EA", true: "#007AFF" }}
            thumbColor="#FFFFFF"
          />
        ) : (
          showArrow && (
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          )
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.sectionContent}>
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive notifications for events"
            showSwitch={true}
            switchValue={notifications}
            onSwitchChange={setNotifications}
            showArrow={false}
          />
          <SettingItem
            icon="volume-high"
            title="Sound"
            subtitle="Play sounds for notifications"
            showSwitch={true}
            switchValue={soundEnabled}
            onSwitchChange={setSoundEnabled}
            showArrow={false}
          />
          <SettingItem
            icon="phone-portrait"
            title="Vibration"
            subtitle="Vibrate for notifications"
            showSwitch={true}
            switchValue={vibrationEnabled}
            onSwitchChange={setVibrationEnabled}
            showArrow={false}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Storage</Text>
        <View style={styles.sectionContent}>
          <SettingItem
            icon="cloud-upload"
            title="Auto Backup"
            subtitle="Automatically backup your calendar data"
            showSwitch={true}
            switchValue={autoBackup}
            onSwitchChange={setAutoBackup}
            showArrow={false}
          />
          <SettingItem
            icon="download"
            title="Export Data"
            subtitle="Export your calendar data"
            onPress={() => handleSettingPress("Export Data")}
          />
          <SettingItem
            icon="trash"
            title="Clear Data"
            subtitle="Delete all calendar data"
            onPress={() => handleSettingPress("Clear Data")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.sectionContent}>
          <SettingItem
            icon="help-circle"
            title="Help & Support"
            subtitle="Get help with the app"
            onPress={() => handleSettingPress("Help & Support")}
          />
          <SettingItem
            icon="document-text"
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={() => handleSettingPress("Privacy Policy")}
          />
          <SettingItem
            icon="document"
            title="Terms of Service"
            subtitle="Read our terms of service"
            onPress={() => handleSettingPress("Terms of Service")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.sectionContent}>
          <SettingItem
            icon="information-circle"
            title="App Version"
            subtitle="1.0.0"
            showArrow={false}
          />
          <SettingItem
            icon="star"
            title="Rate App"
            subtitle="Rate us on the App Store"
            onPress={() => handleSettingPress("Rate App")}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
    marginLeft: 20,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5EA",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  settingRight: {
    alignItems: "center",
  },
}); 