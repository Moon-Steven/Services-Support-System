export interface IntakeFormState {
  company: string
  industry: string
  contact: string
  phone: string
  email: string
  salesOwner: string
  source: string
  channels: string[]
  budget: string
  market: string
  productType: string
  painPoints: string
  team: string
  goals: string[]
  cpaTarget: string
  roasTarget: string
  testBudget: string
  testPeriod: string
  notes: string
  /* 客户评级 */
  gradingScores: Record<string, number>
  gradeResult: string
  gradeScore: number
  /* 合规资质 */
  adAccount: string
  pixelId: string
  creativeReadiness: string
}

export type FormAction =
  | { type: 'SET_FIELD'; field: keyof IntakeFormState; value: string }
  | { type: 'TOGGLE_ARRAY'; field: 'channels' | 'goals'; value: string }
  | { type: 'SET_GRADING'; scores: Record<string, number>; grade: string; score: number }

export const initialFormState: IntakeFormState = {
  company: '',
  industry: '',
  contact: '',
  phone: '',
  email: '',
  salesOwner: '',
  source: '',
  channels: [],
  budget: '',
  market: '',
  productType: '',
  painPoints: '',
  team: '',
  goals: [],
  cpaTarget: '',
  roasTarget: '',
  testBudget: '',
  testPeriod: '',
  notes: '',
  gradingScores: { d1: 70, d2: 50, d3: 80, d4: 60, d5: 65 },
  gradeResult: '',
  gradeScore: 0,
  adAccount: '',
  pixelId: '',
  creativeReadiness: '',
}

export function formReducer(state: IntakeFormState, action: FormAction): IntakeFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'TOGGLE_ARRAY': {
      const arr = state[action.field] as string[]
      const next = arr.includes(action.value)
        ? arr.filter((v) => v !== action.value)
        : [...arr, action.value]
      return { ...state, [action.field]: next }
    }
    case 'SET_GRADING':
      return { ...state, gradingScores: action.scores, gradeResult: action.grade, gradeScore: action.score }
  }
}
