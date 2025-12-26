import { format } from 'date-fns'
import * as XLSX from 'xlsx'

export const formatDateTime = (value) => {
  if (!value || (!value) instanceof Date) return ''
  return format(value, 'dd/MM/yyyy HH:mm:ss')
}

export const formatDate = (value) => {
  if (!value || (!value) instanceof Date) return ''
  return format(value, 'dd/MM/yyyy')
}

export const formatCurrency = (num) => {
  const value = Number(num)
  return isNaN(value) ? '' : value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
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

export const preProcessData = (data) => {
  return data.map((item, idx) => {
    const ret = {}
    ret['STT'] = idx + 1
    ret['Mã vận đơn'] = item.waybill
    ret['Mã đơn hàng'] = item.rawData.ORDER_REFERENCE
    ret['Ngày tạo'] = formatDate(item.createdAt)
    ret['Người gửi'] = item.rawData.SENDER_FULLNAME
    ret['Địa chỉ gửi'] = item.rawData.SENDER_ADDRESS
    ret['Số điện thoại người gửi'] = item.rawData.SENDER_PHONE
    ret['Người nhận'] = item.rawData.RECEIVER_FULLNAME
    ret['Địa chỉ nhận'] = item.rawData.RECEIVER_ADDRESS
    ret['Số điện thoại người nhận'] = item.rawData.RECEIVER_PHONE
    ret['Tên hàng'] = item.rawData.PRODUCT_NAME
    ret['Giá trị hàng'] = item.rawData.PRODUCT_PRICE
    ret['Trọng lượng'] = item.rawData.PRODUCT_WEIGHT
    ret['Dịch vụ'] = item.rawData.ORDER_SERVICE
    ret['Loại đơn'] = item.rawData.ORDER_TYPE
    ret['Tổng cước'] = item.rawData.MONEY_TOTAL
    ret['Tiền thu hộ'] = item.rawData.MONEY_COLLECTION
    ret['Trạng thái'] = item.rawData.ORDER_STATUS
    ret['Ghi chú'] = item.rawData.ORDER_NOTE
    ret['Tài khoản tạo đơn'] = item.user.name
    return ret
  })
}

export const exportExcel = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  const array = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([array], { type: 'application/octet-stream' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  const name = `exported-${formatDateTime(new Date())}.xlsx`
  link.download = name
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
