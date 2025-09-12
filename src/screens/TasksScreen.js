import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import TopNavigation from '../components/TopNavigation';

const TasksScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Today');
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Do deep breathing for 10 minutes',
      dueTime: 'Due 9:00 AM',
      completed: false,
    },
    {
      id: 2,
      title: 'Journal about your feelings',
      dueTime: 'Due 11:00 AM',
      completed: false,
    },
    {
      id: 3,
      title: 'Listen to calming music',
      dueTime: 'Due 1:00 PM',
      completed: false,
    },
    {
      id: 4,
      title: 'Practice mindfulness meditation',
      dueTime: 'Due 3:00 PM',
      completed: false,
    },
    {
      id: 5,
      title: 'Review therapy notes',
      dueTime: 'Due 5:00 PM',
      completed: false,
    },
  ]);

  const toggleTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const TaskItem = ({ task }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.checkboxCompleted]}
        onPress={() => toggleTask(task.id)}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
          {task.title}
        </Text>
        <Text style={styles.taskDueTime}>{task.dueTime}</Text>
      </View>
      
      <View style={styles.statusIndicator} />
    </View>
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddTask = () => {
    // TODO: Navigate to add task screen or show modal
    console.log('Add new task');
  };

  const handleMedications = () => {
    // TODO: Navigate to medications screen
    console.log('Navigate to medications');
  };

  return (
    <View style={styles.container}>
      <TopNavigation navigation={navigation} currentScreen="Tasks" />

      {/* Date/Week Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Today' && styles.tabActive]}
          onPress={() => setSelectedTab('Today')}
        >
          <Text style={[styles.tabText, selectedTab === 'Today' && styles.tabTextActive]}>
            Today
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'This Week' && styles.tabActive]}
          onPress={() => setSelectedTab('This Week')}
        >
          <Text style={[styles.tabText, selectedTab === 'This Week' && styles.tabTextActive]}>
            This Week
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ScrollView>

      {/* Medications Button */}
      <View style={styles.medicationsContainer}>
        <TouchableOpacity style={styles.medicationsButton} onPress={handleMedications}>
          <Text style={styles.medicationsButtonText}>Medications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '300',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#F0E6FF',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#BF8EEB',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#BF8EEB',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#BF8EEB',
    borderRadius: 4,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#BF8EEB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  taskDueTime: {
    fontSize: 14,
    color: '#BF8EEB',
    fontWeight: '500',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 12,
  },
  medicationsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  medicationsButton: {
    backgroundColor: '#BF8EEB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medicationsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TasksScreen;
