import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
  NativeModuleError,
} from '@react-native-google-signin/google-signin';

interface UserData {
  idToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
  };
}
interface GoogleSignInButtonProps {
  onSignInSuccess: (data: UserData) => void;
}
const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSignInSuccess }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const configureGoogleSignIn = async () => {
    await GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', 
      offlineAccess: true, 
      forceCodeForRefreshToken: true, 
    });
  };

  const handleSignIn = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Warning', 'This sign-in method is optimized for Android');
      return;
    }

    setIsSigningIn(true);
    try {
      await configureGoogleSignIn();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      const userInfo = await GoogleSignin.signIn();
      handleSignInSuccess(userInfo);
    } catch (error) {
      handleSignInError(error as NativeModuleError);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignInSuccess = (data: any) => {
    onSignInSuccess({
      idToken: data.idToken,
      user: {
        id: data.user.id,
        name: [data.user.givenName, data.user.familyName].filter(Boolean).join(' '),
        email: data.user.email,
        photo: data.user.photo,
      },
    });
  };

  const handleSignInError = (error: NativeModuleError) => {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        Alert.alert('Sign in cancelled');
        break;
      case statusCodes.IN_PROGRESS:
        Alert.alert('Sign in already in progress');
        break;
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        Alert.alert(
          'Google Play Services Required',
          'Please update Google Play Services'
        );
        break;
      default:
        Alert.alert('Error', error.message || 'Unknown error occurred');
        console.error('Google SignIn Error:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isSigningIn && styles.buttonDisabled]}
      onPress={handleSignIn}
      disabled={isSigningIn}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>
        {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    elevation: 3,
    minWidth: 200,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GoogleSignInButton;