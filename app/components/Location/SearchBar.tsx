import { useState } from "react"
import Radar, { Map, Autocomplete } from "react-native-radar"
import { FlatList, TextInput, Text, TouchableOpacity, View, StyleSheet } from "react-native"

const CustomAutocomplete = ({ onSelection, placeholder }) => {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const searchPlaces = async (text) => {
    if (text.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const result = await Radar.autocomplete({
        query: text,
        country: "AR",
        layers: ["locality", "address", "place"],
        limit: 10,
        lang: "es",
      })
      setSuggestions(result.addresses)
      setShowSuggestions(true)
    } catch (error) {
      console.log("Search error:", error)
    }
  }

  const handleSelection = (address) => {
    setQuery(address.formattedAddress)
    setShowSuggestions(false)
    onSelection(address)
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={(text) => {
          setQuery(text)
          searchPlaces(text)
        }}
        placeholder={placeholder}
      />

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelection(item)}>
                <Text>{item.formattedAddress}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopWidth: 0,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1001,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
})

export default CustomAutocomplete
