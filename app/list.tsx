import React from "react";
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDarkMode } from "./contexts/DarkModeContext";

interface Assessment {
  ID: number;
  name: string;
  description: string;
  submit_date: string;
  color: string;
}

const formatDateSimple = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function ListScreen() {
  const { isDarkMode } = useDarkMode();
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://4c0cafb94f70.ngrok-free.app/api/calendar');
      const data = await response.json();
      if (data.success) {
        setAssessments(data.data as Assessment[]);
      } else {
        setError(data.message || 'Failed to fetch assessments');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAssessments();
  }, []);

  const renderItem = ({ item }: { item: Assessment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      {!!item.description && (
        <Text style={styles.cardDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.cardDateLabel}>Submit date</Text>
        <Text style={styles.cardDate}>{formatDateSimple(item.submit_date)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Assessments</Text>
        <TouchableOpacity onPress={fetchAssessments} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchAssessments} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={assessments}
          keyExtractor={(item) => String(item.ID)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No assessments found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerDark: {
    backgroundColor: '#2C2C2E',
    borderBottomColor: '#38383A',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  refreshBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  refreshText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
  },
  cardDescription: {
    fontSize: 15,
    color: '#3A3A3C',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDateLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  cardDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  separator: {
    height: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 