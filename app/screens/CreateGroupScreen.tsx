import { observer } from "mobx-react-lite"
import { useState, useRef, useEffect } from "react"
import {
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Switch,
  Pressable,
  ActivityIndicator, // Added for loading state
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { Button, Text } from "@/components"
import { useSafeAreaInsetsStyle } from "../utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "@/utils/useAppTheme"
import { useAppToast } from "@/components/useToast"
import { spacing } from "@/theme"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { AppStackParamList } from "@/navigators/AppNavigator"
import { useQueryClient } from "@tanstack/react-query"
import { FontAwesome } from '@expo/vector-icons';
import { Activity } from "@/services/activities/Activities.types"
import { CreateGroupParams } from "@/services/groups/Groups.types"

import { useCreateGroup } from "@/hooks/Groups"
import { useActivities } from "@/hooks/Users" 
import { isLoading } from "expo-font"


type NavigationProp = NativeStackNavigationProp<AppStackParamList, "Main">

export const CreateGroupScreen = observer(function CreateGroupScreen() {
    const { themed, theme } = useAppTheme()
    const $topInsets = useSafeAreaInsetsStyle(["top"])
    const navigation = useNavigation<NavigationProp>()
    const { showToast } = useAppToast()
    const queryClient = useQueryClient()

    const { mutateAsync: createGroupAsync, isPending: isCreating } = useCreateGroup()

    const [activities, setActivities] = useState<Activity[]>([]);
    const [offset, setOffset] = useState(0);
    const limit = 25;
    const { data, isLoading: isLoadingActivities, isFetching: isFetchingActivities } = useActivities(limit, offset, "");

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [activityId, setActivityId] = useState<number | null>(null)
    const [isPublic, setIsPublic] = useState(false)

    const [isActivityModalVisible, setIsActivityModalVisible] = useState(false);
        

    const handleCreateGroup = async () => {
        if (!name.trim() || !activityId) {
            showToast("Error", "Group Name and Activity are required.");
            return;
        }

        const newGroup: CreateGroupParams = {
            name: name.trim(),
            description: description.trim() || null,
            location: location.trim() || null,
            activity_id: activityId,
            public: isPublic,
            user_ids: [], 
        };

        try {
            const createdGroup = await createGroupAsync(newGroup); 

            // Invalidate queries to refresh the list of groups
            await queryClient.invalidateQueries({ queryKey: ["groups"] }); 

            showToast("Success", `Group "${name}" created successfully!`);

            // Navigate to the info screen of the newly created group or back to main
            navigation.replace("Main", {
            screen: "GroupInfoScreen", 
            params: { groupId: createdGroup.id },
            });
        } catch (error) {
            console.error("Error creating group:", error);
            showToast("Error", "Failed to create the group. Please try again.");
        }
    }

    const handleSelectActivity = (activity: Activity) => {
        setActivityId(activity.id);
        setIsActivityModalVisible(false);
    }

    useEffect(() => {
        if (data?.length) {
            setActivities((prev) => {
            const ids = new Set(prev.map((a) => a.id));
            const newItems = data.filter((a) => !ids.has(a.id));
            return [...prev, ...newItems];
            });
        }
    }, [data]);


    const renderActivityItem = ({ item }: { item: Activity }) => (
        <TouchableOpacity 
            style={[styles.modalActivityItem, themed(themedStyles.modalActivityItem)]} 
            onPress={() => handleSelectActivity(item)}
        >
            <Text style={themed(themedStyles.activityIcon)}>{item.icon}</Text>
            <Text style={themed(themedStyles.activityName)}>{item.name}</Text>
            {item.id === activityId && (
            <FontAwesome name="check" size={20} color={theme.colors.tint} style={{ marginLeft: 'auto' }} />
            )}
        </TouchableOpacity>
    );

    const selectedActivity = activities?.find(a => a.id === activityId);

    return (
        <SafeAreaView
        style={[styles.container, themed(themedStyles.container)]}
        >
            <View style={[styles.header, themed(themedStyles.header), $topInsets]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 10 }}
                    >
                    <Text style={themed(themedStyles.backButtonText)}>←</Text>
                </TouchableOpacity>

                <Text style={themed(themedStyles.headerTitle)}>Create New Group</Text>

                <Pressable 
                    onPress={handleCreateGroup} 
                    disabled={isCreating || !name.trim() || !activityId}
                    >
                    <Text style={[themed(themedStyles.headerButton), (isCreating || !name.trim() || !activityId) && { opacity: 0.5 }]}>
                    {isCreating ? 'Creating...' : 'Create'}
                    </Text>
                </Pressable>
            </View>

            <FlatList
            data={[{ key: 'form' }]} 
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            renderItem={() => (
                <View style={styles.formContainer}>
                <Text style={[themed(themedStyles.groupIcon), {textAlign: 'center'}]}>
                {selectedActivity?.icon || "✨"}
                </Text>
                <Text style={themed(themedStyles.inputLabel)}>Group Name*</Text>
            <TextInput
            style={themed(themedStyles.textInput)}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Sunday Hiking Club"
            placeholderTextColor={theme.colors.textDim}
            maxLength={50}
            />

            <Text style={themed(themedStyles.inputLabel)}>Location*</Text>
            <TextInput
            style={themed(themedStyles.textInput)}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., Central Park, NYC"
            placeholderTextColor={theme.colors.textDim}
            maxLength={100}
            />

            <Text style={themed(themedStyles.inputLabel)}>Activity*</Text>
            <TouchableOpacity 
            style={themed(themedStyles.activitySelectButton)}
            onPress={() => setIsActivityModalVisible(true)}
            disabled={isLoadingActivities}
            >
            {isLoadingActivities ? (
            <ActivityIndicator size="small" color={theme.colors.tint} />
            ) : (
            <>
            <Text style={themed(themedStyles.activitySelectText)}>
                {selectedActivity ? `${selectedActivity.icon} ${selectedActivity.name}` : "Select an Activity..."}
            </Text>
            <FontAwesome name="chevron-right" size={14} color={theme.colors.textDim} />
            </>
            )}
            </TouchableOpacity>


            {/* Group Description Input */}
            <Text style={themed(themedStyles.inputLabel)}>Description</Text>
            <TextInput
                style={[themed(themedStyles.textInput), themed(themedStyles.descriptionInput)]}
                value={description}
                onChangeText={setDescription}
                placeholder="Tell others what your group is about..."
                placeholderTextColor={theme.colors.textDim}
                multiline
                textAlignVertical="top"
                maxLength={500}
            />

            <View style={styles.toggleContainer}>
                <View>
                    <Text style={themed(themedStyles.inputLabel)}>Group Privacy</Text>
                    <Text style={themed(themedStyles.toggleDescription)}>
                    {isPublic ? "Public (Anyone can find and join)" : "Private (Closed group)"}
                    </Text>
                </View>
                    <Switch
                    onValueChange={setIsPublic}
                    value={isPublic}
                    trackColor={{ false: theme.colors.border, true: theme.colors.tint }}
                    thumbColor={theme.colors.background}
                    />
                </View>
            </View>
            )}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={isActivityModalVisible}
                onRequestClose={() => setIsActivityModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, themed(themedStyles.modalView)]}>
                        <Text style={styles.modalTitle}>Select Group Activity</Text>

                        {isLoadingActivities ? (
                            <ActivityIndicator size="large" color={theme.colors.tint} style={{ marginVertical: spacing.xxl }} />
                            ) : (
                            <FlatList
                            data={activities}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderActivityItem}
                            onEndReached={() => setOffset((prev) => prev + limit)}
                            onEndReachedThreshold={0.5}
                            removeClippedSubviews={false} // avoids items being unmounted
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            ListFooterComponent={() =>
                                isFetchingActivities ? (
                                <ActivityIndicator size="small" color={theme.colors.tint} style={{ marginVertical: spacing.md }} />
                                ) : null
                            }
                            />
                        )}

                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton, { marginTop: spacing.md }]}
                            onPress={() => setIsActivityModalVisible(false)}
                            >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    )
})

// --- Styles (Combined and Simplified) ---

const styles = StyleSheet.create({
  // Reused styles from GroupInfoScreen
  container: { flex: 1 } as ViewStyle,
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    justifyContent: "space-between",
  } as ViewStyle,
  backButton: { paddingRight: spacing.md } as ViewStyle,
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as ViewStyle,
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  } as ViewStyle,
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  } as TextStyle,
  modalButton: {
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: '100%',
    alignItems: 'center',
  } as ViewStyle,
  cancelButton: {
    backgroundColor: '#ddd',
  } as ViewStyle,
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  } as TextStyle,
  
  // --- New Styles for Creation Screen ---
  formContent: {
      paddingBottom: spacing.xxl * 2,
  } as ViewStyle,
  formContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  } as ViewStyle,
  
  toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderBottomWidth: 1,
      borderTopWidth: 1,
      borderColor: '#e0e0e0',
  } as ViewStyle,
  toggleDescription: {
      fontSize: 12,
      color: '#666',
  } as TextStyle,
  
  modalActivityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      width: '100%',
  } as ViewStyle,
  activityList: {
      width: '100%',
  } as ViewStyle,

})

const themedStyles = {    
    container: (theme: any): ViewStyle => ({
        flex: 1,
        backgroundColor: theme.colors.background,
    }),    
    // Header
    header: (theme: any): ViewStyle => ({
        backgroundColor: theme.colors.background,
        borderBottomColor: theme.colors.border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    }),
    headerTitle: (theme: any): TextStyle => ({
        fontSize: 18,
        fontWeight: "600",
        color: theme.colors.text,
        textAlign: "center",
        flex: 1, 
    }),
    headerButton: (theme: any): TextStyle => ({
        fontSize: 16,
        color: theme.colors.tint,
        fontWeight: "600",
    }),
    backButtonText: (theme: any): TextStyle => ({
        fontSize: 24,
        color: theme.colors.tint,
        fontWeight: "600",
    }),

    // Form
    inputLabel: (theme: any): TextStyle => ({
        fontSize: 16,
        fontWeight: "600",
        marginBottom: spacing.xs,
        color: theme.colors.text,
        alignSelf: "flex-start",
        marginTop: spacing.md,
    }),
    textInput: (theme: any): TextStyle => ({
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: spacing.sm,
        padding: spacing.sm,
        fontSize: 16,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
    }),
    descriptionInput: (_theme: any): TextStyle => ({
        minHeight: 100,
        maxHeight: 150,
        textAlignVertical: "top",
    }),

    groupIcon: (_theme: any): TextStyle => ({
        fontSize: 60,         // bigger font size
        lineHeight: 72,       // slightly larger lineHeight
        height: 72,           // match lineHeight
        textAlignVertical: "center",
        textAlign: "center",
        marginBottom: spacing.sm,
    }),
    
    // Activity Select
    activitySelectButton: (theme: any): ViewStyle => ({
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: spacing.sm,
        padding: spacing.sm,
        backgroundColor: theme.colors.background,
    }),
    activitySelectText: (theme: any): TextStyle => ({
        fontSize: 16,
        color: theme.colors.text,
    }),
    
    // Activity Modal
    modalActivityItem: (theme: any): ViewStyle => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    }),
    activityIcon: (_theme: any): TextStyle => ({
        fontSize: 24,
        marginRight: spacing.sm,
    }),
    activityName: (theme: any): TextStyle => ({
        fontSize: 16,
        color: theme.colors.text,
    }),

    toggleDescription: (theme: any): TextStyle => ({
        fontSize: 12,
        color: theme.colors.textDim,
    }),

    modalView: (theme: any): ViewStyle => ({
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  }),
}