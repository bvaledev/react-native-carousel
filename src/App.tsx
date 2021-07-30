import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FlatList, StyleSheet, Image, View, Dimensions, Animated, useWindowDimensions} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');
const SPACING = 10;
const ITEM_SIZE = width * 0.72;
const EMPTY_ITEM_SIZE = (width - ITEM_SIZE) / 2;
const BACKDROP_HEIGHT = height;

type BackdropProps = {
  images: string[],
  scrollX: Animated.Value
}

function Backdrop({images, scrollX}: BackdropProps){
  return <View style={{ height: BACKDROP_HEIGHT, width, position: 'absolute' }} renderToHardwareTextureAndroid>
        <FlatList
          data={images.filter((item) => item !== 'empty_item')}
          keyExtractor={(item) => item.toString()}
          removeClippedSubviews={false}
          renderToHardwareTextureAndroid
          contentContainerStyle={{width, height: BACKDROP_HEIGHT}}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * ITEM_SIZE,
              index * ITEM_SIZE,
              (index + 1) * ITEM_SIZE
            ];
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0,1,0]
            })

            return (
                <Animated.Image
                  source={{ uri: item }}
                  blurRadius={1}
                  style={{
                    width: width,
                    height: BACKDROP_HEIGHT,
                    resizeMode: 'cover',
                    position: 'absolute',
                    opacity: opacity,
                  }}
                />
            );
          }}
        />
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', 'white']}
          style={{
            height: BACKDROP_HEIGHT,
            width,
            position: 'absolute',
            bottom: 0,
          }}
        />
      </View>
}

export default function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [images, setImages] = useState([])
  React.useEffect(() => {
    const fetchData = async () => {
      // Add empty items to create fake space
      // [empty_item, ...movies, empty_item]
      setImages([
        'empty_item',
        'https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt45d6c2043ff36e28/5e21837f146ca8115b2d3332/Champion-List.jpg',
        'https://img.olhardigital.com.br/wp-content/uploads/2021/04/lol-984x450.png',
        'https://s2.glbimg.com/mFMzkdV2xXUG9hrL5TrvCrMdg5Q=/0x0:1920x1080/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2019/7/O/cV7eaVQ4ecAXUSApJ2cQ/league-of-legends.jpg',
        'https://tecnoblog.net/wp-content/uploads/2021/04/reembolso-wild-rift-700x394.jpg',
        'empty_item',
      ]);
    };

    if (images.length === 0) {
      fetchData();
    }
  }, [images]);


  return (
    <View style={styles.container}>
      <Backdrop images={images} scrollX={scrollX} />
      <StatusBar hidden />
      <Animated.FlatList
        showsHorizontalScrollIndicator={false}
        data={images}
        keyExtractor={(item) => item.toString()}
        horizontal
        bounces={false}
        decelerationRate={0.1}
        contentContainerStyle={{ alignItems: 'center' }}
        snapToInterval={ITEM_SIZE}
        snapToAlignment='start'
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          if (item === 'empty_item') {
            return <View style={{ width: EMPTY_ITEM_SIZE }} />;
          }

          const inputRange = [
            (index - 2) * ITEM_SIZE,
            (index - 1) * ITEM_SIZE,
            index * ITEM_SIZE,
          ];

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [0, -50, 0],
          });

          return (
            <View style={{ width: ITEM_SIZE }}>
              <Animated.View
                style={{
                  marginHorizontal: SPACING,
                  padding: SPACING * 2,
                  alignItems: 'center',
                  transform: [{ translateY }],
                  // backgroundColor: 'white',
                  borderRadius: 16,
                }}
              >
                <Image
                  source={{ uri: item}}
                  style={styles.posterImage}
                />
              </Animated.View>
            </View>
          );
        }}
      />

      <View style={styles.indicatorContainer}>
          {images.map((image, imageIndex) => {
            const cindex = imageIndex - 1;
            if (image === 'empty_item') {
              return <View key={imageIndex} style={[{ backgroundColor: 'transparent' }]} />;
            }
            const increaseWidth = scrollX.interpolate({
              inputRange: [
                ITEM_SIZE * (cindex - 1),
                ITEM_SIZE * cindex,
                ITEM_SIZE * (cindex + 1)
              ],
              outputRange: [1, 2, 1],
              extrapolate: "clamp"
            });
            return (
              <Animated.View
                key={imageIndex}
                style={[styles.normalDot, {transform: [{scaleX: increaseWidth}]}]}
              />
            );
          })}
        </View>
    </View> 
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  posterImage: {
    width: '100%',
    height: ITEM_SIZE * 1.2,
    resizeMode: 'cover',
    borderRadius: 24,
    margin: 0,
    marginBottom: 10,
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  normalDot: {
    height: 8,
    width: 8,
    borderRadius: 1,
    backgroundColor: "silver",
    marginHorizontal: 4,
    transform: [{scaleX: 1}]
  },
});