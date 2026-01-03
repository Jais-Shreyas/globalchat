import { Alert } from "../types/alert";

export const createNewContact = async (username: string): Promise<Alert> => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const response = await fetch(`${backendUrl}/contacts/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ type: 'private', username })
    });
    const data = await response.json();
    if (response.ok) {
      return ({ type: 'success', message: 'New conversation started!' });
    } else {
      return ({ type: 'danger', message: data.message });
    }
  } catch (e) {
    console.error(e);
    return ({ type: 'danger', message: 'Could not add contact' });
  }
};