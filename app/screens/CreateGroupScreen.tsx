import { observer } from "mobx-react-lite"
import { useState, useRef, useEffect, useCallback } from "react" // Added useCallback
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
  ActivityIndicator, 
  Dimensions, // Added Dimensions for better layout control
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

type NavigationProp = NativeStackNavigationProp<AppStackParamList, "Main">

// Use Dimensions to calculate height for the inline list
const { height } = Dimensions.get('window');

// Define a separate list of form sections for the FlatList data
const formSections = [
    { key: 'icon' },
    { key: 'name' },
    { key: 'location' },
    { key: 'activity_title' },
    { key: 'activity_list' }, // New section for the inline activity picker
    { key: 'description' },
    { key: 'privacy' },
];


export const CreateGroupScreen = observer(function CreateGroupScreen() {
    const { themed, theme } = useAppTheme()
    const $topInsets = useSafeAreaInsetsStyle(["top"])
    const navigation = useNavigation<NavigationProp>()
    const { showToast } = useAppToast()
    const queryClient = useQueryClient()

    const { mutateAsync: createGroupAsync, isPending: isCreating } = useCreateGroup()

    const [activities, setActivities] = useState<Activity[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMoreActivities, setHasMoreActivities] = useState(true); // Track if more activities are available
    const limit = 25;
    const [query, setQuery] = useState(""); // Add query state for potential future search/filter

    const { data, isLoading: isLoadingActivities, isFetching: isFetchingActivities } = useActivities(limit, offset, query);

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    // 1. CHANGE: State holds a single ID or null
    const [activityId, setActivityId] = useState<number | null>(null)
    const [isPublic, setIsPublic] = useState(false)
        
    // REMOVED: isActivityModalVisible state

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

            await queryClient.invalidateQueries({ queryKey: ["groups"] }); 

            showToast("Success", `Group "${name}" created successfully!`);

            navigation.replace("Main", {
            screen: "GroupInfoScreen", 
            params: { groupId: createdGroup.id },
            });
        } catch (error) {
            console.error("Error creating group:", error);
            showToast("Error", "Failed to create the group. Please try again.");
        }
    }

    // 2. CHANGE: Select handler just sets the ID
    const handleSelectActivity = useCallback((activity: Activity) => {
        // Toggling behavior for selecting a single item
        setActivityId((prevId) => (prevId === activity.id ? null : activity.id));
    }, []);

    useEffect(() => {
        if (data) {
            setActivities((prev) => {
                const ids = new Set(prev.map((a) => a.id));
                const newItems = data.filter((a) => !ids.has(a.id));
                const updatedList = [...prev, ...newItems];

                // Remove duplicates in case of query reset or overlap (though should be handled by 'ids' Set)
                const uniqueList = Array.from(new Map(updatedList.map(item => [item.id, item])).values());
                
                return uniqueList;
            });
            // Update hasMore status
            setHasMoreActivities(data.length >= limit);
        }
    }, [data, limit]);

    // Handler to load more activities for the FlatList
    const handleLoadMoreActivities = () => {
        if (!isFetchingActivities && hasMoreActivities) {
            setOffset((prev) => prev + limit);
        }
    };

    // 3. CHANGE: Render item for single selection list (similar to the modal's render item)
    const renderActivityItem = ({ item }: { item: Activity }) => {
        const isSelected = item.id === activityId;
        return (
            <TouchableOpacity 
                style={[
                    styles.activityChip, 
                    themed(themedStyles.activityChip), 
                    isSelected && themed(themedStyles.activityChipSelected)
                ]} 
                onPress={() => handleSelectActivity(item)}
            >
                <Text style={themed(themedStyles.activityIcon)}>{item.icon}</Text>
                <Text 
                    style={[
                        themed(themedStyles.activityName), 
                        isSelected && themed(themedStyles.activityNameSelected)
                    ]}
                >
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };


    const selectedActivity = activities?.find(a => a.id === activityId);

    // 4. CHANGE: Modify FlatList to render form in sections
    const renderFormItem = ({ item }: { item: typeof formSections[number] }) => {
        switch (item.key) {
            case 'icon':
                return (
                    <Text style={[themed(themedStyles.groupIcon), {textAlign: 'center'}]}>
                        {selectedActivity?.icon || "✨"}
                    </Text>
                );
            case 'name':
                return (
                    <View style={styles.inputGroup}>
                        <Text style={themed(themedStyles.inputLabel)}>Group Name*</Text>
                        <TextInput
                            style={themed(themedStyles.textInput)}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g., Sunday Hiking Club"
                            placeholderTextColor={theme.colors.textDim}
                            maxLength={50}
                        />
                    </View>
                );
            case 'location':
                return (
                    <View style={styles.inputGroup}>
                        <Text style={themed(themedStyles.inputLabel)}>Location</Text>
                        <TextInput
                            style={themed(themedStyles.textInput)}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="e.g., Central Park, NYC (Optional)"
                            placeholderTextColor={theme.colors.textDim}
                            maxLength={100}
                        />
                    </View>
                );
            case 'activity_title':
                return (
                    <Text style={[themed(themedStyles.inputLabel), styles.activityTitle]}>Select Primary Activity*</Text>
                );
            case 'activity_list':
                return (
                    <View style={styles.activityListContainer}>
                        {isLoadingActivities && offset === 0 ? (
                            <ActivityIndicator size="large" color={theme.colors.tint} style={{ marginVertical: spacing.xxl }} />
                        ) : (
                            <FlatList
                                data={activities}
                                keyExtractor={(activity) => activity.id.toString()}
                                renderItem={renderActivityItem}
                                horizontal={false}
                                numColumns={3} // Display activities in a 3-column grid
                                contentContainerStyle={styles.activityListContent}
                                scrollEnabled={false} // Activities list is now inline, let the parent FlatList scroll
                                ListFooterComponent={() =>
                                    isFetchingActivities ? (
                                        <ActivityIndicator size="small" color={theme.colors.tint} style={{ marginVertical: spacing.md }} />
                                    ) : null
                                }
                                onEndReached={handleLoadMoreActivities}
                                onEndReachedThreshold={0.5}
                            />
                        )}
                    </View>
                );
            case 'description':
                return (
                    <View style={styles.inputGroup}>
                        <Text style={themed(themedStyles.inputLabel)}>Description</Text>
                        <TextInput
                            style={[themed(themedStyles.textInput), themed(themedStyles.descriptionInput)]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Tell others what your group is about... (Optional)"
                            placeholderTextColor={theme.colors.textDim}
                            multiline
                            textAlignVertical="top"
                            maxLength={500}
                        />
                    </View>
                );
            case 'privacy':
                return (
                    <View style={[styles.toggleContainer, themed(themedStyles.toggleContainer)]}>
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
                );
            default:
                return null;
        }
    };


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

            {/* 5. CHANGE: Main FlatList rendering the form sections */}
            <FlatList
                data={formSections} 
                keyExtractor={(item) => item.key}
                contentContainerStyle={styles.formContent}
                showsVerticalScrollIndicator={false}
                renderItem={renderFormItem}
            />
            
            {/* REMOVED: The Modal component is no longer needed */}

        </SafeAreaView>
    )
})

// --- Updated and Combined Styles ---

const styles = StyleSheet.create({
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
  
  formContent: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      paddingBottom: spacing.xxl * 2,
  } as ViewStyle,
  
  // New: style for grouping inputs
  inputGroup: {
      marginBottom: spacing.md,
  } as ViewStyle,

  activityTitle: {
      marginBottom: spacing.xs,
      marginTop: spacing.lg, // Extra space before the activity list
      borderTopWidth: 1,
      paddingTop: spacing.md,
      borderColor: '#e0e0e0',
  } as TextStyle,

  // New: Container for the inline activity FlatList
  activityListContainer: {
      minHeight: height * 0.2, // Ensure visibility even with few items
      paddingHorizontal: spacing.xs / 2, // Compensate for chip margin
  } as ViewStyle,

  // New: Content style for the activity list FlatList
  activityListContent: {
      paddingBottom: spacing.lg,
  } as ViewStyle,

  // New: Style for the selectable chips
  activityChip: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      margin: spacing.xs / 2,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: spacing.md,
      borderWidth: 1.5,
      minWidth: 80, // ensures chips are not too small
  } as ViewStyle,

  toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.lg,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderBottomWidth: 1,
      borderTopWidth: 1,
  } as ViewStyle,
  toggleDescription: {
      fontSize: 12,
  } as TextStyle,
  
  // NOTE: All modal-related styles (centeredView, modalView, modalTitle, etc.) were removed 
  // as the modal is no longer used.
})

const themedStyles = {    
    container: (theme: any): ViewStyle => ({
        flex: 1,
        backgroundColor: theme.colors.background,
    }),    
    header: (theme: any): ViewStyle => ({
        backgroundColor: theme.colors.background,
        borderBottomColor: theme.colors.border,
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
        fontSize: 60,         
        lineHeight: 72,       
        height: 72,           
        textAlignVertical: "center",
        textAlign: "center",
        marginBottom: spacing.md,
    }),
    
    // Activity Chips (New/Modified Styles for inline selection)
    activityChip: (theme: any): ViewStyle => ({
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
    }),
    activityChipSelected: (theme: any): ViewStyle => ({
        backgroundColor: theme.colors.tint,
        borderColor: theme.colors.tint,
    }),
    activityIcon: (_theme: any): TextStyle => ({
        fontSize: 26,
        marginBottom: spacing.xs,
    }),
    activityName: (theme: any): TextStyle => ({
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '500',
        textAlign: 'center',
    }),
    activityNameSelected: (theme: any): TextStyle => ({
        color: theme.colors.tintInverse, // assuming tintInverse is a good contrast color (e.g., white)
        fontWeight: '700',
    }),

    toggleDescription: (theme: any): TextStyle => ({
        fontSize: 12,
        color: theme.colors.textDim,
    }),

    toggleContainer: (theme: any): ViewStyle => ({
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    }),
}