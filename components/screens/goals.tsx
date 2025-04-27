import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { BACKEND_URL } from '@/Backendurl';
import { AsyncLocalStorage } from 'async_hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Stake {
  id: string;
  amount: number;
  Hours: string;
  startdate: string;
  Badges: string[];
  currentday: number;
  WithdrawAmount: number;
  Updateddate: string;
  Userid: string;
  misseday: number;
  Status: string;
}

export default function StakeStatus() {
  const [stake, setStake] = useState<Stake | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const stake=async()=>{
        setLoading(true);
        const userid=await AsyncStorage.getItem("userid")
        const stake=await axios.get(`${BACKEND_URL}/getstake/${userid}`)
        setStake(stake.data.stake[0]); 
    }
    const sampleStake = {
      id: "1696d9dd-0b89-4e05-87d0-044c71cb82c1",
      amount: 1,
      Hours: "8",
      startdate: "2025-04-27",
      Badges: [],
      currentday: 0,
      WithdrawAmount: 1,
      Updateddate: "2025-04-27",
      Userid: "b6f60f6f-59b5-4e9d-a37b-151862694bb4",
      misseday: 0,
      Status: "CurrentlyRunning",
    };
stake();
    // setStake(sampleStake);
    setLoading(false);
  }, []); 
  

  const calculateDaysSinceStart = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#1a0033', '#4b0082', '#290d44']}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <View style={[styles.loadingPlaceholder, { width: 192, height: 48, marginBottom: 16 }]} />
          <View style={[styles.loadingPlaceholder, { width: 320, height: 256 }]} />
        </View>
      </LinearGradient>
    );
  }

  if (!stake) {
    return (
      <LinearGradient
        colors={['#1a0033', '#4b0082', '#290d44']}
        style={styles.container}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>No Active Stake</Text>
            <Text style={styles.cardDescription}>You don't have any active stakes</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const daysSinceStart = calculateDaysSinceStart(stake.startdate);

  return (
    <LinearGradient
      colors={['#1a0033', '#4b0082', '#290d44']}
      style={styles.container}
    >
      <Text style={styles.title}>Your Sleep Challenge</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.statusIndicator}>
            <View style={styles.pingDot} />
            <Text style={styles.activeText}>Active</Text>
          </View>
          <Text style={styles.cardTitle}>Sleep Goal Challenge</Text>
          <Text style={styles.cardDescription}>
            Started on {new Date(stake.startdate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={[styles.badge, styles.activeBadge]}>
              <Text style={styles.badgeText}>{stake.Status}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Sleep Goal</Text>
            <Text style={styles.value}>{stake.Hours} hours</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Stake Amount</Text>
            <Text style={styles.value}>{stake.amount} SOL</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Current Day</Text>
            <Text style={styles.value}>{stake.currentday}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Missed Days</Text>
            <Text style={styles.value}>{stake.misseday}</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.row}>
              <Text style={styles.label}>Progress</Text>
              <Text style={styles.progressText}>{stake.currentday} days completed</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${stake.currentday * 10}%` }
                ]} 
              />
            </View>
          </View>

          {stake.Badges && stake.Badges.length > 0 ? (
            <View>
              <Text style={styles.label}>Badges Earned</Text>
              <View style={styles.badgesContainer}>
                {stake.Badges.map((badge, index) => (
                  <View key={index} style={[styles.badge, styles.purpleBadge]}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.label}>Badges Earned</Text>
              <Text style={styles.noBadgesText}>No badges earned yet</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            Last updated: {new Date(stake.Updateddate).toLocaleDateString()}
          </Text>
          <Text style={styles.footerText}>
            Potential withdrawal: {stake.WithdrawAmount} SOL
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingPlaceholder: {
    backgroundColor: 'rgba(128, 0, 128, 0.3)',
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 32,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(26, 0, 51, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#783887',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  cardContent: {
    padding: 16,
    gap: 16,
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(120, 56, 135, 0.5)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  value: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(74, 222, 128, 0.75)',
    marginRight: 8,
  },
  activeText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  activeBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.5)',
  },
  purpleBadge: {
    backgroundColor: '#783887',
  },
  progressContainer: {
    gap: 8,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#290d44',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7FD4F5',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  noBadgesText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#D1D5DB',
    marginBottom: 4,
  },
});