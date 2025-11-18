import React, { useState, useEffect, useRef, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";
import { ThemeContext } from "../context/ThemeContext";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://127.0.0.1:8000";

export default function ExerciseDetail({ navigation, route }) {
  const exercise = route?.params?.exercise;
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;
  const surfaceColor = isDark ? '#1A1A1F' : colors.surface;

  const [currentStep, setCurrentStep] = useState(0);
  const [userNotes, setUserNotes] = useState({}); // Store notes for each step
  const [breathingPhase, setBreathingPhase] = useState(0); // Index for breathing phases
  const [breathingCycle, setBreathingCycle] = useState(0);

  // Animation for breathing exercises (step-based, not timer-based)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Check if current step needs text input
  const needsTextInput = () => {
    if (!exercise?.steps || currentStep >= exercise.steps.length) return false;
    const step = exercise.steps[currentStep];
    
    // CBT exercises always need input
    if (exercise.type === 'CBT') return true;
    
    // Emotional Regulation exercises need input
    if (exercise.type === 'Emotional Regulation') return true;
    
    // Check step title/instruction for keywords
    const title = (step.title || '').toLowerCase();
    const instruction = (step.instruction || '').toLowerCase();
    
    const inputKeywords = [
      'write', 'list', 'identify', 'reflect', 'describe', 
      'note', 'answer', 'think', 'consider', 'name',
      'pick', 'choose', 'select', 'brainstorm', 'evaluate'
    ];
    
    return inputKeywords.some(keyword => 
      title.includes(keyword) || instruction.includes(keyword)
    );
  };

  // Get breathing phases for breathing exercises
  const getBreathingPhases = () => {
    if (!exercise?.breathingPattern) return [];
    const pattern = exercise.breathingPattern;
    const phases = [];
    if (pattern.inhale > 0) phases.push({ name: "Inhale", instruction: `Breathe in slowly for ${pattern.inhale} seconds` });
    if (pattern.hold1 > 0) phases.push({ name: "Hold", instruction: `Hold your breath for ${pattern.hold1} seconds` });
    if (pattern.exhale > 0) phases.push({ name: "Exhale", instruction: `Exhale slowly for ${pattern.exhale} seconds` });
    if (pattern.hold2 > 0) phases.push({ name: "Hold", instruction: `Hold for ${pattern.hold2} seconds` });
    return phases;
  };

  // Handle breathing animation based on phase
  useEffect(() => {
    if (exercise?.exerciseType === "breathing") {
      const phases = getBreathingPhases();
      if (phases.length === 0) return;
      
      const currentPhase = phases[breathingPhase % phases.length];
      
      if (currentPhase.name === "Inhale") {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (currentPhase.name === "Exhale") {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [breathingPhase]);

  const handleNext = () => {
    if (exercise?.exerciseType === "breathing") {
      const phases = getBreathingPhases();
      if (phases.length === 0) return;
      
      const nextPhase = breathingPhase + 1;
      
      // If we completed all phases in current cycle
      if (nextPhase >= phases.length) {
        const newCycle = breathingCycle + 1;
        setBreathingCycle(newCycle);
        setBreathingPhase(0);
        
        // Check if we've completed all cycles
        if (newCycle >= (exercise.cycles || 5)) {
          handleComplete();
          return;
        }
      } else {
        setBreathingPhase(nextPhase);
      }
    } else {
      // For guided exercises
      if (currentStep < (exercise?.steps?.length || 0) - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (exercise?.exerciseType === "breathing") {
      const phases = getBreathingPhases();
      if (phases.length === 0) return;
      
      if (breathingPhase > 0) {
        setBreathingPhase(breathingPhase - 1);
      } else if (breathingCycle > 0) {
        // Go back to last phase of previous cycle
        setBreathingCycle(breathingCycle - 1);
        setBreathingPhase(phases.length - 1);
      }
    } else {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleComplete = () => {
    // Collect all user notes into a single string
    const allNotes = Object.entries(userNotes)
      .filter(([_, note]) => note && note.trim())
      .map(([step, note]) => `Step ${step}: ${note}`)
      .join('\n\n');

    saveExerciseSession(true, allNotes);
    
    Alert.alert(
      "Exercise Complete! 🎉",
      "Great job completing this exercise. How do you feel?",
      [
        {
          text: "Done",
          onPress: () => {
            setCurrentStep(0);
            setUserNotes({});
            setBreathingCycle(0);
            setBreathingPhase(0);
            scaleAnim.setValue(1);
            opacityAnim.setValue(1);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleEnd = () => {
    Alert.alert(
      "End Exercise?",
      "Are you sure you want to end this exercise? Your progress will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End",
          style: "destructive",
          onPress: () => {
            const allNotes = Object.entries(userNotes)
              .filter(([_, note]) => note && note.trim())
              .map(([step, note]) => `Step ${step}: ${note}`)
              .join('\n\n');
            saveExerciseSession(false, allNotes);
            setCurrentStep(0);
            setUserNotes({});
            setBreathingCycle(0);
            setBreathingPhase(0);
            scaleAnim.setValue(1);
            opacityAnim.setValue(1);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const saveExerciseSession = async (completed, notes = "") => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      await fetch(`${API_BASE_URL}/api/journals/exercises/sessions/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exercise_id: exercise?.id || "unknown",
          exercise_title: exercise?.title || "Exercise",
          exercise_type: exercise?.type || "Unknown",
          duration_seconds: 0, // No timer tracking
          completed: completed,
          user_notes: notes || "",
        }),
      });
    } catch (error) {
      console.log("Error saving exercise session:", error);
    }
  };

  const updateNote = (stepIndex, note) => {
    setUserNotes(prev => ({
      ...prev,
      [stepIndex]: note,
    }));
  };

  if (!exercise) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>Exercise not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, { color: colors.accent }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isBreathing = exercise.exerciseType === "breathing";
  const breathingPhases = getBreathingPhases();
  const currentStepData = isBreathing 
    ? breathingPhases[breathingPhase]
    : exercise.steps?.[currentStep];
  
  const totalSteps = isBreathing 
    ? (exercise.cycles || 5) * breathingPhases.length
    : exercise.steps?.length || 1;
  
  const currentStepNumber = isBreathing
    ? breathingCycle * breathingPhases.length + breathingPhase + 1
    : currentStep + 1;
  
  const canGoPrevious = isBreathing
    ? (breathingCycle > 0 || breathingPhase > 0)
    : currentStep > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.headerRow, { borderBottomColor: isDark ? '#2A2A2F' : colors.border }]}>
        <TouchableOpacity hitSlop={10} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{exercise.title}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise Info */}
        <View style={styles.exerciseInfo}>
          <View style={[styles.categoryBadge, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.categoryText, { color: colors.accent }]}>{exercise.type}</Text>
          </View>
          <Text style={[styles.description, { color: textColor }]}>{exercise.subtitle || exercise.description || ""}</Text>
        </View>

        {/* Step Indicator */}
        <View style={[styles.stepIndicator, { backgroundColor: surfaceColor }]}>
          <Text style={[styles.stepIndicatorText, { color: colors.accent }]}>
            Step {currentStepNumber} of {totalSteps}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(currentStepNumber / totalSteps) * 100}%`,
                  backgroundColor: colors.accent,
                },
              ]}
            />
          </View>
        </View>

        {/* Exercise Content */}
        {isBreathing ? (
          <View style={styles.breathingContainer}>
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  backgroundColor: isDark ? '#3B82F6' : '#3B82F6',
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            />
            <Text style={[styles.breathingInstruction, { color: textColor }]}>
              {currentStepData?.name || "Breathe"}
            </Text>
            <Text style={[styles.breathingSubtext, { color: isDark ? '#999' : colors.mutedText }]}>
              {currentStepData?.instruction || ""}
            </Text>
            <Text style={[styles.breathingCycle, { color: isDark ? '#999' : colors.mutedText }]}>
              Cycle {breathingCycle + 1} of {exercise.cycles || 5}
            </Text>
          </View>
        ) : (
          <View style={[styles.instructionCard, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.stepTitle, { color: textColor }]}>
              {currentStepData?.title || `Step ${currentStep + 1}`}
            </Text>
            <Text style={[styles.instructionText, { color: textColor }]}>
              {currentStepData?.instruction || ""}
            </Text>

            {/* Text Input for steps that need it */}
            {needsTextInput() && (
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: textColor }]}>Your Notes:</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#0F0F14' : '#F8F9FA',
                      color: textColor,
                      borderColor: isDark ? '#2A2A2F' : colors.border,
                    },
                  ]}
                  placeholder="Write your thoughts, reflections, or answers here..."
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  value={userNotes[currentStep] || ""}
                  onChangeText={(text) => updateNote(currentStep, text)}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
            )}
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.prevButton,
              { 
                backgroundColor: !canGoPrevious ? (isDark ? '#1A1A1F' : '#E0E0E0') : surfaceColor,
                borderColor: isDark ? '#2A2A2F' : colors.border,
                opacity: !canGoPrevious ? 0.5 : 1,
              },
            ]}
            onPress={handlePrevious}
            disabled={!canGoPrevious}
            activeOpacity={0.8}
          >
            <Feather name="chevron-left" size={20} color={!canGoPrevious ? (isDark ? '#666' : '#999') : textColor} />
            <Text style={[
              styles.navButtonText, 
              { color: !canGoPrevious ? (isDark ? '#666' : '#999') : textColor }
            ]}>
              Previous Step
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              { backgroundColor: '#2D5A27' },
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={[styles.navButtonText, { color: '#fff' }]}>
              {currentStepNumber >= totalSteps ? "Complete" : "Next Step"}
            </Text>
            <Feather name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* End Exercise Button */}
        <TouchableOpacity
          style={[styles.endButton, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border }]}
          onPress={handleEnd}
          activeOpacity={0.8}
        >
          <Feather name="x" size={18} color={isDark ? '#EF4444' : '#EF4444'} />
          <Text style={[styles.endButtonText, { color: '#EF4444' }]}>End Exercise</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  title: { ...type.h2, fontWeight: '700', flex: 1, textAlign: 'center' },
  scrollContent: { 
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: { ...type.h3, marginBottom: spacing.md },
  backButton: { ...type.body, fontWeight: '600' },
  exerciseInfo: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    marginBottom: spacing.sm,
  },
  categoryText: {
    ...type.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  description: {
    ...type.body,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
  stepIndicator: {
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  stepIndicatorText: {
    ...type.body,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  breathingContainer: {
    minHeight: ms(300),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  breathingCircle: {
    width: ms(200),
    height: ms(200),
    borderRadius: ms(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingInstruction: {
    ...type.h1,
    fontWeight: '700',
    marginTop: spacing.xl,
    fontSize: ms(36),
  },
  breathingSubtext: {
    ...type.body,
    marginTop: spacing.md,
    textAlign: 'center',
    fontSize: ms(16),
  },
  breathingCycle: {
    ...type.body,
    marginTop: spacing.md,
  },
  instructionCard: {
    padding: spacing.xl,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    minHeight: ms(200),
  },
  stepTitle: {
    ...type.h2,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  instructionText: {
    ...type.body,
    fontSize: ms(16),
    lineHeight: ms(24),
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginTop: spacing.md,
  },
  inputLabel: {
    ...type.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    ...type.body,
    minHeight: ms(120),
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  prevButton: {
    // Styles applied inline
  },
  nextButton: {
    borderWidth: 0,
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  navButtonText: {
    ...type.body,
    fontWeight: '700',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  endButtonText: {
    ...type.body,
    fontWeight: '600',
  },
});
