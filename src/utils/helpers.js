import { format } from 'date-fns'

export const formatDateTime = (value) => {
  if (!value || (!value) instanceof Date) return ''
  return format(value, 'dd/MM/yyyy HH:mm:ss')
}

export const formatCurrency = (num) => {
  return num.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
}

export const formatNumber = (num) => {
  return num.toLocaleString('vi-VN')
}

export const chunkArray = (array, size = 10) => {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}
