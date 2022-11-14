import { StyleSheet, Text, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as SQLite from "expo-sqlite";

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000);

const key = '@MyApp:key';

const bmiDB = SQLite.openDatabase("bmiDB.db");

export default class App extends Component {
  state = {
    height: 0,
    weight: 0,
    storedValue: 0,
  };

  createTable() {
    useEffect(() => {
      bmiDB.transaction((tx) => {
        tx.executeSql(
        "create table if not exists bmi (id integer primary key not null, BMIDate real, bmiVal num, weight num, height num);"
        );
      });
    }, []);
  }

  openDataBase() {
    if (Platform.OS === "web") {
      return {
        transaction: () => {
          return {
            executeSql: () => {},
          };
        },
      };
    }
    return bmiDB;
  }

  Items() {
    const [items, setItems] = useState(null);
  
    useEffect(() => {
      bmiDB.transaction((tx) => {
        tx.executeSql(
          `select id, date(BMIDate) as BMIDate, bmiVal, weight, height from bmi order by BMIDate desc;`,
          (_, { rows: { _array } }) => setItems(_array)
        );
      });
    }, []);

    const heading = "BMI History";

    if (items === null || items.length === 0) {
    return null;
    }

    return (
      <View>
        <Text style={styles.history}>{heading}</Text>
        {items.map(({ id, BMIDate, bmiVal, weight, height }) => (
          <Text key={id} style={{ color: done ? "#fff" : "#000" }}>{BMIDate}: {bmiVal} {"("}W:{weight}, H:{height}{")"}</Text>
        ))}
      </View>
    );
  }

  constructor(props) {
    super(props);
    this.onLoad();
    this.openDataBase();
  }

  onLoad = async () => {
      const storedValue = await AsyncStorage.getItem(key);
      this.setState({ storedValue });
  }

  onSave = async () => {
      const { height } = this.state;

      await AsyncStorage.setItem(key, height.toString());
  }

  onChange = (height) => {
    this.setState({ height });
  }

  render() {
    const { height } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.toolbar}>BMI Calculator</Text>
          <ScrollView style={styles.view}>
            <TextInput style={styles.input}
            placeholder='Weight in Pounds'/>
            <TextInput style={styles.input}
            onChangeText={this.onChange}
            value={height}
            placeholder='Height in Inches'></TextInput>
            <TouchableOpacity onPress={() => {
                add(text);
                setText(null);
              }} style={styles.button}>
              <Text style={styles.buttontext}>Compute BMI</Text>
            </TouchableOpacity>
            <Text style={styles.BMIDisplay}></Text>
              <Text style={styles.history}></Text>
              <Text style={styles.historyText}></Text>
          </ScrollView>
      </SafeAreaView>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  view: {
    flex: 1,
    padding: 10,
  },
  toolbar: {
    backgroundColor: '#f4511e',
    color: '#fff',
    textAlign: 'center',
    padding: 25,
    fontSize: 28,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#ecf0f1',
    flex: 1,
    height: 40,
    marginBottom: 10,
    fontSize: 24,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#34495e',
    padding: 10,
    borderRadius: 3,
    marginBottom: 30,
  },
  buttontext: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
  BMIDisplay: {
    fontSize: 28,
    textAlign: 'center',
    paddingTop: 20,
  },
  history: {
    paddingTop: 140,
    fontSize: 24,
    marginBottom: 8,
  },
  historyText: {
    fontSize: 20,
    paddingLeft: 20,
  }
});
