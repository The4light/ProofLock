import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Switch,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import api from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NewCommitmentModal() {
  const router = useRouter();
  //FORM STATE 
    const [goal, setGoal] = useState('');
  const [proofMethod, setProofMethod] = useState<'photo' | 'ai_chat'>('photo');
  // This tells TypeScript: It can be today, tomorrow, OR custom.
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [loading, setLoading] = useState(false);

  // Time State
  const [date, setDate] = useState(new Date()); 
  const [showPicker, setShowPicker] = useState(false);
  const [customDate, setCustomDate] = useState<Date | null>(null);

  const onTimeChange = (event: any, selectedDateValue?: Date) => {
    setShowPicker(false); 
    if (selectedDateValue) {
      setDate(selectedDateValue);
    }
  };

  const formatTime = (timeToFormat: Date) => {
    return timeToFormat.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    }).toUpperCase();
  };
    //HandleCreateCommitment 
    const handleCreateCommitment = async () => {
      if (!goal) return Alert.alert("Hold up", "What is the goal?");
      
      setLoading(true);
      try {
        let alarmDate = new Date();
        
        // LOGIC: Determine the base date
        if (selectedDate === 'tomorrow') {
          alarmDate.setDate(alarmDate.getDate() + 1);
        } else if (selectedDate === 'custom' && customDate) {
          // Use the year, month, and day from the custom picker
          alarmDate = new Date(customDate.getTime());
        }

        // Apply the time from our Time Picker (date state)
        alarmDate.setHours(date.getHours());
        alarmDate.setMinutes(date.getMinutes());
        alarmDate.setSeconds(0);
        alarmDate.setMilliseconds(0);

        // Timezone Offset Calculation (The "World-Level" way)
        const timezoneOffset = -alarmDate.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
        const offsetMinutes = Math.abs(timezoneOffset) % 60;
        const offsetSign = timezoneOffset >= 0 ? '+' : '-';
        const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
        
        const localISOString = `${alarmDate.getFullYear()}-${String(alarmDate.getMonth() + 1).padStart(2, '0')}-${String(alarmDate.getDate()).padStart(2, '0')}T${String(alarmDate.getHours()).padStart(2, '0')}:${String(alarmDate.getMinutes()).padStart(2, '0')}:00${offsetString}`;

        const response = await api.post<any>('/alarms', {
          goal: goal,
          startDate: localISOString,
          startTime: formatTime(alarmDate),
          proofMethod: proofMethod,
          status: 'upcoming'
        });

        if (response.data.success) {
          router.replace('/(tabs)');
        }
      } catch (error: any) {
        Alert.alert("Validation Error", error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    };
    const getCustomDateLabel = () => {
      if (selectedDate === 'custom' && customDate) {
        return customDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
      }
      return "CUSTOM";
    };

  // UI Date Helper
  const getDisplayDate = (type: 'today' | 'tomorrow') => {
    const d = new Date();
    if (type === 'tomorrow') d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };




  const [tab, setTab] = useState<'basic' | 'advanced'>('advanced'); // Starting in advanced for testing
  // SHARED STATE

  const [currentMonth, setCurrentMonth] = useState(new Date()); // Tracks the viewable month
  const [selectedDates, setSelectedDates] = useState<string[]>([]); // Using YYYY-MM-DD strings for precision
  


  // ADVANCED SPECIFIC STATE
  const [category, setCategory] = useState('Deep Work');
  const [isIndefinite, setIsIndefinite] = useState(false);
  const [startTime, setStartTime] = useState('05:30');
  const [endTime, setEndTime] = useState('07:00');
  const [duration, setDuration] = useState('1h 30m');
  const [reminders, setReminders] = useState(true);
  const [aarEnabled, setAarEnabled] = useState(true);
  const [protocol, setProtocol] = useState([
    { id: 1, task: 'Drink 500ml Water' },
    { id: 2, task: '3-Min Cold Shower' },
    { id: 3, task: 'Journal Morning Intent' }
  ]);
  

  // FUNCTIONS
  const addProtocolStep = () => {
    setProtocol([...protocol, { id: Date.now(), task: '' }]);
  };

  const removeProtocolStep = (id: number) => {
    setProtocol(protocol.filter(p => p.id !== id));
  };
  // 2. RECURRENCE GENERATOR LOGIC
  // This generates the next 14 days for the horizontal scroll
const getTimelineDays = (viewDate: Date) => {
  const days = [];
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  // Get number of days in the selected month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      dayNumber: i,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      fullDate: date.toISOString().split('T')[0],
    });
  }
  return days;
};
// 3. MONTH NAVIGATION LOGIC
const changeMonth = (offset: number) => {
  const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
  setCurrentMonth(newMonth);
};

const timeline = getTimelineDays(currentMonth);
const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

const toggleDate = (fullDate: string) => {
    if (selectedDates.includes(fullDate)) {
      setSelectedDates(selectedDates.filter(d => d !== fullDate));
    } else {
      setSelectedDates([...selectedDates, fullDate]);
    }
  };

    //HANDLE CREATE ADVANCED 
    const handleCreateAdvanced = async () => {
      if (!goal) return Alert.alert("Mission Error", "What is the mission objective?");
      if (selectedDates.length === 0) return Alert.alert("Timeline Error", "Pick at least one day.");

      setLoading(true);
      try {
        const payload = {
          goal,
          category, // e.g., 'Fitness'
          startTime, // '05:30'
          endTime,   // '07:00'
          dates: selectedDates, // Array of ['2026-02-12', '2026-02-13']
          protocol: protocol.filter(p => p.task.trim() !== ''), // Clean empty tasks
          remindersEnabled: reminders,
          aarEnabled: aarEnabled,
          isIndefinite: false, // We will add the toggle for this next
          type: 'advanced'
        };

        const response = await api.post<any>('/alarms/advanced', payload);

        if (response.data.success) {
          router.replace('/(tabs)');
        }
      } catch (error: any) {
        Alert.alert("System Failure", error.response?.data?.error || "Check connection");
      } finally {
        setLoading(false);
      }
    };


  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Commitment</Text>
        <TouchableOpacity onPress={() => console.log('Save')}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* TAB SELECTOR */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, tab === 'basic' && styles.tabBtnActive]} 
          onPress={() => setTab('basic')}
        >
          <Text style={[styles.tabBtnText, tab === 'basic' && {color: '#000'}]}>Basic</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, tab === 'advanced' && styles.tabBtnActive]} 
          onPress={() => setTab('advanced')}
        >
          <Text style={[styles.tabBtnText, tab === 'advanced' && {color: '#000'}]}>Advanced</Text>
        </TouchableOpacity>
      </View>
      
      {/*BASIC TAB*/}
      {tab === 'basic' && (
        <SafeAreaView style={styles.container}>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>New Commitment</Text>
        <Text style={styles.subtitle}>Set a task that requires proof to be dismissed.</Text>

        {/* GOAL SECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Whats the goal?</Text>
          </View>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Morning Gym Session"
            placeholderTextColor="#444"
            value={goal}
            onChangeText={setGoal}
          />
        </View>

        {/* TIME SECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>When does it start?</Text>
          </View>
          
          <View style={styles.dateRow}>
            <TouchableOpacity 
              style={[styles.dateBtn, selectedDate === 'today' && styles.dateBtnActive]}
              onPress={() => setSelectedDate('today')}
            >
              <Text style={[styles.dateBtnText, selectedDate === 'today' && styles.textBlack]}>TODAY</Text>
              <Text style={[styles.dateSubtext, selectedDate === 'today' && styles.textBlack]}>{getDisplayDate('today')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dateBtn, selectedDate === 'tomorrow' && styles.dateBtnActive]}
              onPress={() => setSelectedDate('tomorrow')}
            >
              <Text style={[styles.dateBtnText, selectedDate === 'tomorrow' && styles.textBlack]}>TOMORROW</Text>
              <Text style={[styles.dateSubtext, selectedDate === 'tomorrow' && styles.textBlack]}>{getDisplayDate('tomorrow')}</Text>
            </TouchableOpacity>
              {/* ADD THIS: CUSTOM DATE BUTTON */}
            <TouchableOpacity 
                style={[styles.dateBtn, selectedDate === 'custom' && styles.dateBtnActive]}
                onPress={() => setShowPicker(true)}
              >
                <Text style={[styles.dateBtnText, selectedDate === 'custom' && styles.textBlack]}>
                  {getCustomDateLabel()}
                </Text>
                <Ionicons 
                  name="calendar-outline" 
                  size={14} 
                  color={selectedDate === 'custom' ? 'black' : COLORS.primary} 
                />
             </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.timeDisplay} 
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.timeText}>{formatTime(date)}</Text>
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={14} color="#000" />
            </View>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={onTimeChange}
              textColor="white"
            />
          )}
        </View>
        {/* ADD THIS: DATE PICKER MODAL */}
        {showPicker && (
          <DateTimePicker
            value={customDate || new Date()}
            mode="date"
            minimumDate={new Date()} // Prevents picking past dates
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, d) => {
              setShowPicker(false);
              if (d) {
                setCustomDate(d);
                setSelectedDate('custom');
              }
            }}
          />
        )}

        {/* PROOF METHOD SECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Method of Proof</Text>
          </View>

          <TouchableOpacity 
            style={[styles.methodItem, proofMethod === 'photo' && styles.methodActive]}
            onPress={() => setProofMethod('photo')}
          >
            <Ionicons name="camera" size={24} color={proofMethod === 'photo' ? COLORS.primary : '#444'} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.methodTitle}>Take a Photo</Text>
              <Text style={styles.methodDesc}>Capture your environment to stop alarm.</Text>
            </View>
            {proofMethod === 'photo' && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          🔒 Once the commitment begins, the alarm will only cease when the selected proof method is successfully submitted.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.createBtn} 
          onPress={handleCreateCommitment}
          disabled={loading}
        >
          <Text style={styles.createBtnText}>{loading ? 'Saving...' : 'Create Commitment'}</Text>
          <Ionicons name="arrow-forward" size={20} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
        )}

      
      {/* ADVANCED TAB */}
      {tab === 'advanced' && (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* GOAL CONTEXT */}
        <Text style={styles.sectionLabel}>GOAL CONTEXT</Text>
           <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoryScroll}
            >
            {[
              { name: 'Fitness', icon: 'barbell', color: '#4A90E2' },
              { name: 'Study', icon: 'book', color: '#F5A623' },
              { name: 'Deep Work', icon: 'rocket', color: COLORS.primary },
              { name: 'General', icon: 'apps', color: '#8E8E93' } // Added a 4th to test the scroll
            ].map(cat => (
              <TouchableOpacity 
                key={cat.name} 
                style={[styles.catChip, category === cat.name && styles.activeCatChip]}
                onPress={() => setCategory(cat.name)}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={20} // Slightly larger for better visibility
                  color={category === cat.name ? '#000' : cat.color} 
                />
                <Text style={[styles.catChipText, category === cat.name && {color: '#000'}]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        {/* SESSION WINDOW */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SESSION WINDOW</Text>
          <View style={styles.timeRow}>
            <View>
              <Text style={styles.timeTitle}>START</Text>
              <Text style={styles.timeValue}>{startTime}</Text>
            </View>
            <View style={styles.durationBadge}>
              <View style={styles.durationLine} />
              <Text style={styles.durationText}>{duration}</Text>
              <View style={styles.durationLine} />
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.timeTitle}>END</Text>
              <Text style={styles.timeValue}>{endTime}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.switchRow}>
            <View style={styles.row}>
              <Ionicons name="notifications-outline" size={22} color="white" />
              <Text style={styles.switchLabel}>Session Reminders</Text>
            </View>
            <Switch value={reminders} onValueChange={setReminders} trackColor={{ true: COLORS.primary }} />
          </View>
        </View>

        {/* CHECKLIST PROTOCOL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>CHECKLIST PROTOCOL</Text>
          <Text style={styles.stepCount}>{protocol.length} STEPS</Text>
        </View>

        {protocol.map((item, index) => (
          <View key={item.id} style={styles.protocolRow}>
            <View style={styles.protocolNumber}>
              <Text style={styles.protocolNumberText}>{index + 1}</Text>
            </View>
            <TextInput
              style={styles.protocolInput}
              placeholder="Add sub-task..."
              placeholderTextColor="#444"
              value={item.task}
              onChangeText={(text) => {
                const newProtocol = [...protocol];
                newProtocol[index].task = text;
                setProtocol(newProtocol);
              }}
            />
            <TouchableOpacity 
              onPress={() => removeProtocolStep(item.id)}
              style={styles.deleteBin}
            >
              <Ionicons name="trash-outline" size={20} color="#FF4444" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addStepBtn} onPress={addProtocolStep}>
          <Ionicons name="add" size={22} color="white" />
          <Text style={styles.addStepText}>Add Protocol Step</Text>
        </TouchableOpacity>

        {/* RECURRENCE BUILDER (New Section) */}
       <View style={styles.calendarCard}>
             {/* DYNAMIC CALENDAR HEADER */}
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                  <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                
                <Text style={styles.monthYearText}>{monthLabel}</Text>
                
                <TouchableOpacity onPress={() => changeMonth(1)}>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.advLabel}>TIMELINE / SELECT MISSION DAYS</Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.dateScroll}
              >
                {timeline.map((item) => {
                  const isActive = selectedDates.includes(item.fullDate);
                  return (
                    <View key={item.fullDate} style={{ alignItems: 'center' }}>
                      <Text style={[styles.dayLabel, isActive && { color: COLORS.primary }]}>
                        {item.dayName}
                      </Text>
                      <TouchableOpacity 
                        style={[styles.dateCircle, isActive && styles.dateCircleActive]}
                        onPress={() => toggleDate(item.fullDate)}
                      >
                        <Text style={[styles.dateText, isActive && { color: '#000' }]}>
                          {item.dayNumber}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={styles.recurrenceBtn}>
                <View style={styles.row}>
                  <Ionicons name="sync-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.recurrenceText}>Recurrence Builder</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.recurrenceValue}>
                    {selectedDates.length > 0 ? `${selectedDates.length} Days Selected` : 'None'}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#444" />
                </View>
              </TouchableOpacity>
       </View>

       {/* The "Indefinite" (Forever) Toggle */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => setIsIndefinite(!isIndefinite)}
          style={[
            styles.featuredToggleCard, 
            isIndefinite && { borderColor: COLORS.primary, backgroundColor: '#0A1A0A' }
          ]}
        >
          <View style={styles.toggleIconContainer}>
            <Ionicons 
              name="sync-circle" 
              size={32} 
              color={isIndefinite ? COLORS.primary : '#444'} 
            />
          </View>

          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={[styles.settingTitle, isIndefinite && { color: COLORS.primary }]}>
              KEEP REPEATING
            </Text>
            <Text style={styles.settingDesc}>
              {isIndefinite 
                ? "SYSTEM ACTIVE: This mission will cycle weekly." 
                : "TACTICAL STRIKE: One-time execution on selected dates."}
            </Text>
          </View>

          <Switch 
            value={isIndefinite}
            onValueChange={setIsIndefinite}
            trackColor={{ false: '#333', true: COLORS.primary + '50' }} // Subtle gold track
            thumbColor={isIndefinite ? COLORS.primary : '#f4f3f4'}
          />
        </TouchableOpacity>

        {/* AFTER ACTION REPORT */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>AFTER-ACTION REPORT</Text>
              <Text style={styles.subLabel}>Reflect on your performance post-session</Text>
            </View>
            <Switch value={aarEnabled} onValueChange={setAarEnabled} trackColor={{ true: COLORS.primary }} />
          </View>
          {aarEnabled && (
            <View style={styles.aarInputContainer}>
              <TextInput 
                style={styles.aarInput}
                multiline
                placeholder="What did you achieve during this session? Any friction points?"
                placeholderTextColor="#444"
              />
              <Ionicons name="expand-outline" size={14} color="#333" style={styles.expandIcon} />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.activateBtn}>
          <Ionicons name="alarm-outline" size={22} color="black" />
          <Text style={styles.activateText}>Activate Commitment</Text>
        </TouchableOpacity>

      </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  saveText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#111', marginHorizontal: 20, borderRadius: 12, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabBtnText: { color: '#666', fontWeight: 'bold', fontSize: 14 },
  scrollContent: { padding: 20, paddingBottom: 50 },
  sectionLabel: { color: 'white', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },
  categoryRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Ensuring proper centering
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 20,    // More horizontal breathing room
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#222',
    gap: 10,                  // Spacing between icon and text
    minWidth: 110,            // Ensures visibility even with short text
  },
  activeCatChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: {
    color: 'white', 
    fontSize: 14, 
    fontWeight: 'bold'        // Making it bold as requested
  },
  card: { backgroundColor: '#0A0A0A', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#111' },
  cardLabel: { color: 'white', fontSize: 10, fontWeight: 'bold', marginBottom: 20, opacity: 0.6 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeTitle: { color: 'white', fontSize: 10, fontWeight: 'bold', opacity: 0.4, marginBottom: 5 },
  timeValue: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  durationBadge: { alignItems: 'center', flex: 1 },
  durationText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold', marginVertical: 4, backgroundColor: '#111', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#222' },
  durationLine: { width: 40, height: 1, backgroundColor: '#222' },
  divider: { height: 1, backgroundColor: '#111', marginVertical: 20 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchLabel: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  subLabel: { color: 'white', fontSize: 12, opacity: 0.4, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  stepCount: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
  protocolItem: { backgroundColor: '#111', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#1f1f1f' },
  protocolDot: { width: 10, height: 10, borderRadius: 5, marginRight: 15 },
  protocolInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 8,
  },
  addStepBtn: { borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 25 },
  addStepText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  calendarCard: { backgroundColor: '#0A0A0A', borderRadius: 24, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#111' },
  dateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 15 },
  dateCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  dateCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    // Add a slight glow to the active date
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recurrenceBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', padding: 15, borderRadius: 15 },
  recurrenceText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  recurrenceValue: { color: '#666', fontSize: 14, marginRight: 5 },
  aarInputContainer: { marginTop: 15, backgroundColor: '#000', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#222' },
  aarInput: { color: 'white', fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
  expandIcon: { alignSelf: 'flex-end', marginTop: 5 },
  activateBtn: { backgroundColor: COLORS.primary, borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 40 },
  activateText: { color: 'black', fontSize: 18, fontWeight: 'bold' },
  categoryScroll: {
  paddingRight: 40, // Allows the user to see there is more to scroll
  gap: 12,          // Maintains the spacing between chips
  marginBottom: 25,
  paddingVertical: 5, // Prevents shadows/borders from being clipped
  },
  calendarHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  paddingHorizontal: 10,
  },
  monthYearText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900', // Heavy bold
    letterSpacing: 1.5,
  },
  dateScroll: {
    gap: 15,
    paddingBottom: 20,
  },
  dayLabel: {
  color: '#444',
  fontSize: 9,
  fontWeight: 'bold',
  marginBottom: 8,
  textTransform: 'uppercase',
  },
  advLabel: {
  color: '#FFFFFF',      // Pure white for high contrast
  fontSize: 10,          // Small and tactical
  fontWeight: '900',     // Extra bold
  letterSpacing: 2,      // Spaced out for that "System" look
  marginBottom: 15,
  opacity: 0.9,          // Slightly off-white so it doesn't "glow" too much
  textTransform: 'uppercase',
  alignSelf : 'center',
  },
  stepText: { color: '#444', fontSize: 12, fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  subtitle: { color: '#666', fontSize: 16, marginTop: 8, marginBottom: 25 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  input: { backgroundColor: '#000', borderRadius: 15, padding: 18, color: '#FFF', fontSize: 16, borderWidth: 1, borderColor: '#222' },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  dateBtn: {
    flex: 1, // This ensures all 3 buttons are equal width
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBtnActive: {
    backgroundColor: COLORS.primary, // Gold/Yellow
    borderColor: COLORS.primary,
  },
  dateBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  dateSubtext: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  textBlack: {
    color: '#000',
  },
  timeDisplay: { backgroundColor: '#111', padding: 25, borderRadius: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333' },
  timeText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  editBadge: { backgroundColor: COLORS.primary, padding: 5, borderRadius: 10 },
  methodItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, backgroundColor: '#000', borderWidth: 1, borderColor: '#222' },
  methodActive: { borderColor: COLORS.primary, backgroundColor: '#0A1A0A' },
  methodTitle: { color: '#FFF', fontWeight: 'bold' },
  methodDesc: { color: '#444', fontSize: 12 },
  footerNote: { color: '#333', fontSize: 12, textAlign: 'center', marginTop: 10 },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#000' },
  createBtn: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  createBtnText: { fontSize: 18, fontWeight: 'bold' },
  // ADVANCED TAB SPECIFIC STYLES
protocolRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#111',
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 8,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: '#222',
},
protocolNumber: {
  width: 24,
  height: 24,
  borderRadius: 6,
  backgroundColor: COLORS.primary,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},
protocolNumberText: {
  color: '#000',
  fontSize: 12,
  fontWeight: '900',
},
  deleteBin: {
    padding: 8,
    marginLeft: 4,
    backgroundColor: 'rgba(255, 68, 68, 0.1)', // Subtle red glow
    borderRadius: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  settingTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingDesc: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  sessionWindow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  sessionPart: {
    flex: 1,
    alignItems: 'center',
  },
  sessionLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  sessionTime: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  sessionDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#333',
    marginHorizontal: 15,
  },
  featuredToggleCard: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 20,
  borderRadius: 24,
  backgroundColor: '#111',
  borderWidth: 2,
  borderColor: '#222',
  marginTop: 20,
  marginBottom: 10,
  // Add a subtle shadow for depth
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
},
toggleIconContainer: {
  width: 50,
  height: 50,
  borderRadius: 15,
  backgroundColor: '#000',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#333',
},
});