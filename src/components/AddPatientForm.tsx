import React from 'react';
import { Patient } from '../global.d';

const styles = {
  container: {
    padding: 20,
    fontFamily: 'sans-serif',
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
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    maxWidth: 500,
    margin: '0 auto',
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20,
  },
};

interface AddPatientFormProps {
  onClose: () => void;
  onPatientAdded: () => void;
}

export default function AddPatientForm({ onClose, onPatientAdded }: AddPatientFormProps) {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Додати нового пацієнта</h2>
      <form
        style={styles.form}
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);

          const data = {
            last_name: formData.get("last_name") as string,
            first_name: formData.get("first_name") as string,
            patronymic: formData.get("patronymic") as string,
            dob: formData.get("dob") as string,
            diagnosis: formData.get("diagnosis") as string,
            status: formData.get("status") as string,
            rank: formData.get("rank") as string,
            battalion: formData.get("battalion") as string,
            unit: formData.get("unit") as string,
            position: formData.get("position") as string,
          };

          await window.api.addPatient(data);
          onPatientAdded();
          form.reset();
          onClose();
        }}
      >
        <input name="last_name" placeholder="Прізвище" required style={styles.input} />
        <input name="first_name" placeholder="Ім'я" required style={styles.input} />
        <input name="patronymic" placeholder="По-батькові" required style={styles.input} />
        <input name="dob" type="date" placeholder="Дата народження" required style={styles.input} />
        <input name="diagnosis" placeholder="Діагноз" required style={styles.input} />
        <input name="status" placeholder="Статус" required style={styles.input} />
        <input name="rank" placeholder="Звання" required style={styles.input} />
        <input name="battalion" placeholder="Батальйон" required style={styles.input} />
        <input name="unit" placeholder="Підрозділ" required style={styles.input} />
        <input name="position" placeholder="Посада" required style={styles.input} />
        
        <div style={styles.buttonContainer}>
          <button type="submit" style={styles.button}>Додати</button>
          <button type="button" onClick={onClose} style={styles.button}>Скасувати</button>
        </div>
      </form>
    </div>
  );
} 