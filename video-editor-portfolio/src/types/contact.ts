export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export interface CreateContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}