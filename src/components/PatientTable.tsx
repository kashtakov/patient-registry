import React, { useEffect, useState } from 'react';
import AddPatientForm from './AddPatientForm';

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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  const [showAddForm, setShowAddForm] = useState(false);

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
    `${p.last_name} ${p.first_name} ${p.patronymic}`.toLowerCase().includes(searchName.toLowerCase())
  );

  if (selectedPatient) {
    return (
      <div style={styles.card}>
        <button style={styles.button} onClick={() => setSelectedPatient(null)}>← Назад</button>
        <h2>{`${selectedPatient.last_name} ${selectedPatient.first_name} ${selectedPatient.patronymic}`}</h2>
        <p><b>Дата народження:</b> {selectedPatient.dob}</p>
        <p><b>Діагноз:</b> {selectedPatient.diagnosis}</p>
        <p><b>Статус:</b> {selectedPatient.status}</p>

        <div style={{ marginTop: 10 }}>
          <button style={styles.button} onClick={() => setEditingPatient(selectedPatient)}>✏️ Редагувати</button>
          <button
            style={styles.buttonDanger}
            onClick={async () => {
              if (window.confirm(`Видалити пацієнта ${selectedPatient.last_name} ${selectedPatient.first_name} ${selectedPatient.patronymic}?`)) {
                await window.api.deletePatient(selectedPatient.id);
                const updated = await window.api.getPatients();
                setPatients(updated);
                setSelectedPatient(null);
              }
            }}
          >
            🗑️ Видалити
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
            📎 Завантажити файл
          </button>
        </div>

        <h3 style={{ marginTop: 20 }}>Справки</h3>
        {patientFiles.length === 0 && <p>Немає прикріплених файлів</p>}
        {patientFiles.map((f) => (
          <div key={f.id}>
            📄 {f.filename}{' '}
            <button style={styles.button} onClick={() => window.api.openFile(f.path)}>Відкрити</button>
            <button
              style={styles.buttonDanger}
              onClick={async () => {
                if (window.confirm(`Видалити справку "${f.filename}"?`)) {
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
            <h3 style={{ marginTop: 20 }}>Редагувати пацієнта</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const updated = {
                  id: editingPatient.id,
                  last_name: formData.get('last_name') as string,
                  first_name: formData.get('first_name') as string,
                  patronymic: formData.get('patronymic') as string,
                  dob: formData.get('dob') as string,
                  diagnosis: formData.get('diagnosis') as string,
                  status: formData.get('status') as string,
                  rank: formData.get('rank') as string,
                  battalion: formData.get('battalion') as string,
                  unit: formData.get('unit') as string,
                  position: formData.get('position') as string,
                };
                await window.api.updatePatient(updated);
                const refreshed = await window.api.getPatients();
                setPatients(refreshed);
                setEditingPatient(null);
                setSelectedPatient(null);
              }}
            >
              <input name="last_name" defaultValue={editingPatient.last_name} required style={styles.input} />
              <input name="first_name" defaultValue={editingPatient.first_name} required style={styles.input} />
              <input name="patronymic" defaultValue={editingPatient.patronymic} required style={styles.input} />
              <input name="dob" type="date" defaultValue={editingPatient.dob} required style={styles.input} />
              <input name="diagnosis" defaultValue={editingPatient.diagnosis} required style={styles.input} />
              <input name="status" defaultValue={editingPatient.status} required style={styles.input} />
              <input name="rank" defaultValue={editingPatient.rank} required style={styles.input} />
              <input name="battalion" defaultValue={editingPatient.battalion} required style={styles.input} />
              <input name="unit" defaultValue={editingPatient.unit} required style={styles.input} />
              <input name="position" defaultValue={editingPatient.position} required style={styles.input} />
              <button type="submit" style={styles.button}>Зберегти</button>
              <button type="button" onClick={() => setEditingPatient(null)} style={styles.button}>
                Скасувати
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  if (showAddForm) {
    return (
      <AddPatientForm
        onClose={() => setShowAddForm(false)}
        onPatientAdded={async () => {
          const updated = await window.api.getPatients();
          setPatients(updated);
        }}
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Картотека пацієнтів</h2>
        <button style={styles.button} onClick={() => setShowAddForm(true)}>➕ Додати пацієнта</button>
      </div>

      <input
        style={styles.input}
        type="text"
        placeholder="Пошук за ПІБ"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
      />

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Прізвище</th>
            <th style={styles.th}>Ім'я</th>
            <th style={styles.th}>По-батькові</th>
            <th style={styles.th}>Рік народження</th>
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
                  {p.last_name}
                </button>
              </td>
              <td style={styles.td}>{p.first_name}</td>
              <td style={styles.td}>{p.patronymic}</td>
              <td style={styles.td}>{new Date(p.dob).getFullYear()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
