import { Alert } from "../types/alert";
import { apiFetch } from "./fetchHelper";

export const createNewContact = async (username: string): Promise<Alert> => {
  try {
    const data = await apiFetch(`/contacts/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'private', username })
    });
    return ({ type: 'success', message: data.message || 'Contact created successfully' });
  } catch (e: any) {
    console.error(e);
    return ({ type: 'danger', message: e.message || 'Could not create contact' });
  }
};

export const createGroup = async (usernames: string[], groupName: string): Promise<Alert> => {
  try {
    const data = await apiFetch(`/contacts/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'group', usernames, name: groupName })
    });
    return ({ type: 'success', message: data.message });
  } catch (e: any) {
    console.error(e);
    return ({ type: 'danger', message: e.message || 'Group creation failed' });
  }
};