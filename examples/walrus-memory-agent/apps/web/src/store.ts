import { Store } from '@tanstack/react-store'

export interface Activity {
  at: string
  label: string
  detail?: string
  digest?: string
}

export const ui = new Store({
  rememberText:
    'Pays monthly rent of 1,800 USDC to their landlord on the 1st. Asks for confirmation above 500 USDC.',
  recallQuery:
    'What recurring payments and approval rules does this user have?',
  appRememberText: 'Prefers payouts in USDC on Base.',
  appRecallQuery: "What are this user's payout preferences?",
  activity: [] as Activity[],
})

export type FormField =
  | 'rememberText'
  | 'recallQuery'
  | 'appRememberText'
  | 'appRecallQuery'

export function setField(field: FormField, value: string) {
  ui.setState((s) => ({ ...s, [field]: value }))
}

export function logActivity(entry: Omit<Activity, 'at'>) {
  ui.setState((s) => ({
    ...s,
    activity: [{ at: new Date().toISOString(), ...entry }, ...s.activity],
  }))
}
