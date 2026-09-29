export const EQUIPMENT_TYPES = ['VEHICLE', 'EQUIPMENT', 'COMMUNICATION', 'SUPPLY']

export const EQUIPMENT_OPTIONS = EQUIPMENT_TYPES.map((type) => ({ value: type, label: type }))

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toISOString().slice(0, 10)
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toISOString().replace('T', ' ').slice(0, 19)
}

export function errorMessage(err, fallback) {
  return err?.response?.data?.message || fallback
}
