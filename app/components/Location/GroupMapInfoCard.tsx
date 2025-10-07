import { MapGroup } from '@/services/groups/Groups.types';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import Radar from "react-native-radar"
import { formatWeekTimeslots } from '@/utils/utils';

export const GroupMapInfoCard = ({ group }: { group: MapGroup }) => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [placeName, setPlaceName] = useState<string>("Cargando ubicación...");
    
    const locationParts = group.location.split(",");
    const latitude = parseFloat(locationParts[1]?.trim() || "0");
    const longitude = parseFloat(locationParts[0]?.trim() || "0");

    useEffect(() => {
        const fetchPlaceName = async () => {
            try {
                const result = await Radar.reverseGeocode({
                    location: { latitude: latitude, longitude: longitude },
                    layers: ["place", "locality"]
                });
                const address = result.addresses?.[0];
                let locationName = "Ubicación desconocida";
                if (address) {
                    if (address.borough && address.borough.trim() !== "") {
                        locationName = address.borough;
                    } else if (address.city && address.city.trim() !== "") {
                        locationName = address.city;
                    } else if (address.country && address.country.trim() !== "") {
                        locationName = address.country;
                    }
                }
                setPlaceName(locationName);
            } catch (error) {
                setPlaceName("Ubicación desconocida");
            }
        };

        if (latitude !== 0 && longitude !== 0) {
            fetchPlaceName();
        } else {
            setPlaceName("Ubicación desconocida");
        }
    }, [latitude, longitude]);

    return (
    <View style={{ 
      height: 150, 
      borderRadius: 12, 
      alignContent: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      width: '95%',
      alignSelf: 'center',
      position: "absolute",
      bottom: 0,
   }}>
      {group.avatarUrl ? (
        <ImageBackground
          source={{ uri: group.avatarUrl }}
          style={{ 
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.9,
          }}
          blurRadius={50}
        >
          <View style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
          }} />
        </ImageBackground>
      ) : (
        <View style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: '#1a1a1a',
        }} />
      )}

      {/* Content */}
      <View style={{ 
        flex: 1, 
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}>
        {/* Header Section */}
        <Text 
          style={{ 
            color: "white", 
            fontWeight: "bold", 
            fontSize: 18,
            marginBottom: 6,
            textShadowColor: 'rgba(0, 0, 0, 0.75)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
            textAlign: 'center',
            width: '100%',
          }}
          numberOfLines={1}
        >
          {group.name || "Grupo"}
        </Text>
        <Text 
            style={{ 
                color: "rgba(255, 255, 255, 0.9)", 
                fontSize: 13,
                textShadowColor: 'rgba(0, 0, 0, 0.75)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
                textAlign: 'center',
                width: '100%',
            }}
            numberOfLines={1}
        >
            📍 {placeName}
        </Text>            
        {typeof group.membersCount === "number" && (
            <Text 
                style={{ 
                    color: "rgba(255, 255, 255, 0.85)", 
                    fontSize: 12,
                    marginTop: 4,
                    textShadowColor: 'rgba(0, 0, 0, 0.75)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                    textAlign: 'center',
                    width: '100%',
                }}
            >
                👥 {group.membersCount} {group.membersCount === 1 ? 'Miembro' : 'Miembros'}
            </Text>
        )}
        <Text 
            style={{ 
                color: "rgba(255, 255, 255, 0.9)", 
                fontSize: 13,
                textShadowColor: 'rgba(0, 0, 0, 0.75)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
                textAlign: 'center',
                width: '100%',
                marginTop: 4,
            }}
            numberOfLines={1}
        >
            🗓️ Se juntan: {formatWeekTimeslots(group.week_timeslots || [])}
        </Text>   

        {/* Action Button */}
        <TouchableOpacity
          style={{
            alignSelf: 'center',
            marginTop: 12,
            paddingVertical: 8,
            paddingHorizontal: 20,
            backgroundColor: "rgba(139, 218, 102, 0.75)",
            borderRadius: 20,
            shadowColor: "#000000ff",
            elevation: 5,
        }}
          onPress={() => navigation.navigate("GroupScreen", { groupId: group.id })}
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>
            Ver grupo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
