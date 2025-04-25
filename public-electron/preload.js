const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getPatients: () => ipcRenderer.invoke('get-patients'),
  addPatient: (patient) => ipcRenderer.invoke('add-patient', patient),
  deletePatient: (id) => ipcRenderer.invoke('delete-patient', id),
  updatePatient: (patient) => ipcRenderer.invoke('update-patient', patient),
  uploadFile: (id) => ipcRenderer.invoke('upload-file', id),
  getAttachments: (id) => ipcRenderer.invoke('get-attachments', id),
  openFile: (path) => ipcRenderer.invoke('open-file', path),
  deleteAttachment: (id) => ipcRenderer.invoke('delete-attachment', id),
});
