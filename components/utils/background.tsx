import React, { useMemo, useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

const AnimatedStarsBackground = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      return {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        opacity: new Animated.Value(Math.random()),
        speed: Math.random() * 2000 + 1000,
      };
    });
  }, []);

  useEffect(() => {
    stars.forEach((star) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: 0.2,
            duration: star.speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: 1,
            duration: star.speed,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });
  }, [stars]);

  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 10,
  },
});

export default AnimatedStarsBackground;