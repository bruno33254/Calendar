import AsyncStorage from '@react-native-async-storage/async-storage';
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDarkMode } from "./contexts/DarkModeContext";

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

interface NotificationPreference {
  assessmentId: number;
  enabled: boolean;
  daysBefore: number;
}

interface AssessmentNotes {
  assessmentId: number;
  notes: string;
}

export default function HomePage() {
  // Get today's date
  const today = new Date();
  
  // Compute the calendar range: 2 weeks before today, total 77 days
  const calendarStartDate = React.useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() - 14);
    return d;
  }, [today]);
  const calendarEndDate = React.useMemo(() => {
    const d = new Date(calendarStartDate);
    d.setDate(calendarStartDate.getDate() + 76); // inclusive end
    return d;
  }, [calendarStartDate]);
  
  // State for assessments
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDay, setSelectedDay] = React.useState<CalendarDay | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);
  
  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = React.useState<NotificationPreference[]>([]);
  
  // Notes state
  const [assessmentNotes, setAssessmentNotes] = React.useState<AssessmentNotes[]>([]);
  const [editingNotes, setEditingNotes] = React.useState<{ [key: number]: string }>({});
  
  // Dark mode from context
  const { isDarkMode } = useDarkMode();

  // Generate 77 days (11 weeks) total: 2 weeks before + 7 weeks visible + 2 weeks after
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    
    // Use the shared calendarStartDate
    const startDate = calendarStartDate;
    
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

  // Format date as dd-mm-yyyy for assessment details without timezone shifts
  const formatDateSimple = (dateString: string) => {
    if (!dateString) return '';
    const raw = String(dateString).trim();
    const yyyyMmDd = raw.includes('T') ? raw.split('T')[0] : raw.split(' ')[0];
    const [y, m, d] = yyyyMmDd.split('-');
    if (!y || !m || !d) return raw;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  };

  // Format Date object to local YYYY-MM-DD (avoid timezone shifting)
  const toLocalYmd = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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

  // Load notes from AsyncStorage
  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('assessmentNotes');
      if (savedNotes) {
        setAssessmentNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Save notes to AsyncStorage
  const saveNotes = async (notes: AssessmentNotes[]) => {
    try {
      await AsyncStorage.setItem('assessmentNotes', JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
      Alert.alert('Error', 'Failed to save notes');
    }
  };

  // Get notes for a specific assessment
  const getNotesForAssessment = (assessmentId: number): string => {
    const note = assessmentNotes.find(n => n.assessmentId === assessmentId);
    return note ? note.notes : '';
  };

  // Update notes for an assessment
  const updateNotes = (assessmentId: number, notes: string) => {
    const newNotes = [...assessmentNotes];
    const existingIndex = newNotes.findIndex(n => n.assessmentId === assessmentId);
    
    if (existingIndex >= 0) {
      newNotes[existingIndex].notes = notes;
    } else {
      newNotes.push({ assessmentId, notes });
    }
    
    setAssessmentNotes(newNotes);
    saveNotes(newNotes);
  };

  // API functions
  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://4c0cafb94f70.ngrok-free.app/api/calendar');
      const data = await response.json();
      
      if (data.success) {
        setAssessments(data.data);
        // Initialize notification preferences for new assessments
        const newPreferences: NotificationPreference[] = data.data.map((assessment: Assessment) => ({
          assessmentId: assessment.ID,
          enabled: false,
          daysBefore: 1,
        }));
        setNotificationPreferences(newPreferences);
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
    loadNotes();
  }, []);

  // Helper function to get assessments for a specific date      
  const getAssessmentsForDate = (date: Date): Assessment[] => {
    const dateString = toLocalYmd(date); // local YYYY-MM-DD
    return assessments.filter(assessment => {
      // Use raw date part from DB string to avoid timezone conversion
      const raw = String(assessment.submit_date);
      const dbDate = raw.includes('T') ? raw.split('T')[0] : raw.split(' ')[0];
      return dbDate === dateString;
    });
  };

  // Helper function to get notification preference for an assessment
  const getNotificationPreference = (assessmentId: number): NotificationPreference => {
    return notificationPreferences.find(pref => pref.assessmentId === assessmentId) || {
      assessmentId,
      enabled: false,
      daysBefore: 1,
    };
  };

  // Update notification preference (placeholder for future use)
  const updateNotificationPreference = (assessmentId: number, updates: Partial<NotificationPreference>) => {
    console.log('Updating notification preference:', { assessmentId, updates });
    
    const newPreferences = notificationPreferences.map(pref => 
      pref.assessmentId === assessmentId 
        ? { ...pref, ...updates }
        : pref
    );
    
    setNotificationPreferences(newPreferences);
    
    // Placeholder for future notification functionality
    console.log('Notification preferences updated. Notifications will be implemented in development build.');
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

  // Get notification timing info for an assessment (placeholder)
  const getNotificationTiming = (assessment: Assessment, daysBefore: number) => {
    try {
      const submitDateParts = assessment.submit_date.split('-');
      const submitDate = new Date(
        parseInt(submitDateParts[0]), // year
        parseInt(submitDateParts[1]) - 1, // month (0-indexed)
        parseInt(submitDateParts[2]) // day
      );
      
      const notificationDate = new Date(submitDate);
      notificationDate.setDate(submitDate.getDate() - daysBefore);
      notificationDate.setHours(9, 0, 0, 0);
      
      const now = new Date();
      if (notificationDate <= now) {
        return '⚠️ Notification date has passed';
      }
      
      const timeUntilNotification = Math.ceil((notificationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return `📅 Will notify on ${notificationDate.toDateString()} at 9:00 AM (in ${timeUntilNotification} day${timeUntilNotification > 1 ? 's' : ''})`;
    } catch (error) {
      return '❌ Error calculating timing';
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Calendar</Text>
        <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
          {formatDate(calendarStartDate)} - {formatDate(calendarEndDate)}
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
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <View style={[styles.modalHeader, isDarkMode && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>
                📅 Assessments for {formatDate(selectedDay.date)}
              </Text>
              <TouchableOpacity 
                style={[styles.closeButton, isDarkMode && styles.closeButtonDark]}
                onPress={() => {
                  setShowDetails(false);
                  setSelectedDay(null);
                }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {getAssessmentsForDate(selectedDay.date).map((assessment, index) => {
                const notificationPref = getNotificationPreference(assessment.ID);
                const currentNotes = getNotesForAssessment(assessment.ID);
                const isEditing = editingNotes[assessment.ID] !== undefined;
                
                return (
                  <View key={assessment.ID} style={[styles.assessmentCard, isDarkMode && styles.assessmentCardDark]}>
                    <View style={styles.assessmentHeader}>
                      <View 
                        style={[
                          styles.colorIndicator, 
                          { backgroundColor: assessment.color }
                        ]} 
                      />
                      <Text style={[styles.assessmentName, isDarkMode && styles.assessmentNameDark]}>{assessment.name}</Text>
                    </View>
                    
                    <Text style={[styles.assessmentDescription, isDarkMode && styles.assessmentDescriptionDark]}>
                      {assessment.description}
                    </Text>
                    
                    <View style={styles.dateContainer}>
                      <Text style={[styles.dateLabel, isDarkMode && styles.dateLabelDark]}>📅 Submit Date:</Text>
                      <Text style={[styles.dateValue, isDarkMode && styles.dateValueDark]}>
                        {formatDateSimple(assessment.submit_date)}
                      </Text>
                    </View>
                    
                    {/* Notes Section */}
                    <View style={styles.notesContainer}>
                      <View style={styles.notesHeader}>
                        <Text style={[styles.notesLabel, isDarkMode && styles.notesLabelDark]}>
                          📝 Notes
                        </Text>
                        <TouchableOpacity
                          style={[styles.notesEditButton, isDarkMode && styles.notesEditButtonDark]}
                          onPress={() => {
                            if (isEditing) {
                              // Save notes
                              const notesToSave = editingNotes[assessment.ID] || '';
                              updateNotes(assessment.ID, notesToSave);
                              setEditingNotes(prev => {
                                const newState = { ...prev };
                                delete newState[assessment.ID];
                                return newState;
                              });
                            } else {
                              // Start editing
                              setEditingNotes(prev => ({
                                ...prev,
                                [assessment.ID]: currentNotes
                              }));
                            }
                          }}
                        >
                          <Text style={[styles.notesEditButtonText, isDarkMode && styles.notesEditButtonTextDark]}>
                            {isEditing ? 'Save' : 'Edit'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      
                      {isEditing ? (
                        <TextInput
                          style={[
                            styles.notesInput,
                            isDarkMode && styles.notesInputDark
                          ]}
                          value={editingNotes[assessment.ID] || ''}
                          onChangeText={(text) => setEditingNotes(prev => ({
                            ...prev,
                            [assessment.ID]: text
                          }))}
                          placeholder="Write your notes here..."
                          placeholderTextColor={isDarkMode ? '#AEAEB2' : '#8E8E93'}
                          multiline
                          numberOfLines={4}
                        />
                      ) : (
                        <Text style={[
                          styles.notesText,
                          isDarkMode && styles.notesTextDark,
                          !currentNotes && styles.notesPlaceholder
                        ]}>
                          {currentNotes || 'No notes yet. Tap Edit to add notes.'}
                        </Text>
                      )}
                    </View>
                    
                    {/* Notification Settings */}
                    <View style={styles.notificationContainer}>
                      <View style={styles.notificationHeader}>
                        <Text style={[styles.notificationLabel, isDarkMode && styles.notificationLabelDark]}>
                          🔔 Notifications
                        </Text>
                        <View style={styles.notificationButtons}>
                          <TouchableOpacity
                            style={[
                              styles.notificationToggleButton,
                              notificationPref.enabled && styles.notificationToggleButtonActive,
                              isDarkMode && styles.notificationToggleButtonDark,
                              notificationPref.enabled && isDarkMode && styles.notificationToggleButtonActiveDark,
                            ]}
                            onPress={() => {
                              console.log('Toggle button pressed for assessment:', assessment.ID);
                              updateNotificationPreference(assessment.ID, { enabled: !notificationPref.enabled });
                            }}
                          >
                            <Text style={[
                              styles.notificationToggleButtonText,
                              notificationPref.enabled && styles.notificationToggleButtonTextActive,
                              isDarkMode && styles.notificationToggleButtonTextDark,
                              notificationPref.enabled && isDarkMode && styles.notificationToggleButtonTextActiveDark,
                            ]}>
                              {notificationPref.enabled ? 'Disable' : 'Enable'} Notifications
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      {notificationPref.enabled && (
                        <View style={styles.daysSelectorContainer}>
                          <Text style={[styles.daysSelectorLabel, isDarkMode && styles.daysSelectorLabelDark]}>
                            Notify me:
                          </Text>
                          <View style={styles.daysSelector}>
                            {[1, 2, 3, 5, 7].map((days) => (
                              <TouchableOpacity
                                key={days}
                                style={[
                                  styles.dayOption,
                                  notificationPref.daysBefore === days && styles.dayOptionSelected,
                                  isDarkMode && styles.dayOptionDark,
                                  notificationPref.daysBefore === days && isDarkMode && styles.dayOptionSelectedDark,
                                ]}
                                onPress={() => updateNotificationPreference(assessment.ID, { daysBefore: days })}
                              >
                                <Text style={[
                                  styles.dayOptionText,
                                  notificationPref.daysBefore === days && styles.dayOptionTextSelected,
                                  isDarkMode && styles.dayOptionTextDark,
                                  notificationPref.daysBefore === days && isDarkMode && styles.dayOptionTextSelectedDark,
                                ]}>
                                  {days} {days === 1 ? 'day' : 'days'}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          
                          {/* Show exact notification timing */}
                          <View style={styles.timingInfoContainer}>
                            <Text style={[styles.timingInfoText, isDarkMode && styles.timingInfoTextDark]}>
                              {getNotificationTiming(assessment, notificationPref.daysBefore)}
                            </Text>
                          </View>
                        </View>
                      )}
                      
                      {/* Show message when notifications are disabled */}
                      {!notificationPref.enabled && (
                        <View style={styles.disabledNotificationContainer}>
                          <Text style={[styles.disabledNotificationText, isDarkMode && styles.disabledNotificationTextDark]}>
                            💡 Select a day above and enable notifications to schedule reminders
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
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
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 20,
    maxHeight: '90%',
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
  modalContentDark: {
    backgroundColor: '#2C2C2E',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalHeaderDark: {
    borderBottomColor: '#38383A',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    flex: 1,
  },
  modalTitleDark: {
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonDark: {
    backgroundColor: '#38383A',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: 'bold',
  },
  closeButtonTextDark: {
    color: '#FFFFFF',
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
  assessmentCardDark: {
    backgroundColor: '#1F1F20',
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
  assessmentNameDark: {
    color: '#FFFFFF',
  },
  assessmentDescription: {
    fontSize: 16,
    color: '#3A3A3C',
    lineHeight: 22,
    marginBottom: 16,
  },
  assessmentDescriptionDark: {
    color: '#D1D1D6',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  dateLabelDark: {
    color: '#AEAEB2',
  },
  dateValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: 'bold',
  },
  dateValueDark: {
    color: '#FFFFFF',
  },
  // Notification styles
  notificationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  notificationLabelDark: {
    color: '#FFFFFF',
  },
  daysSelectorContainer: {
    marginTop: 8,
  },
  daysSelectorLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  daysSelectorLabelDark: {
    color: '#AEAEB2',
  },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dayOptionDark: {
    backgroundColor: '#38383A',
    borderColor: '#48484A',
  },
  dayOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dayOptionSelectedDark: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  dayOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  dayOptionTextDark: {
    color: '#AEAEB2',
  },
  dayOptionTextSelected: {
    color: '#FFFFFF',
  },
  dayOptionTextSelectedDark: {
    color: '#FFFFFF',
  },
  timingInfoContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  timingInfoText: {
    fontSize: 12,
    color: '#3A3A3C',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timingInfoTextDark: {
    color: '#D1D1D6',
  },
  disabledNotificationContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  disabledNotificationText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  disabledNotificationTextDark: {
    color: '#AEAEB2',
  },
  notificationToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  notificationToggleButtonDark: {
    backgroundColor: '#38383A',
    borderColor: '#48484A',
  },
  notificationToggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  notificationToggleButtonActiveDark: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  notificationToggleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  notificationToggleButtonTextDark: {
    color: '#AEAEB2',
  },
  notificationToggleButtonTextActive: {
    color: '#FFFFFF',
  },
  notificationToggleButtonTextActiveDark: {
    color: '#FFFFFF',
  },
  debugButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  debugButtonDark: {
    backgroundColor: '#38383A',
    borderColor: '#48484A',
  },
  debugButtonText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
  },
  debugButtonTextDark: {
    color: '#AEAEB2',
  },
  // Notes styles
  notesContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  notesLabelDark: {
    color: '#FFFFFF',
  },
  notesEditButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  notesEditButtonDark: {
    backgroundColor: '#38383A',
    borderColor: '#48484A',
  },
  notesEditButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  notesEditButtonTextDark: {
    color: '#AEAEB2',
  },
  notesInput: {
    fontSize: 14,
    color: '#1C1C1E',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minHeight: 100,
  },
  notesInputDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#38383A',
    color: '#FFFFFF',
  },
  notesText: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
  },
  notesTextDark: {
    color: '#D1D1D6',
  },
  notesPlaceholder: {
    color: '#8E8E93',
  },

});
