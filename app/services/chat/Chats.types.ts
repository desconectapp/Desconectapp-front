export interface SupabaseToken {
    supabase_token: string
}


export interface Message {
    id: number
    group_id: number
    user_id: string
    content: string
    sent_at: Date
}