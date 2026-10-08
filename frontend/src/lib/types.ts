// Mirrors backend/app/schemas.py.

export interface CourseInfo {
  code: string;
  title: string;
  from_language: string;
}

export interface Me {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  timezone: string;
  xp_total: number;
  gems: number;
  hearts: number;
  max_hearts: number;
  next_heart_in_seconds: number | null;
  heart_regen_minutes: number;
  heart_refill_cost: number;
  streak: number;
  streak_extended_today: boolean;
  longest_streak: number;
  streak_freezes: number;
  max_streak_freezes: number;
  streak_freeze_cost: number;
  is_premium: boolean;
  premium_until: string | null;
  daily_goal_xp: number;
  daily_xp: number;
  today: string;
  course: CourseInfo;
  dev_tools: boolean;
}

export type SkillStatus = "completed" | "active" | "locked";

export interface Skill {
  id: number;
  title: string;
  icon: string;
  status: SkillStatus;
  lessons_completed: number;
  total_lessons: number;
  next_lesson_id: number | null;
  legendary: boolean;
}

export interface Unit {
  id: number;
  position: number;
  title: string;
  description: string;
  color: UnitColor;
  skills: Skill[];
}

export type UnitColor = "green" | "blue" | "purple" | "orange" | "pink";

export interface CoursePath {
  course: CourseInfo;
  units: Unit[];
}

// ---------------------------------------------------------------- exercises

interface ExerciseBase {
  id: number;
  prompt: string;
}

export interface MultipleChoiceExercise extends ExerciseBase {
  type: "multiple_choice";
  choices: { text: string; emoji?: string }[];
}

export interface TranslateExercise extends ExerciseBase {
  type: "translate";
  source: string;
  source_lang: string;
  word_bank: string[];
}

export interface MatchPairsExercise extends ExerciseBase {
  type: "match_pairs";
  pairs: [string, string][];
}

export interface FillBlankExercise extends ExerciseBase {
  type: "fill_blank";
  sentence: string;
  translation: string;
  choices: string[];
}

export interface TypeAnswerExercise extends ExerciseBase {
  type: "type_answer";
  source: string;
  source_lang: string;
}

export type Exercise =
  | MultipleChoiceExercise
  | TranslateExercise
  | MatchPairsExercise
  | FillBlankExercise
  | TypeAnswerExercise;

export type AnswerValue = number | string | string[] | string[][];

export type AttemptKind = "lesson" | "practice" | "legendary";

export interface Attempt {
  attempt_id: string;
  kind: AttemptKind;
  meta: {
    lesson_id: number | null;
    skill_id: number | null;
    skill_title: string;
    unit_title: string | null;
    lesson_number: number | null;
    lessons_in_skill: number | null;
  };
  exercises: Exercise[];
  hearts: number;
  max_hearts: number;
  hearts_enabled: boolean;
  time_limit_seconds: number | null;
  max_mistakes: number | null;
}

export interface AnswerResult {
  correct: boolean;
  solution: string;
  note: string | null;
  hearts: number;
  remaining: number;
  attempt_status: "in_progress" | "completed" | "failed";
}

export interface Completion {
  kind: AttemptKind;
  xp_earned: number;
  base_xp: number;
  bonus_xp: number;
  mistakes: number;
  accuracy: number;
  perfect: boolean;
  streak: number;
  streak_extended: boolean;
  streak_freezes_used: number;
  daily_xp: number;
  daily_goal_xp: number;
  daily_goal_reached_now: boolean;
  skill_completed: boolean;
  legendary: boolean;
  skill_title: string | null;
  gems_earned: number;
  hearts: number;
  new_achievements: { code: string; title: string; description: string; icon: string }[];
}

// ---------------------------------------------------------------- social / profile

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  display_name: string;
  avatar_color: string;
  weekly_xp: number;
  is_current_user: boolean;
}

export interface Leaderboard {
  league: string;
  week_start: string;
  week_end: string;
  days_left: number;
  promotion_count: number;
  demotion_count: number;
  entries: LeaderboardEntry[];
}

export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  metric: string;
  threshold: number;
  progress: number;
  unlocked_at: string | null;
}

export interface Profile {
  user: Me;
  joined_at: string;
  lessons_completed: number;
  skills_completed: number;
  perfect_lessons: number;
  league: string;
  xp_last_7_days: { date: string; xp: number }[];
  achievements: Achievement[];
}

export interface Quest {
  code: string;
  title: string;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  reward_gems: number;
}

export interface Quests {
  quests: Quest[];
  gems: number;
}

export interface PremiumStatus {
  payments_enabled: boolean;
  price_inr: number;
  days: number;
  is_premium: boolean;
  premium_until: string | null;
}

export interface PremiumOrder {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  name: string;
  description: string;
  customer_name: string;
}
