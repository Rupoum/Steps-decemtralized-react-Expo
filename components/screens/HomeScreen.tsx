// import React, { useState } from 'react';
// import {
//   SafeAreaView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   View,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   Dimensions,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// const StarIcon = () => (
//   <View style={styles.starIcon}>
//     <Text style={{ color: '#5CDBDB', fontSize: 20 }}>★</Text>
//   </View>
// );

// const BellIcon = () => (
//   <View style={styles.bellIcon}>
//     <Text style={{ color: '#5CDBDB', fontSize: 20 }}>🔔</Text>
//   </View>
// );

// const NavIcon = ({ active, icon}:any) => (
//   <View style={[styles.navIcon, active && styles.activeNavIcon]}>
//     <Text style={{ color: active ? '#5CDBDB' : '#888', fontSize: 20 }}>{icon}</Text>
//   </View>
// );

// const  GameCard = ({ game, days, entry, dailySteps, players, buttonText, icon }:any) => (
//   <View style={styles.gameCard}>
//     <View style={styles.gameHeader}>
//       <View style={styles.gameIconContainer}>
//         <Image
//           source={{ uri: icon || 'https://via.placeholder.com/50' }}
//           style={styles.gameIcon}
//         />
//       </View>
//       <View style={styles.gameInfo}>
//         <Text style={styles.gameName}>{game}</Text>
//       </View>
//       <TouchableOpacity style={styles.joinButton}>
//         <Text style={styles.joinButtonText}>{buttonText}</Text>
//       </TouchableOpacity>
//     </View>
    
//     <View style={styles.gameStats}>
//       <View style={styles.statItem}>
//         <Text style={styles.statLabel}>Entry</Text>
//         <View style={styles.statValue}>
//           {entry.includes('M') ? (
//             <Text style={[styles.statValueText, { color: '#FFD700' }]}>🔥 {entry}</Text>
//           ) : (
//             <Text style={styles.statValueText}>≡ {entry}</Text>
//           )}
//         </View>
//       </View>
      
//       <View style={styles.statItem}>
//         <Text style={styles.statLabel}>{days} days</Text>
//         <Text style={styles.statValueText}>{days === '7' ? '18/03 - 24/03' : '15/03 - 24/03'}</Text>
//       </View>
      
//       <View style={styles.statItem}>
//         <Text style={styles.statLabel}>Daily Steps</Text>
//         <Text style={styles.statValueText}>{dailySteps}</Text>
//       </View>
      
//       <View style={styles.statItem}>
//         <Text style={styles.statLabel}>Players</Text>
//         <Text style={styles.statValueText}>{players}</Text>
//       </View>
//     </View>
//   </View>
// );

// const CategoryCard = ({ name, color, icon }:any) => (
//   <View style={[styles.categoryCard, { backgroundColor: color }]}>
//     {icon && (
//       <View style={styles.categoryIcon}>
//         <Text style={{ fontSize: 24 }}>{icon}</Text>
//       </View>
//     )}
//     <Text style={styles.categoryName}>{name}</Text>
//   </View>
// );

// const SectionHeader = ({ title, showAll = false }:any) => (
//   <View style={styles.sectionHeader}>
//     <Text style={styles.sectionTitle}>{title}</Text>
//     {showAll && (
//       <TouchableOpacity>
//         <Text style={styles.seeAllText}>All ›</Text>
//       </TouchableOpacity>
//     )}
//   </View>
// );

// export default function App() {
//   const [activeTab, setActiveTab] = useState(2);
  
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />
//       <ScrollView style={styles.scrollView}>
//         {/* Header with Score */}
//         <View style={styles.header}>
//           <View style={styles.scoreContainer}>
//             <StarIcon />
//             <Text style={styles.scoreText}>10</Text>
//           </View>
//           <BellIcon />
//         </View>
        
//         {/* Main Card with Moon */}
//         <View style={styles.mainCard}>
//           <LinearGradient
//             colors={['#1E2A3A', '#121920']}
//             style={styles.moonContainer}
//           >
//             <Text style={styles.syncText}>
//               Open GoogleFit App to Sync
//             </Text>
//             <Text style={styles.waitText}>
//               (Then wait a few minutes)
//             </Text>
//             <View style={styles.moonImageContainer}>
//               <View style={styles.moon} />
//               <View style={styles.cloud1} />
//               <View style={styles.cloud2} />
//               <View style={styles.cloud3} />
//             </View>
            
//             <View style={styles.stepsContainer}>
//               <View style={styles.stepsCircle} />
//               <Text style={styles.stepsText}>/ 5.0k steps</Text>
//             </View>
            
//             <View style={styles.paginationDots}>
//               <View style={[styles.dot, styles.activeDot]} />
//               <View style={styles.dot} />
//             </View>
//           </LinearGradient>
//         </View>
        
//         {/* Joined Games Section */}
//         <SectionHeader title="Joined Games" showAll={true} />
        
//         <GameCard
//           game="Moonwalk Dolphin Stride"
//           days="7"
//           entry="1"
//           dailySteps="10k"
//           players="69"
//           buttonText="Soon"
//           icon="https://via.placeholder.com/50/5CDBDB/FFFFFF?text=🐬"
//         />
        
//         {/* Official Games Section */}
//         <SectionHeader title="Official Games" showAll={true} />
        
//         <GameCard
//           game="BONK Shrimp Stride"
//           days="7"
//           entry="1M"
//           dailySteps="10k"
//           players="89"
//           buttonText="Join"
//           icon="https://via.placeholder.com/50/FFD700/FFFFFF?text=🦐"
//         />
        
//         {/* Community Games Section */}
//         <SectionHeader title="Community Games" showAll={true} />
        
//         <GameCard
//           game="Mission Slimpossible 6 🎯"
//           days="10"
//           entry="0.02"
//           dailySteps="8k"
//           players="256"
//           buttonText="Join"
//           icon="https://via.placeholder.com/50/5CDBDB/FFFFFF?text=🏃"
//         />
        
//         {/* Categories Section */}
//         <SectionHeader title="Categories" />
        
//         <View style={styles.categoriesGrid}>
//           <CategoryCard name="USDC" color="#4A7CFF" icon="💲" />
//           <CategoryCard name="Type" color="#222" />
//           <CategoryCard name="SOL" color="#9D4EDD" icon="≡" />
//           <CategoryCard name="BONK" color="#FF8C42" icon="🦐" />
//         </View>
        
//         {/* Games Section */}
//         <View style={styles.gamesSection}>
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Games</Text>
//             <TouchableOpacity>
//               <Text style={styles.seeAllText}>History ›</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.gameButtons}>
//             <TouchableOpacity style={styles.newGameButton}>
//               <Text style={styles.newGameButtonIcon}>+</Text>
//               <Text style={styles.newGameButtonText}>New Game</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity style={styles.gameCodeButton}>
//               <Text style={styles.gameCodeButtonIcon}>🔍</Text>
//               <Text style={styles.gameCodeButtonText}>Game Code</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
        
//         {/* Bottom spacing */}
//         <View style={{ height: 80 }} />
//       </ScrollView>
      
//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity onPress={() => setActiveTab(0)}>
//           <NavIcon active={activeTab === 0} icon="📊" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => setActiveTab(1)}>
//           <NavIcon active={activeTab === 1} icon="🏆" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => setActiveTab(2)}>
//           <NavIcon active={activeTab === 2} icon="🔄" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => setActiveTab(3)}>
//           <NavIcon active={activeTab === 3} icon="📦" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => setActiveTab(4)}>
//           <NavIcon active={activeTab === 4} icon="💬" />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const { width } = Dimensions.get('window');
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#121920',
//   },
//   statusBarMock: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 15,
//     paddingVertical: 5,
//   },
//   timeText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   statusIcons: {
//     flexDirection: 'row',
//     gap: 5,
//   },
//   statusIconText: {
//     color: 'white',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//   },
//   scoreContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   starIcon: {
//     width: 30,
//     height: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scoreText: {
//     color: 'white',
//     fontSize: 32,
//     fontWeight: 'bold',
//   },
//   bellIcon: {
//     width: 30,
//     height: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   mainCard: {
//     margin: 15,
//     borderRadius: 20,
//     overflow: 'hidden',
//     backgroundColor: '#5CDBDB',
//     padding: 2,
//   },
//   moonContainer: {
//     borderRadius: 18,
//     padding: 20,
//     height: 350,
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   syncText: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   waitText: {
//     color: 'white',
//     fontSize: 16,
//     opacity: 0.7,
//     textAlign: 'center',
//   },
//   moonImageContainer: {
//     position: 'relative',
//     width: '100%',
//     height: 200,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   moon: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#888',
//     opacity: 0.5,
//   },
//   cloud1: {
//     position: 'absolute',
//     width: 80,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#555',
//     bottom: 20,
//     left: 40,
//   },
//   cloud2: {
//     position: 'absolute',
//     width: 100,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#555',
//     bottom: 0,
//     right: 30,
//   },
//   cloud3: {
//     position: 'absolute',
//     width: 60,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: '#555',
//     top: 40,
//     left: 60,
//   },
//   stepsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   stepsCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 3,
//     borderColor: 'white',
//   },
//   stepsText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   paginationDots: {
//     flexDirection: 'row',
//     gap: 5,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#555',
//   },
//   activeDot: {
//     backgroundColor: '#5CDBDB',
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   sectionTitle: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   seeAllText: {
//     color: '#5CDBDB',
//     fontSize: 16,
//   },
//   gameCard: {
//     backgroundColor: '#1E2A3A',
//     borderRadius: 15,
//     marginHorizontal: 15,
//     marginBottom: 20,
//     overflow: 'hidden',
//   },
//   gameHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//   },
//   gameIconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     overflow: 'hidden',
//     marginRight: 10,
//   },
//   gameIcon: {
//     width: 50,
//     height: 50,
//   },
//   gameInfo: {
//     flex: 1,
//   },
//   gameName: {
//     color: '#5CDBDB',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   joinButton: {
//     backgroundColor: '#5CDBDB',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 20,
//   },
//   joinButtonText: {
//     color: '#121920',
//     fontWeight: 'bold',
//   },
//   gameStats: {
//     flexDirection: 'row',
//     borderTopWidth: 1,
//     borderTopColor: '#333',
//     paddingVertical: 15,
//   },
//   statItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   statLabel: {
//     color: '#888',
//     fontSize: 12,
//     marginBottom: 5,
//   },
//   statValue: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statValueText: {
//     color: 'white',
//     fontSize: 14,
//   },
//   categoriesGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     padding: 10,
//     justifyContent: 'space-between',
//   },
//   categoryCard: {
//     width: (width - 40) / 2,
//     height: 100,
//     borderRadius: 15,
//     margin: 5,
//     padding: 15,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   categoryIcon: {
//     marginBottom: 10,
//   },
//   categoryName: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   gamesSection: {
//     marginTop: 10,
//   },
//   gameButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 15,
//     marginTop: 10,
//   },
//   newGameButton: {
//     backgroundColor: '#5CDBDB',
//     borderRadius: 25,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '48%',
//     justifyContent: 'center',
//   },
//   newGameButtonIcon: {
//     color: '#121920',
//     fontSize: 18,
//     marginRight: 5,
//   },
//   newGameButtonText: {
//     color: '#121920',
//     fontWeight: 'bold',
//   },
//   gameCodeButton: {
//     backgroundColor: '#333',
//     borderRadius: 25,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '48%',
//     justifyContent: 'center',
//   },
//   gameCodeButtonIcon: {
//     color: 'white',
//     fontSize: 18,
//     marginRight: 5,
//   },
//   gameCodeButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   bottomNav: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     backgroundColor: '#1E2A3A',
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#333',
//   },
//   navIcon: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   activeNavIcon: {
//     backgroundColor: '#5CDBDB',
//     borderRadius: 20,
//   },
// });