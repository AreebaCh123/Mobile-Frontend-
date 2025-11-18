import React, { useMemo, useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, type, radii } from "../themes/tokens";
import { ms } from "../themes/scale";
import { ThemeContext } from "../context/ThemeContext";

// Complete exercise data with all 25 exercises
const EXERCISES_DATA = [
  // CBT Exercises (5)
  {
    id: "thought-record",
    title: "Thought Record",
    subtitle: "Identify → Challenge → Replace negative thoughts",
    duration: "3-5 min",
    durationSeconds: 300,
    type: "CBT",
    category: "CBT Tools",
    image: "🧠",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Write the situation",
        instruction: "Describe what happened that triggered your negative thought. Be specific about when and where.",
        duration: 60,
      },
      {
        step: 2,
        title: "Identify the automatic negative thought",
        instruction: "What thought automatically came to mind? Write it down exactly as it appeared.",
        duration: 60,
      },
      {
        step: 3,
        title: "Challenge it with evidence",
        instruction: "Ask yourself: Is this thought 100% true? What evidence supports or contradicts it?",
        duration: 90,
      },
      {
        step: 4,
        title: "Replace with a balanced thought",
        instruction: "Create a more balanced, realistic thought that considers all the evidence.",
        duration: 90,
      },
    ],
  },
  {
    id: "cognitive-restructuring",
    title: "Cognitive Restructuring",
    subtitle: "Break negative thinking patterns",
    duration: "3-4 min",
    durationSeconds: 240,
    type: "CBT",
    category: "CBT Tools",
    image: "🔄",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Identify the thought",
        instruction: "What negative thought are you having right now? Write it down.",
        duration: 45,
      },
      {
        step: 2,
        title: "Ask: Is this 100% true?",
        instruction: "Challenge the thought. Is there any evidence that contradicts it?",
        duration: 60,
      },
      {
        step: 3,
        title: "What would I tell a friend?",
        instruction: "If a friend had this thought, what would you say to them? Apply that kindness to yourself.",
        duration: 60,
      },
      {
        step: 4,
        title: "Find another perspective",
        instruction: "Is there another way to see this situation? What's a more balanced view?",
        duration: 75,
      },
    ],
  },
  {
    id: "behavioral-activation",
    title: "Behavioral Activation",
    subtitle: "Increase positive actions to reduce depression",
    duration: "2-3 min",
    durationSeconds: 180,
    type: "CBT",
    category: "CBT Tools",
    image: "🚶",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Pick one small activity",
        instruction: "Choose one small activity you enjoy: a walk, shower, listening to music, or calling a friend.",
        duration: 60,
      },
      {
        step: 2,
        title: "Schedule it today",
        instruction: "When will you do this activity? Set a specific time and commit to it.",
        duration: 60,
      },
      {
        step: 3,
        title: "Take action",
        instruction: "Do the activity now or at your scheduled time. Notice how you feel before and after.",
        duration: 60,
      },
    ],
  },
  {
    id: "worry-time",
    title: "Worry Time Technique",
    subtitle: "Contain worries to reduce constant anxiety",
    duration: "10 min",
    durationSeconds: 600,
    type: "CBT",
    category: "CBT Tools",
    image: "⏰",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Write down your worry",
        instruction: "Whenever a worry appears, write it down. Don't think about it now, just capture it.",
        duration: 60,
      },
      {
        step: 2,
        title: "Set your worry time",
        instruction: "Choose a specific 10-minute time slot in the evening (e.g., 7:00-7:10 PM).",
        duration: 60,
      },
      {
        step: 3,
        title: "During worry time",
        instruction: "Only think about your worries during this time. Set a timer and focus on them.",
        duration: 480,
      },
      {
        step: 4,
        title: "After worry time",
        instruction: "When the timer ends, let go of worries. Remind yourself you'll address them tomorrow.",
        duration: 60,
      },
    ],
  },
  {
    id: "problem-solving",
    title: "Problem-Solving Steps",
    subtitle: "Systematic approach to reduce anxiety and stress",
    duration: "5 min",
    durationSeconds: 300,
    type: "CBT",
    category: "CBT Tools",
    image: "💡",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Define the problem",
        instruction: "Clearly state what the problem is. Be specific and concrete.",
        duration: 60,
      },
      {
        step: 2,
        title: "List solutions",
        instruction: "Brainstorm at least 3-5 possible solutions. Don't judge them yet, just list them.",
        duration: 90,
      },
      {
        step: 3,
        title: "Evaluate pros and cons",
        instruction: "For each solution, list the advantages and disadvantages.",
        duration: 90,
      },
      {
        step: 4,
        title: "Pick one and try it",
        instruction: "Choose the best solution and commit to trying it. Set a deadline.",
        duration: 60,
      },
    ],
  },
  // Breathing Exercises (5)
  {
    id: "box-breathing",
    title: "Box Breathing",
    subtitle: "4-4-4-4 rhythm for calm and focus",
    duration: "1-2 min",
    durationSeconds: 120,
    type: "Breathing",
    category: "Breathing Exercises",
    image: "📦",
    exerciseType: "breathing",
    breathingPattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
    cycles: 5,
    steps: [
      {
        step: 1,
        title: "Inhale",
        instruction: "Breathe in slowly through your nose for 4 seconds",
        duration: 4,
      },
      {
        step: 2,
        title: "Hold",
        instruction: "Hold your breath for 4 seconds",
        duration: 4,
      },
      {
        step: 3,
        title: "Exhale",
        instruction: "Exhale slowly through your mouth for 4 seconds",
        duration: 4,
      },
      {
        step: 4,
        title: "Hold",
        instruction: "Hold for 4 seconds before the next breath",
        duration: 4,
      },
    ],
  },
  {
    id: "478-breathing",
    title: "4-7-8 Breathing",
    subtitle: "Promote relaxation and better sleep",
    duration: "1 min",
    durationSeconds: 60,
    type: "Breathing",
    category: "Breathing Exercises",
    image: "🌬️",
    exerciseType: "breathing",
    breathingPattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
    cycles: 4,
    steps: [
      {
        step: 1,
        title: "Inhale",
        instruction: "Breathe in through your nose for 4 seconds",
        duration: 4,
      },
      {
        step: 2,
        title: "Hold",
        instruction: "Hold your breath for 7 seconds",
        duration: 7,
      },
      {
        step: 3,
        title: "Exhale",
        instruction: "Exhale slowly through your mouth for 8 seconds",
        duration: 8,
      },
    ],
  },
  {
    id: "belly-breathing",
    title: "Diaphragmatic Belly Breathing",
    subtitle: "Reset your fight-or-flight system",
    duration: "2-3 min",
    durationSeconds: 180,
    type: "Breathing",
    category: "Breathing Exercises",
    image: "🫁",
    exerciseType: "breathing",
    breathingPattern: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
    cycles: 10,
    steps: [
      {
        step: 1,
        title: "Position your hands",
        instruction: "Place one hand on your chest, one on your belly",
        duration: 10,
      },
      {
        step: 2,
        title: "Inhale deeply",
        instruction: "Breathe in slowly so your belly rises (chest stays still)",
        duration: 5,
      },
      {
        step: 3,
        title: "Exhale slowly",
        instruction: "Exhale slowly, feeling your belly fall",
        duration: 5,
      },
    ],
  },
  {
    id: "pursed-lip",
    title: "Pursed-Lip Breathing",
    subtitle: "Slow breathing to reduce tension",
    duration: "1-2 min",
    durationSeconds: 120,
    type: "Breathing",
    category: "Breathing Exercises",
    image: "👄",
    exerciseType: "breathing",
    breathingPattern: { inhale: 2, hold1: 0, exhale: 4, hold2: 0 },
    cycles: 10,
    steps: [
      {
        step: 1,
        title: "Inhale",
        instruction: "Breathe in through your nose for 2 seconds",
        duration: 2,
      },
      {
        step: 2,
        title: "Exhale",
        instruction: "Exhale slowly through pursed lips for 4 seconds",
        duration: 4,
      },
    ],
  },
  {
    id: "coherent-breathing",
    title: "Coherent Breathing",
    subtitle: "5-5 rhythm to stabilize heart rate",
    duration: "3-5 min",
    durationSeconds: 300,
    type: "Breathing",
    category: "Breathing Exercises",
    image: "💙",
    exerciseType: "breathing",
    breathingPattern: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
    cycles: 20,
    steps: [
      {
        step: 1,
        title: "Inhale",
        instruction: "Breathe in slowly for 5 seconds",
        duration: 5,
      },
      {
        step: 2,
        title: "Exhale",
        instruction: "Breathe out slowly for 5 seconds",
        duration: 5,
      },
    ],
  },
  // Mindfulness Exercises (5)
  {
    id: "54321-grounding",
    title: "5-4-3-2-1 Grounding",
    subtitle: "Instant grounding during anxiety",
    duration: "2 min",
    durationSeconds: 120,
    type: "Mindfulness",
    category: "Mindfulness",
    image: "🌍",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "5 things you see",
        instruction: "Look around and name 5 things you can see. Be specific about colors and shapes.",
        duration: 30,
      },
      {
        step: 2,
        title: "4 things you can touch",
        instruction: "Touch 4 different objects. Notice their texture, temperature, and weight.",
        duration: 30,
      },
      {
        step: 3,
        title: "3 things you hear",
        instruction: "Listen carefully and identify 3 sounds around you. Notice their volume and rhythm.",
        duration: 20,
      },
      {
        step: 4,
        title: "2 things you smell",
        instruction: "Take a deep breath and identify 2 scents. They can be subtle or strong.",
        duration: 20,
      },
      {
        step: 5,
        title: "1 thing you taste",
        instruction: "Notice 1 taste in your mouth. It might be subtle - just notice it.",
        duration: 20,
      },
    ],
  },
  {
    id: "mindful-eating",
    title: "Mindful Eating",
    subtitle: "Build presence and reduce stress",
    duration: "3-5 min",
    durationSeconds: 300,
    type: "Mindfulness",
    category: "Mindfulness",
    image: "🍎",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Take one bite",
        instruction: "Choose a small piece of food. Before eating, observe its appearance.",
        duration: 30,
      },
      {
        step: 2,
        title: "Notice the smell",
        instruction: "Bring it close to your nose. What do you smell? Take your time.",
        duration: 30,
      },
      {
        step: 3,
        title: "Feel the texture",
        instruction: "Place it in your mouth but don't chew yet. Notice the texture and temperature.",
        duration: 30,
      },
      {
        step: 4,
        title: "Taste mindfully",
        instruction: "Chew slowly. Notice the taste, how it changes, and the sensations.",
        duration: 120,
      },
      {
        step: 5,
        title: "Swallow with awareness",
        instruction: "Notice the sensation of swallowing. How do you feel now?",
        duration: 90,
      },
    ],
  },
  {
    id: "body-scan",
    title: "Body Scan",
    subtitle: "Relax and reconnect with your body",
    duration: "3-4 min",
    durationSeconds: 240,
    type: "Mindfulness",
    category: "Mindfulness",
    image: "🧘",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Close your eyes",
        instruction: "Find a comfortable position. Close your eyes and take 3 deep breaths.",
        duration: 30,
      },
      {
        step: 2,
        title: "Start from your head",
        instruction: "Notice sensations in your head - temperature, pressure, any tension.",
        duration: 30,
      },
      {
        step: 3,
        title: "Move to your shoulders",
        instruction: "Bring attention to your shoulders. Notice any tightness or relaxation.",
        duration: 30,
      },
      {
        step: 4,
        title: "Continue down your body",
        instruction: "Slowly move attention through your chest, arms, belly, legs, and feet.",
        duration: 90,
      },
      {
        step: 5,
        title: "Notice without judging",
        instruction: "Simply observe sensations without trying to change them. Just notice.",
        duration: 60,
      },
    ],
  },
  {
    id: "mindful-walking",
    title: "Mindful Walking",
    subtitle: "Great for people who get restless",
    duration: "3-5 min",
    durationSeconds: 300,
    type: "Mindfulness",
    category: "Mindfulness",
    image: "🚶‍♀️",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Notice each step",
        instruction: "Walk slowly and notice the sensation of your feet touching the ground.",
        duration: 60,
      },
      {
        step: 2,
        title: "Feel your feet",
        instruction: "Pay attention to the weight shifting from heel to toe with each step.",
        duration: 60,
      },
      {
        step: 3,
        title: "Sync with your breath",
        instruction: "Match your steps with your breathing. Inhale for 2 steps, exhale for 2 steps.",
        duration: 90,
      },
      {
        step: 4,
        title: "Notice your surroundings",
        instruction: "Be aware of what you see, hear, and feel around you as you walk.",
        duration: 90,
      },
    ],
  },
  {
    id: "cloud-watching",
    title: "Cloud-Watching Thoughts",
    subtitle: "Teach acceptance and reduce overthinking",
    duration: "2-3 min",
    durationSeconds: 180,
    type: "Mindfulness",
    category: "Mindfulness",
    image: "☁️",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Imagine thoughts as clouds",
        instruction: "Close your eyes. Picture your thoughts as clouds floating in the sky.",
        duration: 30,
      },
      {
        step: 2,
        title: "Notice them come and go",
        instruction: "Watch thoughts appear like clouds, drift by, and disappear. Don't hold onto them.",
        duration: 60,
      },
      {
        step: 3,
        title: "Don't follow or fight",
        instruction: "If a thought appears, just notice it. Don't analyze it or push it away.",
        duration: 60,
      },
      {
        step: 4,
        title: "Return to the sky",
        instruction: "When you get caught in a thought, gently return your attention to the sky.",
        duration: 30,
      },
    ],
  },
  // Grounding/Anxiety Relief (5)
  {
    id: "temperature-change",
    title: "Temperature Change",
    subtitle: "Instant panic relief with ice or cold water",
    duration: "30-60 sec",
    durationSeconds: 60,
    type: "Grounding",
    category: "Grounding / Anxiety Relief",
    image: "🧊",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Get ice or cold water",
        instruction: "Hold an ice cube or prepare cold water. This will shock your nervous system.",
        duration: 10,
      },
      {
        step: 2,
        title: "Apply to your skin",
        instruction: "Hold the ice cube or splash cold water on your face and wrists.",
        duration: 20,
      },
      {
        step: 3,
        title: "Notice the sensation",
        instruction: "Focus on the cold sensation. This interrupts panic and brings you to the present.",
        duration: 30,
      },
    ],
  },
  {
    id: "333-rule",
    title: "3-3-3 Rule",
    subtitle: "Stop spiraling thoughts quickly",
    duration: "1-2 min",
    durationSeconds: 120,
    type: "Grounding",
    category: "Grounding / Anxiety Relief",
    image: "3️⃣",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Name 3 things you see",
        instruction: "Look around and name 3 specific things you can see. Say them out loud.",
        duration: 30,
      },
      {
        step: 2,
        title: "Touch 3 things",
        instruction: "Touch 3 different objects around you. Notice their texture and temperature.",
        duration: 30,
      },
      {
        step: 3,
        title: "Move 3 body parts",
        instruction: "Move 3 body parts: wiggle your shoulders, move your fingers, nod your head.",
        duration: 60,
      },
    ],
  },
  {
    id: "object-focus",
    title: "Object Focus",
    subtitle: "Bring your mind back to the present",
    duration: "1-2 min",
    durationSeconds: 120,
    type: "Grounding",
    category: "Grounding / Anxiety Relief",
    image: "🔍",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Hold an object",
        instruction: "Pick up any object nearby: a keychain, pen, phone, or anything you can hold.",
        duration: 10,
      },
      {
        step: 2,
        title: "Observe its shape",
        instruction: "Look at the object's shape. Is it round, square, irregular? Notice every detail.",
        duration: 30,
      },
      {
        step: 3,
        title: "Notice its color",
        instruction: "What color is it? Are there multiple colors? Describe them precisely.",
        duration: 30,
      },
      {
        step: 4,
        title: "Feel its texture",
        instruction: "Run your fingers over it. Is it smooth, rough, cold, warm? Describe the texture.",
        duration: 50,
      },
    ],
  },
  {
    id: "alphabet-game",
    title: "Alphabet Game",
    subtitle: "Distract your brain from anxious thoughts",
    duration: "2 min",
    durationSeconds: 120,
    type: "Grounding",
    category: "Grounding / Anxiety Relief",
    image: "🔤",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Pick a category",
        instruction: "Choose a category: animals, fruits, countries, or names. Let's use animals.",
        duration: 20,
      },
      {
        step: 2,
        title: "Go from A to Z",
        instruction: "Name one item for each letter: A = Ant, B = Bear, C = Cat, and so on.",
        duration: 100,
      },
    ],
  },
  {
    id: "square-grounding",
    title: "Square Grounding",
    subtitle: "Calm sensory overload",
    duration: "1-2 min",
    durationSeconds: 120,
    type: "Grounding",
    category: "Grounding / Anxiety Relief",
    image: "⬜",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Find a square",
        instruction: "Look for any square shape: a window, tile, picture frame, or screen.",
        duration: 15,
      },
      {
        step: 2,
        title: "Trace the top side",
        instruction: "With your eyes or finger, trace the top side slowly. Breathe in.",
        duration: 30,
      },
      {
        step: 3,
        title: "Trace the right side",
        instruction: "Trace down the right side slowly. Breathe out.",
        duration: 30,
      },
      {
        step: 4,
        title: "Trace the bottom",
        instruction: "Trace along the bottom from right to left. Breathe in.",
        duration: 30,
      },
      {
        step: 5,
        title: "Trace the left side",
        instruction: "Trace up the left side to complete the square. Breathe out.",
        duration: 15,
      },
    ],
  },
  // Emotional Regulation (5)
  {
    id: "name-emotion",
    title: "Name the Emotion",
    subtitle: "Reduce intensity by naming feelings",
    duration: "1 min",
    durationSeconds: 60,
    type: "Emotional Regulation",
    category: "Emotional Regulation",
    image: "💭",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Pause",
        instruction: "Stop what you're doing. Take a moment to check in with yourself.",
        duration: 10,
      },
      {
        step: 2,
        title: "Identify the emotion",
        instruction: "What are you feeling right now? Name it: sad, anxious, angry, overwhelmed?",
        duration: 20,
      },
      {
        step: 3,
        title: "Name the cause",
        instruction: "Say to yourself: 'I am feeling [emotion] because [reason].'",
        duration: 30,
      },
    ],
  },
  {
    id: "comfort-box",
    title: "Comfort Box",
    subtitle: "Create a soothing box for stressful moments",
    duration: "2-3 min",
    durationSeconds: 180,
    type: "Emotional Regulation",
    category: "Emotional Regulation",
    image: "📦",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Gather comforting items",
        instruction: "Collect: a calming scent (lavender), a soft object (blanket), a positive note, a memory photo.",
        duration: 60,
      },
      {
        step: 2,
        title: "Place them in a box",
        instruction: "Put all items in a small box or bag. This is your comfort box.",
        duration: 30,
      },
      {
        step: 3,
        title: "Use when stressed",
        instruction: "When you feel overwhelmed, open your comfort box. Engage with each item mindfully.",
        duration: 90,
      },
    ],
  },
  {
    id: "opposite-action",
    title: "Opposite Action",
    subtitle: "DBT technique for emotional control",
    duration: "3-5 min",
    durationSeconds: 300,
    type: "Emotional Regulation",
    category: "Emotional Regulation",
    image: "🔄",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Notice your mood's message",
        instruction: "What is your mood telling you to do? Stay in bed? Avoid everyone?",
        duration: 30,
      },
      {
        step: 2,
        title: "Identify the opposite",
        instruction: "What's the opposite action? If mood says 'stay in bed', the opposite is 'take a short walk'.",
        duration: 60,
      },
      {
        step: 3,
        title: "Take the opposite action",
        instruction: "Do the opposite action even if you don't feel like it. Start small.",
        duration: 120,
      },
      {
        step: 4,
        title: "Notice the result",
        instruction: "How do you feel after taking the opposite action? Notice any changes.",
        duration: 90,
      },
    ],
  },
  {
    id: "sensory-reset",
    title: "Sensory Reset",
    subtitle: "Use 5 senses to calm down",
    duration: "2-3 min",
    durationSeconds: 180,
    type: "Emotional Regulation",
    category: "Emotional Regulation",
    image: "🌸",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Smell",
        instruction: "Use a calming scent: lavender, chamomile, or your favorite essential oil.",
        duration: 30,
      },
      {
        step: 2,
        title: "Hear",
        instruction: "Listen to calming audio: nature sounds, soft music, or silence.",
        duration: 30,
      },
      {
        step: 3,
        title: "Taste",
        instruction: "Drink warm tea or water. Notice the temperature and flavor.",
        duration: 30,
      },
      {
        step: 4,
        title: "Touch",
        instruction: "Wrap yourself in a soft blanket or hold a comforting object.",
        duration: 30,
      },
      {
        step: 5,
        title: "See",
        instruction: "Look at warm lights, a favorite photo, or something beautiful.",
        duration: 60,
      },
    ],
  },
  {
    id: "self-compassion",
    title: "Self-Compassion Talk",
    subtitle: "Kindness for guilt, sadness, and stress",
    duration: "1-2 min",
    durationSeconds: 120,
    type: "Emotional Regulation",
    category: "Emotional Regulation",
    image: "💚",
    exerciseType: "guided-text",
    steps: [
      {
        step: 1,
        title: "Acknowledge your feelings",
        instruction: "Recognize that you're struggling. It's okay to feel this way.",
        duration: 20,
      },
      {
        step: 2,
        title: "Say kind words",
        instruction: "Tell yourself: 'I am doing my best.' 'It's okay to feel this way.'",
        duration: 40,
      },
      {
        step: 3,
        title: "Remind yourself",
        instruction: "Say: 'I deserve kindness.' 'I am human and it's normal to struggle.'",
        duration: 60,
      },
    ],
  },
];

// Motivational messages to show during exercises
const MOTIVATIONAL_MESSAGES = [
  "You're doing great! 🌟",
  "Take your time, there's no rush.",
  "Every breath is a new beginning.",
  "You're stronger than you think.",
  "This moment is just right.",
  "You're taking care of yourself. 💚",
  "Progress, not perfection.",
  "You've got this! ✨",
  "Be gentle with yourself.",
  "You're exactly where you need to be.",
];

export default function SelfHelpTools({ navigation }) {
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : colors.bg;
  const textColor = isDark ? '#FFFFFF' : colors.text;
  const surfaceColor = isDark ? '#1A1A1F' : colors.surface;

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [durationFilter, setDurationFilter] = useState(null);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);

  // Group exercises by category
  const exercisesByCategory = useMemo(() => {
    const grouped = {};
    EXERCISES_DATA.forEach(ex => {
      if (!grouped[ex.category]) {
        grouped[ex.category] = [];
      }
      grouped[ex.category].push(ex);
    });
    return grouped;
  }, []);

  const filtered = useMemo(() => {
    return EXERCISES_DATA.filter((ex) => {
      const okType = !typeFilter || ex.type === typeFilter;
      const okQuery =
        !q ||
        ex.title.toLowerCase().includes(q.toLowerCase()) ||
        ex.subtitle.toLowerCase().includes(q.toLowerCase());
      
      // Duration filtering - parse duration string
      let okDuration = true;
      if (durationFilter) {
        const durationNum = ex.durationSeconds;
        switch (durationFilter) {
          case '1-5':
            okDuration = durationNum >= 60 && durationNum <= 300;
            break;
          case '5-10':
            okDuration = durationNum > 300 && durationNum <= 600;
            break;
          case '10-15':
            okDuration = durationNum > 600 && durationNum <= 900;
            break;
          case '15-30':
            okDuration = durationNum > 900 && durationNum <= 1800;
            break;
          case '30+':
            okDuration = durationNum > 1800;
            break;
        }
      }
      
      return okType && okQuery && okDuration;
    });
  }, [q, typeFilter, durationFilter]);

  const sections = useMemo(() => {
    const by = {};
    filtered.forEach((ex) => {
      by[ex.category] = by[ex.category] || [];
      by[ex.category].push(ex);
    });
    return Object.entries(by).map(([name, items]) => ({ name, items }));
  }, [filtered]);

  const onOpen = (exercise) => navigation.navigate("ExerciseDetail", { exercise });

  const renderCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border }]} 
      onPress={() => onOpen(item)} 
      activeOpacity={0.8}
    >
      <View style={[styles.cardImageContainer, { backgroundColor: isDark ? '#0F0F14' : '#F8F9FA' }]}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emojiIcon}>{item.image}</Text>
        </View>
        <View style={[styles.durationBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.8)' }]}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.cardSub, { color: isDark ? '#999' : colors.mutedText }]} numberOfLines={2}>{item.subtitle}</Text>
        <View style={styles.cardFooter}>
          <View style={[styles.typeBadge, { backgroundColor: isDark ? '#2D5A27' : '#2D5A27' }]}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const typeFilters = ["CBT", "Breathing", "Mindfulness", "Grounding", "Emotional Regulation"];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.headerRow, { backgroundColor: bgColor, borderBottomColor: isDark ? '#2A2A2F' : colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Self-Help Tools</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border }]}>
          <Feather name="search" size={18} color={isDark ? '#999' : colors.accent} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search tools"
            placeholderTextColor={isDark ? '#666' : colors.mutedText}
            value={q}
            onChangeText={setQ}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            <View style={styles.filtersRow}>
              {typeFilters.map((t) => {
                const active = typeFilter === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTypeFilter(active ? null : t)}
                    style={[
                      styles.filterChip, 
                      { backgroundColor: active ? '#2D5A27' : surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border },
                      active && styles.filterChipActive
                    ]}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.filterText, { color: active ? '#fff' : (isDark ? '#999' : colors.accent) }]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              
              {/* Duration filter */}
              <TouchableOpacity 
                style={[
                  styles.durationChip, 
                  { backgroundColor: durationFilter ? '#2D5A27' : surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border },
                  durationFilter && styles.durationChipActive
                ]} 
                onPress={() => setShowDurationDropdown(!showDurationDropdown)}
                activeOpacity={0.9}
              >
                <Text style={[styles.durationText, { color: durationFilter ? '#fff' : (isDark ? '#999' : colors.accent) }]}>
                  {durationFilter ? `${durationFilter} min` : 'Duration'}
                </Text>
                <Feather name="chevron-down" size={16} color={durationFilter ? '#fff' : (isDark ? '#999' : colors.accent)} />
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          {/* Duration dropdown */}
          {showDurationDropdown && (
            <View style={[styles.dropdown, { backgroundColor: surfaceColor, borderColor: isDark ? '#2A2A2F' : colors.border }]}>
              {['1-5', '5-10', '10-15', '15-30', '30+'].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setDurationFilter(durationFilter === duration ? null : duration);
                    setShowDurationDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownText, { color: textColor }]}>{duration} min</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {sections.length > 0 ? (
            sections.map((section) => (
              <View key={section.name} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>{section.name}</Text>
                <View style={styles.cardsGrid}>
                  {section.items.map((item) => (
                    <View key={item.id} style={styles.cardWrapper}>
                      {renderCard({ item })}
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color={isDark ? '#444' : colors.mutedText} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No tools found</Text>
              <Text style={[styles.emptySubtitle, { color: isDark ? '#999' : colors.mutedText }]}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD = { w: ms(160), h: ms(200) };

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
  headerTitle: { ...type.h2, fontWeight: '700' },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: spacing['3xl'] },
  searchRow: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: ms(52),
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchInput: { flex: 1, ...type.body },
  filtersContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  filtersScroll: {
    marginHorizontal: -spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  filtersRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ms(16),
    paddingVertical: ms(10),
    borderWidth: 1,
    borderRadius: radii.pill,
  },
  filterChipActive: { 
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  filterText: { ...type.caption, fontWeight: "600", fontSize: 12 },
  durationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: ms(16),
    paddingVertical: ms(10),
    borderWidth: 1,
    borderRadius: radii.pill,
  },
  durationChipActive: {
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  durationText: { ...type.caption, fontWeight: "600", fontSize: 12 },
  dropdown: {
    position: 'absolute',
    top: ms(50),
    right: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    minWidth: ms(120),
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownText: { ...type.caption, fontWeight: '500', textAlign: 'center' },
  contentContainer: { paddingHorizontal: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...type.h3, fontWeight: '700', marginBottom: spacing.md },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardWrapper: { width: '48%', marginBottom: spacing.md },
  card: {
    width: '100%',
    height: CARD.h,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImageContainer: {
    position: 'relative',
    height: ms(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiIcon: { fontSize: ms(56), textAlign: 'center' },
  durationBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  durationText: { ...type.caption, color: '#fff', fontWeight: '600', fontSize: ms(10) },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  cardTitle: { 
    ...type.body, 
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  cardSub: { 
    ...type.caption, 
    lineHeight: ms(16),
    marginBottom: spacing.sm,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 'auto',
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  typeText: { ...type.caption, color: '#fff', fontWeight: '600', fontSize: ms(10) },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: { ...type.h3, marginTop: spacing.md, marginBottom: spacing.sm },
  emptySubtitle: { ...type.body, textAlign: 'center' },
});
