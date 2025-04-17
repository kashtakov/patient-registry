export {};

declare global {
  interface Window {
    api: {
      getPatients: () => Promise<Patient[]>;
      addPatient: (patient: Omit<Patient, 'id'>) => Promise<{ success: boolean }>;
      deletePatient: (id: number) => Promise<{ success: boolean }>;
      updatePatient: (patient: Patient) => Promise<{ success: boolean }>;
      uploadFile: (id: number) => Promise<{ success: boolean; path?: string }>;
      getAttachments: (id: number) => Promise<
        { id: number; patient_id: number; filename: string; path: string }[]
      >;
      openFile: (path: string) => Promise<{ success: boolean }>;
    };
  }

  type Patient = {
    id: number;
    name: string;
    dob: string;
    diagnosis: string;
    status: string;
  };
}
