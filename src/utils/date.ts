import { eachDayOfInterval, startOfMonth, endOfMonth, format, subMonths } from 'date-fns'

export function getMonthDays(monthsAgo = 0) {
  const now = new Date()
  const start = startOfMonth(subMonths(now, monthsAgo))
  const end = endOfMonth(subMonths(now, monthsAgo))
  return eachDayOfInterval({ start, end })
}

export function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd')
}
