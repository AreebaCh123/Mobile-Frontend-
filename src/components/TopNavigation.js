import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';

const TopNavigation = ({ navigation, currentScreen }) => {
  const [showMenu, setShowMenu] = useState(false);

  const screens = [
    { name: 'Settings', title: 'Settings', icon: '⚙️', route: 'Settings' },
    { name: 'Tasks', title: 'Tasks', icon: '☑️', route: 'Tasks' },
    { name: 'EmergencySupport', title: 'Emergency Support', icon: '🚑', route: 'EmergencySupport' },
    { name: 'Chatbot', title: 'AI Chatbot', icon: '💬', route: 'Chatbot' },
  ];

  const handleScreenSelect = (screen) => {
    setShowMenu(false);
    if (screen.route !== currentScreen) {
      navigation.navigate(screen.route);
    }
  };

  const getCurrentScreenInfo = () => {
    return screens.find(screen => screen.route === currentScreen) || screens[0];
  };

  const currentScreenInfo = getCurrentScreenInfo();

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.navigationBar}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setShowMenu(true)}
          >
            <Text style={styles.navIcon}>☰</Text>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.screenIcon}>{currentScreenInfo.icon}</Text>
            <Text style={styles.screenTitle}>{currentScreenInfo.title}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Side Drawer */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity 
            style={styles.drawerBackdrop}
            onPress={() => setShowMenu(false)}
            activeOpacity={1}
          />
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>SB</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>Sophia Bennett</Text>
                  <Text style={styles.userEmail}>sophia.bennett@email.com</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMenu(false)}
              >
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.drawerItems}>
              {screens.map((screen, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.drawerItem,
                    currentScreen === screen.route && styles.drawerItemActive
                  ]}
                  onPress={() => handleScreenSelect(screen)}
                >
                  <View style={styles.drawerItemContent}>
                    <Text style={styles.drawerItemIcon}>{screen.icon}</Text>
                    <Text style={[
                      styles.drawerItemText,
                      currentScreen === screen.route && styles.drawerItemTextActive
                    ]}>
                      {screen.title}
                    </Text>
                  </View>
                  {currentScreen === screen.route && (
                    <View style={styles.activeIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.drawerFooter}>
              <TouchableOpacity style={styles.logoutButton}>
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  screenIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  screenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  // Side Drawer Styles
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    width: Dimensions.get('window').width * 0.8,
    maxWidth: 320,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#BF8EEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeIcon: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '300',
  },
  drawerItems: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 12,
  },
  drawerItemActive: {
    backgroundColor: '#F0E6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#BF8EEB',
  },
  drawerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  drawerItemIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  drawerItemTextActive: {
    color: '#BF8EEB',
    fontWeight: '600',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BF8EEB',
    marginRight: 10,
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
  },
  logoutIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
});

export default TopNavigation;
