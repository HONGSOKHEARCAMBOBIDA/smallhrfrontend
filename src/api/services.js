import api from './index'

// Auth
export const login = (data) => api.post('/login', data)
export const loginByQr = (data) => api.post('/loginbyqr', data)
export const refreshToken = (data) => api.post('/refresh', data)

// Company
export const getCompany = (params) => api.get('/view.company', { params })
export const createCompany = (data) => api.post('/add.company', data)
export const updateCompany = (id, data) => api.put(`/edit.company/${id}`, data)
export const updateTelegram = (id,data) => api.put(`/edit.telegram/${id}`,data)

// User
export const getUsers = (params) => api.get('/view.user', { params })
export const createUser = (data) => api.post('/add.user', data)
export const updateUser = (id, data) => api.put(`/edit.user/${id}`, data)
export const toggleUserStatus = (id) => api.put(`/toggle.status.user/${id}`)
export const deleteuser = (id) => api.delete(`/delete.user/${id}`)
export const changePassword = (data) => api.put('/change.password', data)
export const countuser = () => api.get('/count.user')
export const getrole = () => api.get('/view.role')

// Shift
export const createShift = (data) => api.post('/add.shift', data)
export const updateShift = (data) => api.put('/edit.shift', data)

// Attendance
export const createAttendance = (data) => api.post('/add.attendance', data)
export const getAttendance = (params) => api.get('/view.attendance', { params })
export const getAttendanceDraft = (params) => api.get('/view.attendance.draft')

// Payroll
export const getPayrollDraft = (params) => api.get('/view.payroll.draft', { params })
export const createPayroll = (data) => api.post('/add.payroll', data)
export const getPayroll = (params) => api.get('/view.payroll',{params})

// Backup
export const triggerBackup = () => api.post('add.backup')
export const listBackups = () => api.get('view.backup')
export const downloadBackup = (filename) => api.get('view.download.backup', { 
  params: { file: filename },
  responseType: 'blob'  // important — it's a file download
})
export const deleteBackup = (filename) => api.delete('delete.backup',{
  params: {file: filename},
})