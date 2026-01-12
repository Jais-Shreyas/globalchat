import { createContext, useContext, useEffect, useState } from "react";
import { Message } from "../types/Message";
import { useContacts } from "./ContactContext";
import { apiFetch } from "../helpers/fetchHelper";
import { useAlert } from "./AlertContext";
import { useWebSocket } from "./WebSocketContext";
import { useAuth } from "./AuthContext";

type MessagesContextType = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

const MessagesContext = createContext<MessagesContextType | null>(null);

export const MessagesProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();
  const { setContacts, activeContact, setActiveContact } = useContacts();
  const { showAlert } = useAlert();
  const { wsRef } = useWebSocket();

  useEffect(() => {
    if (activeContact === null) return;
    const fetchMessages = async () => {
      try {
        let data = await apiFetch(`/chats/${activeContact.conversationId}`);
        if (!Array.isArray(data) || data.length === 0) {
          data = [{ message: 'No messages yet. Start the conversation!', username: 'System', name: 'System', createdAt: new Date(), _id: '0' }];
        }
        setMessages(data);
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        showAlert({ type: 'danger', message: error.message || 'Could not fetch messages' });
      }
    }
    fetchMessages();
    return () => { setMessages([]); };
  }, [activeContact]);

  useEffect(() => {
    if (!wsRef.current) return;
    wsRef.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_MESSAGE') {
        const { message, username, name, createdAt, deletedAt, messageId, conversationId } = data;
        setContacts((prevContacts) => {
          const updatedContacts = prevContacts.map(contact => {
            if (contact.conversationId === conversationId) {
              return { ...contact, lastMessage: { message, name, username, sentAt: createdAt, deletedAt } };
            }
            return contact;
          });
          updatedContacts.sort((a, b) => {
            const dateA = a.lastMessage ? new Date(a.lastMessage.sentAt).getTime() : 0;
            const dateB = b.lastMessage ? new Date(b.lastMessage.sentAt).getTime() : 0;
            return dateB - dateA;
          });
          return updatedContacts;
        });
        if (activeContact && conversationId === activeContact.conversationId) {
          setMessages((prevMessages) => [...prevMessages, { message, username, name, createdAt, editedAt: null, deletedAt: null, _id: messageId, userId: data.userId }]);
        }
      } else if (data.type === 'UPDATE_MESSAGE') {
        const { message, messageId, editedAt } = data;
        if (activeContact && data.conversationId === activeContact.conversationId) {
          setMessages((prevMessages) => prevMessages.map(msg => msg._id === messageId ? { ...msg, message, editedAt } : msg));
        }
      } else if (data.type === 'DELETE_MESSAGE') {
        const { messageId, conversationId, message, deletedAt } = data;
        if (activeContact && conversationId === activeContact.conversationId) {
          setMessages((prevMessages) => prevMessages.map(msg => msg._id === messageId ? { ...msg, message, deletedAt } : msg));
        }
      } else if (data.type === 'NEW_CONTACT') {
        const { contact, creatorId } = data;
        if (user?._id === creatorId) {
          showAlert({ type: 'success', message: `New contact "${contact.name}" added!` });
          setActiveContact(contact);
        }
        setContacts((prevContacts) => [contact, ...prevContacts]);
      } else if (data.type === 'ERROR') {
        showAlert({ type: 'danger', message: data.message });
      } else {
        console.log("Unknown message type:", data);
      }
    };
  }, [wsRef.current, activeContact]);

  return (
    <MessagesContext.Provider value={{ messages, setMessages }}>
      {children}
    </MessagesContext.Provider>
  );
}

export const useMessages = (): MessagesContextType => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
}