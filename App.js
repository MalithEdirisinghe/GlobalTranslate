import React from 'react';
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

import { FontAwesome, Entypo } from '@expo/vector-icons';

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
    </Tab.Navigator>
  );
};

const App = () => {
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
          // options={{
          //   title: '',
          //   headerTitleAlign: 'center',
          //   headerTintColor: '#fff',
          //   headerStyle: { backgroundColor: '#47B6E5' }
          // }}
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
