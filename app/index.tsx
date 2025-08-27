import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CalendarDay {
  day: number;
  month: number;
  year: number;
  isToday: boolean;
  date: Date;
  dayOfWeek: number;
}

interface Assessment {
  ID: number;
  name: string;
  description: string;
  submit_date: string;
  color: string;
}

export default function HomePage() {
  // Get today's date
  const today = new Date();
  
  // State for assessments
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDay, setSelectedDay] = React.useState<CalendarDay | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);
  
  // Dark mode state - manual toggle only
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Generate 77 days (11 weeks) total: 2 weeks before + 7 weeks visible + 2 weeks after
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    
    // Start from 2 weeks ago (14 days back from today)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 14);
    
    // Generate 77 days (11 weeks total)
    for (let i = 0; i < 77; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      days.push({
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isToday: date.toDateString() === today.toDateString(),
        date: date,
        dayOfWeek: date.getDay(),
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month];
  };

  const formatDate = (date: Date) => {
    return `${date.getDate()} ${getMonthName(date.getMonth())}, ${date.getFullYear()}`;
  };

  // Format date as dd-mm-yyyy for assessment details
  const formatDateSimple = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Group days into weeks aligned to Sunday-Saturday columns
  const groupDaysIntoWeeks = (days: CalendarDay[]): (CalendarDay | null)[][] => {
    const weeks: (CalendarDay | null)[][] = [];
    let currentWeek: (CalendarDay | null)[] = [];

    if (days.length === 0) return weeks;

    // Pad the first week so the first day appears under its correct weekday column
    const firstDayOfWeek = days[0].dayOfWeek; // 0=Sun ... 6=Sat
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    days.forEach((day, index) => {
      currentWeek.push(day);

      // If we have 7 days in the row, push the week and reset
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      // If it's the last day and the row isn't full, pad to 7
      if (index === days.length - 1 && currentWeek.length > 0 && currentWeek.length < 7) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  };

  const weeks = groupDaysIntoWeeks(calendarDays);

  // API functions
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://4c0cafb94f70.ngrok-free.app/api/calendar');
      const data = await response.json();
      
      if (data.success) {
        setAssessments(data.data);
      } else {
        console.error('Failed to fetch assessments:', data.message);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assessments on component mount
  React.useEffect(() => {
    fetchAssessments();
  }, []);

  // Helper function to get assessments for a specific date      
  const getAssessmentsForDate = (date: Date): Assessment[] => {
  const dateString = date.toISOString().split('T')[0];
  return assessments.filter(assessment => {
    const dbDate = new Date(assessment.submit_date).toISOString().split('T')[0];
    return dbDate === dateString;
  });
};


  // Helper function to check if a date is in the future
  const isFutureDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Function to handle day clicks
  const handleDayClick = (day: CalendarDay) => {
    const dayAssessments = getAssessmentsForDate(day.date);
    
    if (dayAssessments.length > 0) {
      setSelectedDay(day);
      setShowDetails(true);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, isDarkMode && styles.titleDark]}>Calendar</Text>
          <TouchableOpacity 
            style={[styles.darkModeToggle, isDarkMode && styles.darkModeToggleActive]} 
            onPress={toggleDarkMode}
          >
            <Text style={styles.darkModeToggleText}>
              {isDarkMode ? '🌙' : '☀️'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
          {formatDate(today)} - {formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 48))}
        </Text>
        {loading && (
          <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>Loading assessments...</Text>
        )}
      </View>
      
      <View style={[styles.calendarContainer, isDarkMode && styles.calendarContainerDark]}>
        <View style={styles.weekHeader}>
          <Text style={[styles.weekDay, isDarkMode && styles.weekDayDark]}>Sun</Text>
          <Text style={[styles.weekDay, isDarkMode && styles.weekDayDark]}>Mon</Text>
          <Text style={[styles.weekDay, isDarkMode && styles.weekDayDark]}>Tue</Text>
          <Text style={[styles.weekDay, isDarkMode && styles.weekDayDark]}>Wed</Text>
          <Text style={[styles.weekDay, isDarkMode && styles.weekDayDark]}>Thu</Text>
          <Text style={[styles.weekDay, isDarkMode && styles.weekDayDark]}>Fri</Text>
          <Text style={[styles.weekDay, isDarkMode && styles.weekDayDark]}>Sat</Text>
        </View>
        <Text style={[styles.scrollHint, isDarkMode && styles.scrollHintDark]}>Scroll to see more weeks</Text>
        
        <ScrollView 
          style={styles.calendarScrollView}
          contentContainerStyle={styles.calendarScrollContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle="black"
        >
          <View style={styles.calendarGrid}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((day, dayIndex) => (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.dayCell,
                      day?.isToday && styles.todayCell,
                      day && getAssessmentsForDate(day.date).length > 0 && (() => {
                        const assessmentColor = getAssessmentsForDate(day.date)[0]?.color;
                        return {
                          backgroundColor: assessmentColor + '20', // 20 = 12% opacity
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: assessmentColor,
                        };
                      })()
                    ]}
                    onPress={() => day && handleDayClick(day)}
                    activeOpacity={0.7}
                  >
                    {day ? (
                      <>
                                              <Text style={[
                        styles.dayText,
                        isDarkMode && styles.dayTextDark,
                        day.isToday && styles.todayText
                      ]}>
                        {day.day}
                      </Text>
                        
                        {/* Show assessments for this day */}
                        {getAssessmentsForDate(day.date).map((assessment, index) => (
                          <View 
                            key={assessment.ID} 
                            style={[
                              styles.assessmentDot,
                              { backgroundColor: assessment.color }
                            ]} 
                          />
                        ))}
                        
                        {day.isToday && (
                          <View style={styles.todayIndicator} />
                        )}
                      </>
                    ) : (
                      <Text style={styles.emptyDayText}></Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* Assessment Details Modal */}
      {showDetails && selectedDay && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                📅 Assessments for {formatDate(selectedDay.date)}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowDetails(false);
                  setSelectedDay(null);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {getAssessmentsForDate(selectedDay.date).map((assessment, index) => (
                <View key={assessment.ID} style={styles.assessmentCard}>
                  <View style={styles.assessmentHeader}>
                    <View 
                      style={[
                        styles.colorIndicator, 
                        { backgroundColor: assessment.color }
                      ]} 
                    />
                    <Text style={styles.assessmentName}>{assessment.name}</Text>
                  </View>
                  
                  <Text style={styles.assessmentDescription}>
                    {assessment.description}
                  </Text>
                  
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateLabel}>📅 Submit Date:</Text>
                    <Text style={styles.dateValue}>
                      {formatDateSimple(assessment.submit_date)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingBottom: 20,
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  darkModeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkModeToggleActive: {
    backgroundColor: '#38383A',
  },
  darkModeToggleText: {
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  titleDark: {
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
  },
  subtitleDark: {
    color: "#AEAEB2",
  },
  loadingText: {
    fontSize: 14,
    color: "#007AFF",
    fontStyle: "italic",
    marginTop: 8,
  },
  loadingTextDark: {
    color: "#0A84FF",
  },
  calendarContainer: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 500, // Limit the height of the calendar container
  },
  calendarContainerDark: {
    backgroundColor: "#2C2C2E",
    shadowColor: "#000",
    shadowOpacity: 0.3,
  },
  weekHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },
  weekDayDark: {
    color: "#AEAEB2",
  },
  scrollHint: {
    textAlign: "center",
    fontSize: 12,
    color: "#8E8E93",
    fontStyle: "italic",
    marginBottom: 8,
  },
  scrollHintDark: {
    color: "#AEAEB2",
  },
  calendarScrollView: {
    height: 400, // Fixed height to show ~7 weeks initially
  },
  calendarScrollContent: {
    paddingBottom: 20,
  },
  calendarGrid: {
    // Remove flexDirection and flexWrap as we're using explicit rows
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginHorizontal: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  dayTextDark: {
    color: "#FFFFFF",
  },
  emptyDayText: {
    fontSize: 16,
    color: "transparent",
  },
  todayCell: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },

  todayText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  todayIndicator: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  assessmentDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  assessmentCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  assessmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    flex: 1,
  },
  assessmentDescription: {
    fontSize: 16,
    color: '#3A3A3C',
    lineHeight: 22,
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: 'bold',
  },
});
