import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import helper from '../../helper.json';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);  // Hava durumu verisini saklamak için

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Konum izni verilmedi.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      console.log("Konum Verisi:", loc.coords);  // Konum verisini logla
      setLocation(loc.coords);
    })();
  }, []);

  useEffect(() => {
    if (location) {
      let apiEndpoint = helper.weatherApiUrl;
      apiEndpoint = apiEndpoint
        .replace('${latitude}', location.latitude.toString())
        .replace('${longitude}', location.longitude.toString())
        .replace('${apiKey}', helper.apiKey);


      (async () => {
        try {
          console.log(apiEndpoint);
          const response = await fetch(apiEndpoint);
          const data = await response.json();
          const weatherMapList = helper.weathers;
          weatherMapList.forEach(wt => {
            if(data.list[0].weather[0].description == wt.responseField.toString())
            {
              data!.list[0].weather[0].description = wt.fieldTranslate;
            }
          });
          setWeatherData(data);  // Weather data'yı güncelle
        } catch (error) {
          console.error("API Hatası:", error);  // Hata durumunu logla
        }
      })();
    }
  }, [location]);

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : location ? (
        <>
          {weatherData && weatherData.list && weatherData.list.length > 0 ? (
            <Text style={styles.text}>Hava Durumu: {weatherData.list[0].weather[0].description}</Text>
          ) : (
            <Text style={styles.text}>Hava durumu verisi alınamıyor...</Text>
          )}
        </>
      ) : (
        <Text>Konum alınıyor...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});
