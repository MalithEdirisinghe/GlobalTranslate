import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import TranslateScreen from './screens/TranslateScreen';
import HistoryScreen from './screens/HistoryScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatScreen from './screens/ChatScreen';
import GameScreen from './screens/GameScreen';
import UpdateProfileScreen from './screens/UpdateProfileScreen';
import { FontAwesome, Entypo, Ionicons } from '@expo/vector-icons';
import { auth, db } from './screens/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabNavigator = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          let IconComponent;

          if (route.name === 'Home') {
            iconName = 'home';
            IconComponent = FontAwesome;
          } else if (route.name === 'Translate') {
            iconName = 'language';
            IconComponent = FontAwesome;
          } else if (route.name === 'ChatList') {
            iconName = 'chat';
            IconComponent = Entypo;
          } else if (route.name === 'Game') {
            iconName = 'game-controller';
            IconComponent = Ionicons;
          } else if (route.name === 'Update') {
            iconName = 'person-sharp';
            IconComponent = Ionicons;
          }
          return <IconComponent name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDarkMode ? '#47B6E5' : '#47B6E5',
        tabBarInactiveTintColor: isDarkMode ? 'gray' : 'black',
        tabBarStyle: { backgroundColor: isDarkMode ? 'black' : 'white' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen
        name="Translate"
        component={TranslateScreen}
        options={{
          title: 'Translate',
          headerTitleAlign: 'center',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#47B6E5' }
        }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          title: 'Chat',
          headerTitleAlign: 'center',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#47B6E5' }
        }}
      />
      <Tab.Screen
        name="Game"
        component={GameScreen}
        options={{
          title: 'Game',
          headerTitleAlign: 'center',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#47B6E5' }
        }}
      />
      <Tab.Screen
        name="Update"
        component={UpdateProfileScreen}
        options={{
          title: 'Profile',
          headerTitleAlign: 'center',
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: '#47B6E5' }
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  useEffect(() => {
    const updateOnlineStatus = async (isOnline) => {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          online: isOnline,
          lastSeen: serverTimestamp(),
        });
      }
    };

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        updateOnlineStatus(true);
      } else {
        updateOnlineStatus(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    updateOnlineStatus(true); // Set online when the app is first loaded

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{
            title: 'Translate History',
            headerTitleAlign: 'center',
            headerTintColor: '#fff',
            headerStyle: { backgroundColor: '#47B6E5' }
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Homes"
          component={HomeTabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
