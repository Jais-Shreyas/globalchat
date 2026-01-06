import { Alert } from "../types/alert";
import { apiFetch } from "./fetchHelper";

export const createNewContact = async (username: string): Promise<Alert> => {
  try {
    console.log("Creating new contact with username: ", username);
    const data = await apiFetch(`/contacts/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'private', username })
    });
    console.log("Create Contact Response: ", data);
    return ({ type: 'success', message: data.message || 'Contact created successfully' });
  } catch (e: any) {
    console.error(e);
    return ({ type: 'danger', message: e.message || 'Could not create contact' });
  }
};