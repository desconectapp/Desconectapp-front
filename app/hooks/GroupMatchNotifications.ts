import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { useGroups } from './Groups'
import { Group } from '@/services/groups/Groups.types'

export const useGroupMatchNotifications = () => {
  const { data: groupsData } = useGroups()
  const previousGroupsRef = useRef<Group[]>([])
  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    if (!groupsData?.groups) return

    const currentGroups = groupsData.groups

    // Skip notification on initial load
    if (isInitialLoadRef.current) {
      previousGroupsRef.current = currentGroups
      isInitialLoadRef.current = false
      return
    }

    // Find new groups by comparing with previous groups
    const previousGroupIds = new Set(previousGroupsRef.current.map(group => group.id))
    const newGroups = currentGroups.filter(group => !previousGroupIds.has(group.id))

    // Show notification for each new group
    if (newGroups.length > 0) {
      newGroups.forEach(async (group) => {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "🎉 ¡Nuevo grupo encontrado!",
              body: `Te has unido al grupo "${group.name}". ¡Es hora de conectarte!`,
              sound: true, // Enable sound
              data: { 
                groupId: group.id,
                type: 'group_match'
              },
            },
            trigger: null, // Show immediately
            ...(Platform.OS === 'android' && {
              android: {
                channelId: 'default', // Use the default channel which has vibration configured
                sound: true,
                vibrate: [0, 250, 250, 250], // Vibration pattern: wait 0ms, vibrate 250ms, pause 250ms, vibrate 250ms
              },
            }),
          })
          console.log(`Notification sent for new group: ${group.name}`)
        } catch (error) {
          console.error("Failed to send group match notification:", error)
        }
      })
    }

    // Update the previous groups reference
    previousGroupsRef.current = currentGroups
  }, [groupsData])

  return null // This hook doesn't return anything, it just handles notifications
}