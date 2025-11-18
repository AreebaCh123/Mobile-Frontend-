import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const OnboardingScreen = ({ navigation }) => {
  const { isDark } = useContext(ThemeContext);
  const bgColor = isDark ? '#050509' : '#F8F9FA';
  const contentBg = isDark ? '#050509' : '#FFFFFF';
  const titleColor = isDark ? '#FFFFFF' : '#2D3748';
  const taglineColor = isDark ? '#E5E7EB' : '#718096';
  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={contentBg} />
      
      <View style={[styles.content, { backgroundColor: contentBg }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* App Name */}
        <Text style={[styles.appName, { color: titleColor }]}>MindMate</Text>
        
        {/* Tagline */}
        <Text style={[styles.tagline, { color: taglineColor }]}>Take a step towards self care</Text>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    color: '#718096',
    marginBottom: 60,
    textAlign: 'center',
    lineHeight: 24,
  },
  getStartedButton: {
    backgroundColor: '#BF8EEB',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#BF8EEB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;