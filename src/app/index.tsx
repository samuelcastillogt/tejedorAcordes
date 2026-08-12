import { StyleSheet, Text, View } from "react-native";
import Card from "../../components/Card";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tejedor</Text>
      <Card text="Card 1" 
            image="https://media.istockphoto.com/id/1694517974/es/foto/vista-en-primer-plano-de-partituras-con-notas-musicales.jpg?s=612x612&w=0&k=20&c=i2_QQmxaRtYP-7k2iAC9-VfVfMuQb9ecaqjen7w6JFw=" 
            to="/card1" 
            size="large"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text:{
    fontSize: 25
  }
});
