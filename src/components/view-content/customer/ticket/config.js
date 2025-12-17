export const ticketCategories = [
  { label: 'Yêu cầu phát lại', value: 'REDELIVERY' },
  { label: 'Xác minh địa chỉ', value: 'ADDRESS_VERIFY' },
  { label: 'Khiếu nại hỏng/mất', value: 'CLAIM_DMG_LOST' },
  { label: 'Hoàn hàng', value: 'RETURN_TO_SENDER' },
  { label: 'Yêu cầu ngoài phạm vi', value: 'SPECIAL_HANDLING' },
]

export const ticketPriorities = [
  { label: 'LOW', value: 'LOW' },
  { label: 'MEDIUM', value: 'MEDIUM' },
  { label: 'HIGH', value: 'HIGH' },
]

export const ticketStatus = [
  { label: 'NEW', value: 'NEW' },
  { label: 'ASSIGNED', value: 'ASSIGNED' },
  { label: 'IN_PROGRESS', value: 'IN_PROGRESS' },
  { label: 'CLOSED', value: 'CLOSED' },
]

export const carriers = [{ label: 'Viettel Post', value: 'VIETTEL_POST' }]

export const categoryMap = {
  REDELIVERY: 'Yêu cầu phát lại',
  ADDRESS_VERIFY: 'Xác minh địa chỉ',
  CLAIM_DMG_LOST: 'Khiếu nại hỏng/mất',
  RETURN_TO_SENDER: 'Hoàn hàng',
  SPECIAL_HANDLING: 'Yêu cầu ngoài phạm vi',
}

export const priorityMap = {
  LOW: 'success',
  MEDIUM: 'info',
  HIGH: 'danger',
}

export const statusMap = {
  NEW: 'warn',
  ASSIGNED: 'info',
  IN_PROGRESS: 'info',
  CLOSED: 'success',
}
