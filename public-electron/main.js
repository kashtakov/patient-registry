const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs-extra');

const db = require('knex')({
  client: 'sqlite3',
  connection: { filename: './patient-data.sqlite3' },
  useNullAsDefault: true,
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  win.loadURL(
    isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`
  );
}

app.whenReady().then(async () => {
  const hasPatients = await db.schema.hasTable('patients');
  if (!hasPatients) {
    await db.schema.createTable('patients', (table) => {
      table.increments('id').primary();
      table.string('last_name');
      table.string('first_name');
      table.string('patronymic');
      table.string('dob');
      table.string('diagnosis');
      table.string('status');
      table.string('rank');
      table.string('battalion');
      table.string('unit');
      table.string('position');
    });
  } else {
    // Check and add missing columns
    const columns = await db.schema.tableInfo('patients');
    const columnNames = columns.map(col => col.name);
    
    // Add new name fields if they don't exist
    if (!columnNames.includes('last_name')) {
      await db.schema.alterTable('patients', (table) => {
        table.string('last_name');
      });
    }
    if (!columnNames.includes('first_name')) {
      await db.schema.alterTable('patients', (table) => {
        table.string('first_name');
      });
    }
    if (!columnNames.includes('patronymic')) {
      await db.schema.alterTable('patients', (table) => {
        table.string('patronymic');
      });
    }
    // Add other missing columns
    if (!columnNames.includes('rank')) {
      await db.schema.alterTable('patients', (table) => {
        table.string('rank');
      });
    }
    if (!columnNames.includes('battalion')) {
      await db.schema.alterTable('patients', (table) => {
        table.string('battalion');
      });
    }
    if (!columnNames.includes('unit')) {
      await db.schema.alterTable('patients', (table) => {
        table.string('unit');
      });
    }
    if (!columnNames.includes('position')) {
      await db.schema.alterTable('patients', (table) => {
        table.string('position');
      });
    }
  }

  const hasAttachments = await db.schema.hasTable('attachments');
  if (!hasAttachments) {
    await db.schema.createTable('attachments', (table) => {
      table.increments('id').primary();
      table.integer('patient_id').references('id').inTable('patients');
      table.string('filename');
      table.string('path');
    });
  }

  ipcMain.handle('get-patients', async () => await db('patients').select());

  ipcMain.handle('add-patient', async (_event, patient) => {
    await db('patients').insert(patient);
    return { success: true };
  });

  ipcMain.handle('delete-patient', async (_event, id) => {
    await db('patients').where({ id }).del();
    await db('attachments').where({ patient_id: id }).del();
    await fs.remove(path.join(__dirname, 'attachments', String(id)));
    return { success: true };
  });

  ipcMain.handle('update-patient', async (_event, patient) => {
    const { id, ...rest } = patient;
    await db('patients').where({ id }).update(rest);
    return { success: true };
  });

  ipcMain.handle('upload-file', async (_event, patientId) => {
    const result = await dialog.showOpenDialog({
      title: 'Выберите справку или изображение',
      properties: ['openFile'],
      filters: [{ name: 'Документы и изображения', extensions: ['pdf', 'jpg', 'jpeg', 'png'] }],
    });

    if (result.canceled || result.filePaths.length === 0) return { success: false };

    const filePath = result.filePaths[0];
    const fileName = path.basename(filePath);
    const destDir = path.join(__dirname, 'attachments', String(patientId));
    await fs.ensureDir(destDir);
    const destPath = path.join(destDir, fileName);
    await fs.copy(filePath, destPath);

    await db('attachments').insert({
      patient_id: patientId,
      filename: fileName,
      path: destPath,
    });

    return { success: true, path: destPath };
  });

  ipcMain.handle('get-attachments', async (_event, patientId) => {
    return await db('attachments').where({ patient_id: patientId });
  });

  ipcMain.handle('open-file', async (_event, filePath) => {
    await shell.openPath(filePath);
    return { success: true };
  });

  ipcMain.handle('delete-attachment', async (_event, attachmentId) => {
    const file = await db('attachments').where({ id: attachmentId }).first();
    if (file) {
      await fs.remove(file.path); // удалить физически
      await db('attachments').where({ id: attachmentId }).del(); // удалить из БД
      return { success: true };
    }
    return { success: false };
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
