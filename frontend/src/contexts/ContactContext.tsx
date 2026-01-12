import { createContext, useContext, useEffect, useState } from "react";
import type { Contact } from "../types/contact";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../helpers/fetchHelper";
import { useAlert } from "./AlertContext";

type ContactContextType = {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  activeContact: Contact | null;
  setActiveContact: React.Dispatch<React.SetStateAction<Contact | null>>;
};

const ContactContext = createContext<ContactContextType | null>(null);

export const ContactProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await apiFetch('/contacts');
        const sortedData = data.sort((a: Contact, b: Contact) => {
          const dateA = a.lastMessage ? new Date(a.lastMessage.sentAt).getTime() : 0;
          const dateB = b.lastMessage ? new Date(b.lastMessage.sentAt).getTime() : 0;
          return dateB - dateA;
        });
        setContacts(sortedData);
      } catch (error: any) {
        console.error('Error fetching contacts:', error);
        showAlert({ type: 'danger', message: error.message || 'Could not fetch contacts' });
      }
    }
    fetchContacts();
  }, []);

  return (
    <ContactContext.Provider value={{ contacts, setContacts, activeContact, setActiveContact }}>
      {children}
    </ContactContext.Provider>
  );
}

export const useContacts = (): ContactContextType => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error("useContacts must be used within a ContactProvider");
  }
  return context;
}