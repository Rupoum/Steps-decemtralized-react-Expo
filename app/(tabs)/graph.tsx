import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_MARGIN = 10;

const HorizontalCardScroll = () => {
  const scrollViewRef = useRef(null);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  
  // Sample card data
  const cards = [
    { id: 1, title: 'Card 1', color: '#FF9999' },
    { id: 2, title: 'Card 2', color: '#99FF99' },
    { id: 3, title: 'Card 3', color: '#9999FF' },
    { id: 4, title: 'Card 4', color: '#FFFF99' },
    { id: 5, title: 'Card 5', color: '#FF99FF' },
  ];

  const handleScroll = (event:any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Check if we've reached the end (with a small buffer)
    const isEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - 20;
    
    if (isEnd && !isAtEnd) {
      setIsAtEnd(true);
      // setScrollEnabled(false);
    } else if (!isEnd && isAtEnd) {
      setIsAtEnd(false);
      setScrollEnabled(true);
    }
  };

  // const resetScroll = () => {
  //   scrollViewRef.current.scrollTo({ x: 0, animated: true });
  //   setIsAtEnd(false);
  //   setScrollEnabled(true);
  // };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.map((card) => (
          <View
            key={card.id}
            style={[styles.card, { backgroundColor: card.color }]}
          >
            <Text style={styles.cardTitle}>{card.title}</Text>
          </View>
        ))}
      </ScrollView>
      
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
  card: {
    width: CARD_WIDTH,
    height: 200,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  arrowContainer: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
  },
  arrow: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: 'white',
    fontSize: 24,
  },
  resetButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  resetText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HorizontalCardScroll;