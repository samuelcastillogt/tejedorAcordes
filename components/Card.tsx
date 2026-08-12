import { ImageBackground, StyleSheet, Text } from 'react-native'

export interface CardProps {
  text: string
  image?: string
  to?: string
  size?: 'small' | 'medium' | 'large'
}
const Card = (props: CardProps) => {
  return (
    <ImageBackground source={{ uri: props.image }} style={styles[props.size!]}>
      <Text style={styles.text}>{props.text}</Text>
    </ImageBackground>
  )
}

export default Card

const styles = StyleSheet.create({
    text:{
    fontSize: 25,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    paddingRight: 10,
  },
  large:{
    width: '100%',
    height: 200,
    margin: 5,
    borderRadius: 10,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 10,

  },
  medium:{
    width: 150,
    height: 150,
    margin: 5,
    borderRadius: 10, 
        alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  small:{
    width: '100%',
    height: 100,
    margin: 5,
    borderRadius: 10,
        alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },


})