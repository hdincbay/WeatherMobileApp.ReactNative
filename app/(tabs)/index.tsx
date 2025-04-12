import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import helper from '../../helper.json';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);  // Hava durumu verisini saklamak için
  function formatUnixTime(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000); // saniyeden milisaniyeye çevir
    const hours = date.getHours();
    const minutes = date.getMinutes();
  
    // Saat ve dakikayı iki basamaklı formatla döndür (örn: "09:05")
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return formattedTime;
  }
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
          data.list[0].dt = formatUnixTime(data.list[0].dt);
          weatherMapList.forEach(wt => {
            
            if(data.list[0].weather[0].description == wt.responseField.toString())
            {
              data!.list[0].weather[0].description = wt.fieldTranslate;
            }
          });
          setWeatherData(data);
        } catch (error) {
          console.error("API Hatasi:", error);
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
            <>
              <Text style={styles.text}>Konum: {weatherData.city.name}</Text>
              <Text style={styles.text}>Saat: {weatherData.list[0].dt}</Text>
              <Text style={styles.text}>Hava Durumu: {weatherData.list[0].weather[0].description}</Text>
            </>
          ) : (
            <Text style={styles.text}>Hava durumu verisi alınamıyor...</Text>
          )}
        </>
      ) : (
        <Text>Konum aliniyor...</Text>
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
