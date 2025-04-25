import React, { useEffect, useState } from 'react';

const styles = {
  container: {
    padding: 20,
    fontFamily: 'sans-serif',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: 20,
  },
  th: {
    borderBottom: '1px solid #ccc',
    textAlign: 'left' as const,
    padding: 8,
    background: '#f0f0f0',
  },
  td: {
    padding: 8,
    borderBottom: '1px solid #eee',
  },
  input: {
    padding: 8,
    border: '1px solid #ccc',
    borderRadius: 4,
    marginRight: 10,
    marginBottom: 10,
  },
  button: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '6px 12px',
    cursor: 'pointer',
    marginRight: 5,
    marginTop: 5,
  },
  buttonDanger: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '6px 12px',
    cursor: 'pointer',
    marginRight: 5,
    marginTop: 5,
  },
  card: {
    maxWidth: 600,
    margin: '0 auto',
    padding: 20,
    background: '#f8f9fa',
    borderRadius: 8,
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
};

export default function PatientTable() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientFiles, setPatientFiles] = useState<
    { id: number; filename: string; path: string }[]
  >([]);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    const load = async () => {
      const loadedPatients = await window.api.getPatients();
      setPatients(loadedPatients);
    };

    load();
  }, []);

  const openPatientCard = async (patient: Patient) => {
    const files = await window.api.getAttachments(patient.id);
    setPatientFiles(files);
    setSelectedPatient(patient);
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchName.toLowerCase())
  );

  if (selectedPatient) {
    return (
      <div style={styles.card}>
        <button style={styles.button} onClick={() => setSelectedPatient(null)}>← Назад</button>
        <h2>{selectedPatient.name}</h2>
        <p><b>Дата рождения:</b> {selectedPatient.dob}</p>
        <p><b>Диагноз:</b> {selectedPatient.diagnosis}</p>
        <p><b>Статус:</b> {selectedPatient.status}</p>

        <div style={{ marginTop: 10 }}>
          <button style={styles.button} onClick={() => setEditingPatient(selectedPatient)}>✏️ Редактировать</button>
          <button
            style={styles.buttonDanger}
            onClick={async () => {
              if (window.confirm(`Удалить пациента ${selectedPatient.name}?`)) {
                await window.api.deletePatient(selectedPatient.id);
                const updated = await window.api.getPatients();
                setPatients(updated);
                setSelectedPatient(null);
              }
            }}
          >
            🗑️ Удалить
          </button>
          <button
            style={styles.button}
            onClick={async () => {
              const result = await window.api.uploadFile(selectedPatient.id);
              if (result.success) {
                const files = await window.api.getAttachments(selectedPatient.id);
                setPatientFiles(files);
              }
            }}
          >
            📎 Загрузить файл
          </button>
        </div>

        <h3 style={{ marginTop: 20 }}>Справки</h3>
        {patientFiles.length === 0 && <p>Нет прикреплённых файлов</p>}
        {patientFiles.map((f) => (
          <div key={f.id}>
            📄 {f.filename}{' '}
            <button style={styles.button} onClick={() => window.api.openFile(f.path)}>Открыть</button>
            <button
              style={styles.buttonDanger}
              onClick={async () => {
                if (window.confirm(`Удалить справку "${f.filename}"?`)) {
                  await window.api.deleteAttachment(f.id);
                  const updated = await window.api.getAttachments(selectedPatient.id);
                  setPatientFiles(updated);
                }
              }}
            >
              🗑️
            </button>
          </div>
        ))}

        {editingPatient && (
          <>
            <h3 style={{ marginTop: 20 }}>Редактировать пациента</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const updated = {
                  id: editingPatient.id,
                  name: formData.get('name') as string,
                  dob: formData.get('dob') as string,
                  diagnosis: formData.get('diagnosis') as string,
                  status: formData.get('status') as string,
                };
                await window.api.updatePatient(updated);
                const refreshed = await window.api.getPatients();
                setPatients(refreshed);
                setEditingPatient(null);
                setSelectedPatient(null);
              }}
            >
              <input name="name" defaultValue={editingPatient.name} required style={styles.input} />
              <input name="dob" type="date" defaultValue={editingPatient.dob} required style={styles.input} />
              <input name="diagnosis" defaultValue={editingPatient.diagnosis} required style={styles.input} />
              <input name="status" defaultValue={editingPatient.status} required style={styles.input} />
              <button type="submit" style={styles.button}>Сохранить</button>
              <button type="button" onClick={() => setEditingPatient(null)} style={styles.button}>
                Отмена
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Картотека пациентов</h2>

      <input
        style={styles.input}
        type="text"
        placeholder="Поиск по ФИО"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ФИО</th>
            <th style={styles.th}>Год рождения</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map((p) => (
            <tr key={p.id}>
              <td style={styles.td}>
                <button
                  onClick={() => openPatientCard(p)}
                  style={{ all: 'unset', cursor: 'pointer', color: '#007bff' }}
                >
                  {p.name}
                </button>
              </td>
              <td style={styles.td}>{new Date(p.dob).getFullYear()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Добавить пациента</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);

          const data = {
            name: formData.get("name") as string,
            dob: formData.get("dob") as string,
            diagnosis: formData.get("diagnosis") as string,
            status: formData.get("status") as string,
          };

          await window.api.addPatient(data);
          const updated = await window.api.getPatients();
          setPatients(updated);
          form.reset();
        }}
      >
        <input name="name" placeholder="ФИО" required style={styles.input} />
        <input name="dob" type="date" placeholder="Дата рождения" required style={styles.input} />
        <input name="diagnosis" placeholder="Диагноз" required style={styles.input} />
        <input name="status" placeholder="Статус" required style={styles.input} />
        <button type="submit" style={styles.button}>Добавить</button>
      </form>
    </div>
  );
}
