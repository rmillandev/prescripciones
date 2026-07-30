export interface Doctor {
  id: string;
  specialty: string | null;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

export interface Patient {
  id: string;
  birthDate: string | null;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}
