export const semanticTone = {
  success: {
    label: "Paid / resolved",
    bg: "bg-green-50",
    bgStrong: "bg-green-500",
    text: "text-green-700",
    textSoft: "text-green-600",
    border: "border-green-200",
    badge:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-200 dark:border-green-400/40",
    surface: "border-green-100 bg-green-50/40",
    soft: "bg-green-500/10 text-green-700 border-green-200",
  },
  pending: {
    label: "Pending / upcoming",
    bg: "bg-amber-50",
    bgStrong: "bg-amber-500",
    text: "text-amber-700",
    textSoft: "text-amber-600",
    border: "border-amber-200",
    badge:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-100 dark:border-amber-300/40",
    surface: "border-amber-100 bg-amber-50/40",
    soft: "bg-amber-500/10 text-amber-700 border-amber-200",
  },
  danger: {
    label: "Overdue / urgent",
    bg: "bg-red-50",
    bgStrong: "bg-red-500",
    text: "text-red-700",
    textSoft: "text-red-600",
    border: "border-red-200",
    badge:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/22 dark:text-red-100 dark:border-red-300/45",
    surface: "border-red-100 bg-red-50/40",
    soft: "bg-red-500/10 text-red-700 border-red-200",
  },
  scheduled: {
    label: "Scheduled / in progress",
    bg: "bg-blue-50",
    bgStrong: "bg-blue-500",
    text: "text-blue-700",
    textSoft: "text-blue-600",
    border: "border-blue-200",
    badge:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/22 dark:text-blue-100 dark:border-blue-300/45",
    surface: "border-blue-100 bg-blue-50/40",
    soft: "bg-blue-500/10 text-blue-700 border-blue-200",
  },
  maintenance: {
    label: "Maintenance",
    bg: "bg-violet-50",
    bgStrong: "bg-violet-500",
    text: "text-violet-700",
    textSoft: "text-violet-600",
    border: "border-violet-200",
    badge:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/22 dark:text-violet-100 dark:border-violet-300/45",
    surface: "border-violet-100 bg-violet-50/40",
    soft: "bg-violet-500/10 text-violet-700 border-violet-200",
  },
  neutral: {
    label: "Neutral",
    bg: "bg-slate-50",
    bgStrong: "bg-slate-500",
    text: "text-slate-700",
    textSoft: "text-slate-600",
    border: "border-slate-200",
    badge:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/22 dark:text-slate-100 dark:border-slate-300/35",
    surface: "border-slate-100 bg-slate-50/40",
    soft: "bg-slate-500/10 text-slate-700 border-slate-200",
  },
} as const;

export type SemanticTone = keyof typeof semanticTone;
