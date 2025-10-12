import { observer } from "mobx-react-lite"
import { useState, useRef, useEffect, useCallback } from "react"
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
  Dimensions,
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { Button, Text, TextField } from "@/components" // Added TextField
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

const { width, height } = Dimensions.get("window")

export const CreateGroupScreen = observer(function CreateGroupScreen() {
    const { themed, theme } = useAppTheme()
    const $topInsets = useSafeAreaInsetsStyle(["top"])
    const navigation = useNavigation<NavigationProp>()
    const { showToast } = useAppToast()
    const queryClient = useQueryClient()

    const { mutateAsync: createGroupAsync, isPending: isCreating } = useCreateGroup()

    // --- State for Group Form ---
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [activityId, setActivityId] = useState<number | null>(null) // The ID saved to the form
    const [isPublic, setIsPublic] = useState(false)

    // --- State for Activity Modal/Selection ---
    const [showActivityModal, setShowActivityModal] = useState(false)
    const [tempSelectedActivityId, setTempSelectedActivityId] = useState<number | null>(null) // Temp selection in modal
    const [allActivities, setAllActivities] = useState<Activity[]>([])
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const limit = 10
    const [query, setQuery] = useState("")
    const prevQuery = useRef("")

    const { data: prefsData, isLoading: isLoadingActivities, isFetching: isFetchingActivities } = useActivities(limit, offset, query)

    // --- Activity Fetching Logic ---

    // Sync temp selection when modal opens
    useEffect(() => {
        if (showActivityModal) {
            setTempSelectedActivityId(activityId);
        }
    }, [showActivityModal, activityId])
    
    // Handle activity data and pagination
    useEffect(() => {
        if (query !== prevQuery.current) {
            prevQuery.current = query
            if (prefsData) {
                setAllActivities((_prev) => prefsData)
                setHasMore(prefsData.length >= limit)
                setOffset(prefsData.length)
            } else {
                setHasMore(false)
                setAllActivities([])
            }
            return
        }

        if (prefsData && prefsData.length > 0) {
            setAllActivities((prev) => {
                 // Simple deduplication for lists that combine results
                const newItems = prefsData.filter(
                    (p: Activity) => !prev.some((a) => a.id === p.id),
                )
                return [...prev, ...newItems]
            })
            if (prefsData.length < limit) setHasMore(false)
        } else if (prefsData && prefsData.length === 0 && offset > 0) {
            setHasMore(false)
        }
    }, [prefsData, query, limit, offset])

    const handleEndReached = useCallback(() => {
        if (!isFetchingActivities && hasMore) {
            setOffset((prev) => prev + limit)
        }
    }, [isFetchingActivities, hasMore, limit])

    // --- Single Selection Logic ---

    // Select/Deselect a single activity in the modal
    const toggleSingleActivity = useCallback((id: number) => {
        setTempSelectedActivityId((prev) => (prev === id ? null : id))
    }, [])

    // --- Button Handlers ---

    const handleSaveSingleActivity = () => {
        setActivityId(tempSelectedActivityId);
        setShowActivityModal(false);
    }
    
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

    // --- Render Functions ---

    // Render item for the modal FlatList (single select)
    const renderActivityItem = ({ item }: { item: Activity }) => {
        const isSelected = tempSelectedActivityId === item.id;
        return (
            <TouchableOpacity
                key={item.id}
                onPress={() => toggleSingleActivity(item.id)}
                style={[styles.activityChipModal, themed(isSelected ? themedStyles.activityChipSelected : themedStyles.activityChipUnselected)]}
            >
                <Text style={styles.activityChipEmoji}>{item.icon}</Text>
                <Text style={themed(isSelected ? themedStyles.activityChipTextSelected : themedStyles.activityChipTextUnselected)}>{item.name}</Text>
            </TouchableOpacity>
        );
    };


    const selectedActivity = allActivities?.find(a => a.id === activityId);

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

            {/* Main Form Content */}
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

                <Text style={themed(themedStyles.inputLabel)}>Location</Text>
                <TextInput
                style={themed(themedStyles.textInput)}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Central Park, NYC (Optional)"
                placeholderTextColor={theme.colors.textDim}
                maxLength={100}
                />

                {/* --- CHOOSE ACTIVITY BUTTON --- */}
                <Text style={themed(themedStyles.inputLabel)}>Activity*</Text>
                <TouchableOpacity
                    style={themed(themedStyles.activitySelectButton)}
                    onPress={() => setShowActivityModal(true)}
                    disabled={isLoadingActivities}
                >
                    {isLoadingActivities && allActivities.length === 0 ? (
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
                    placeholder="Tell others what your group is about... (Optional)"
                    placeholderTextColor={theme.colors.textDim}
                    multiline
                    textAlignVertical="top"
                    maxLength={500}
                />

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
                </View>
            )}
            />

            {/* --- ACTIVITY SELECTION MODAL (Single Select) --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showActivityModal}
                onRequestClose={() => setShowActivityModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, themed(themedStyles.modalView)]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Primary Activity</Text>
                            <TouchableOpacity
                                onPress={() => setShowActivityModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Text style={styles.modalCloseText}>×</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {/* Search Input */}
                        <TextField
                            value={query}
                            style={themed(themedStyles.modalSearchInput)}
                            containerStyle={styles.modalSearchInputContainer}
                            onChangeText={(text) => {
                                setOffset(0)
                                setQuery(text)
                            }}
                            placeholder="Search activities..."
                            autoCapitalize="none"
                        />
                        
                        {/* Activity List */}
                        {isLoadingActivities && allActivities.length === 0 ? (
                            <ActivityIndicator size="large" color={theme.colors.tint} style={{ marginVertical: spacing.xxl }} />
                            ) : (
                            <FlatList
                                data={allActivities}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderActivityItem}
                                numColumns={2}
                                contentContainerStyle={{ paddingBottom: spacing.lg }}
                                onEndReached={handleEndReached}
                                onEndReachedThreshold={0.6}
                                ListFooterComponent={() =>
                                    isFetchingActivities && hasMore ? (
                                    <ActivityIndicator size="small" color={theme.colors.tint} style={{ marginVertical: spacing.md }} />
                                    ) : null
                                }
                            />
                        )}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.modalSecondaryButton}
                                onPress={() => setShowActivityModal(false)}
                            >
                                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalPrimaryButton}
                                onPress={handleSaveSingleActivity}
                                disabled={tempSelectedActivityId === null}
                            >
                                <Text style={styles.modalPrimaryButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    )
})

// --- Styles ---

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
  } as ViewStyle,
  
  // Modal Styles (Copied from ProfileScreen for consistency)
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  modalView: {
    backgroundColor: 'white',
    borderRadius: spacing.lg,
    width: "100%",
    maxWidth: width * 0.9,
    maxHeight: height * 0.8,
    elevation: 5,
    padding: spacing.lg,
  } as ViewStyle,
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.md,
  } as ViewStyle,
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: '#000',
    flex: 1,
  } as TextStyle,
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  modalCloseText: {
    fontSize: 18,
    color: '#666',
    fontWeight: "500",
  } as TextStyle,
  modalSearchInputContainer: {
      marginBottom: spacing.md,
  } as ViewStyle,
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: spacing.md,
  } as ViewStyle,
  modalPrimaryButton: {
    flex: 1,
    backgroundColor: 'blue',
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  modalSecondaryButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  modalPrimaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,
  modalSecondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: "600",
  } as TextStyle,
  
  // Activity Chip (Modal) Styles - for single selection
  activityChipModal: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs / 2,
    alignItems: "center",
    marginBottom: spacing.md,
  } as ViewStyle,
  activityChipEmoji: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 4,
  } as TextStyle,

})

const themedStyles = {
    // ... Existing themed styles (container, header, backButtonText, etc.)
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
        fontSize: 60,
        lineHeight: 72,
        height: 72,
        textAlignVertical: "center",
        textAlign: "center",
        marginBottom: spacing.sm,
    }),
    toggleContainer: (theme: any): ViewStyle => ({
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    }),
    toggleDescription: (theme: any): TextStyle => ({
        fontSize: 12,
        color: theme.colors.textDim,
    }),

    // Activity Select Button (Form)
    activitySelectButton: (theme: any): ViewStyle => ({
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: spacing.sm,
        padding: spacing.sm,
        backgroundColor: theme.colors.background,
        minHeight: 50,
    }),
    activitySelectText: (theme: any): TextStyle => ({
        fontSize: 16,
        color: theme.colors.text,
    }),

    // Modal Themed Styles
    modalView: (theme: any): ViewStyle => ({
        backgroundColor: theme.colors.background,
        borderRadius: spacing.lg,
        shadowColor: theme.colors.text,
    }),
    modalSearchInput: (theme: any): TextStyle => ({
        fontSize: 16,
        color: theme.colors.text,
    }),

    // Activity Chip Themed Styles (Modal)
    activityChipSelected: (theme: any): ViewStyle => ({
      backgroundColor: theme.colors.tint,
      borderColor: theme.colors.tint,
      borderWidth: 2,
    }),
    activityChipUnselected: (theme: any): ViewStyle => ({
      backgroundColor: theme.colors.backgroundMuted,
      borderColor: theme.colors.border,
      borderWidth: 2,
    }),
    activityChipTextSelected: (theme: any): TextStyle => ({
      color: theme.colors.tintInverse,
      fontWeight: "600",
      textAlign: "center",
    }),
    activityChipTextUnselected: (theme: any): TextStyle => ({
      color: theme.colors.text,
      fontWeight: "600",
      textAlign: "center",
    }),
}
