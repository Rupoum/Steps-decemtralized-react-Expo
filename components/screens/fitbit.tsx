import axios from "axios";
import { Buffer } from 'buffer';
import * as WebBrowser from 'expo-web-browser'; // For React Native
import { Button, TouchableOpacity } from "react-native";
import React from "react";
import dotenv from "dotenv"
dotenv.config();
// For React web: use window.location redirects

// Types for TypeScript
type FitbitTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  user_id: string;
};

export const useFitbitAuth = () => {
  // Generate random string for PKCE verifier
  const generateRandomString = (length: number) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const crypto = window.crypto || (window as any).msCrypto;
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  };

  // Generate PKCE code verifier
  const generateCodeVerifier = () => {
    return generateRandomString(43); // Between 43-128 characters
  };

  // Generate PKCE code challenge from verifier
  const generateCodeChallenge = async (verifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return Buffer.from(digest)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // Step 1: Initiate authorization flow
  const initiateAuth = async () => {
    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(16);

      // Store verifier and state securely
      localStorage.setItem('fitbit_code_verifier', codeVerifier);
      localStorage.setItem('fitbit_auth_state', state);

      // Construct authorization URL
      const authUrl = new URL('https://www.fitbit.com/oauth2/authorize');
      const params = {
        client_id: process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID!,
        response_type: 'code',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        scope: 'activity heartrate profile sleep', // Requested scopes
        redirect_uri: process.env.NEXT_PUBLIC_FITBIT_REDIRECT_URI!,
        state: state,
      };

      // For React Native:
      await WebBrowser.openAuthSessionAsync(
        `${authUrl.toString()}?${new URLSearchParams(params).toString()}`,
        process.env.NEXT_PUBLIC_FITBIT_REDIRECT_URI!
      );

      // For React web:
      // window.location.href = `${authUrl.toString()}?${new URLSearchParams(params).toString()}`;

    } catch (error) {
      console.error('Error initiating Fitbit auth:', error);
      throw error;
    }
  };

  // Step 2: Exchange authorization code for tokens
  const exchangeCodeForTokens = async (code: string, state: string): Promise<FitbitTokens> => {
    try {
      // Verify state matches
      const savedState = localStorage.getItem('fitbit_auth_state');
      if (state !== savedState) {
        throw new Error('State mismatch - possible CSRF attack');
      }

      const codeVerifier = localStorage.getItem('fitbit_code_verifier');
      if (!codeVerifier) {
        throw new Error('No code verifier found');
      }

      const response = await axios.post<FitbitTokens>(
        'https://api.fitbit.com/oauth2/token',
        new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID!,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.NEXT_PUBLIC_FITBIT_REDIRECT_URI!,
          code_verifier: codeVerifier,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(
              `${process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID}:${process.env.NEXT_PUBLIC_FITBIT_CLIENT_SECRET}`
            ).toString('base64')}`,
          },
        }
      );

      // Clean up
      localStorage.removeItem('fitbit_code_verifier');
      localStorage.removeItem('fitbit_auth_state');

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  };

  // Step 3: Refresh access token when expired
  const refreshTokens = async (refreshToken: string): Promise<FitbitTokens> => {
    try {
      const response = await axios.post<FitbitTokens>(
        'https://api.fitbit.com/oauth2/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(
              `${process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID}:${process.env.NEXT_PUBLIC_FITBIT_CLIENT_SECRET}`
            ).toString('base64')}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      throw error;
    }
  };

  // Step 4: Make authenticated API calls
  const fetchFitbitData = async (endpoint: string, accessToken: string) => {
    try {
      const response = await axios.get(`https://api.fitbit.com/1/user/-/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Fitbit data:', error);
      throw error;
    }
  };

  return {
    initiateAuth,
    exchangeCodeForTokens,
    refreshTokens,
    fetchFitbitData,
  };
};

// Example usage in a component:

export const FitbitButton = () => {
  const { initiateAuth } = useFitbitAuth();

  const handlePress = async () => {
    try {
      await initiateAuth();
      // After redirect, you'll need to handle the callback URL
      // to extract the code and state and call exchangeCodeForTokens
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
        OnClick
    </TouchableOpacity>
  );
};
