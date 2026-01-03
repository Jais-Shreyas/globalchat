import { useEffect, useState, useRef, act } from 'react'
import Input from './Input';
import type { User } from './types/user';
import type { Alert } from './types/alert';
import type { Contact } from './types/contact';
import type { Message } from './types/Message';
import ContactPanel from './ContactPanel';
import ChatWindow from './ChatWindow';

type ChatProps = {
  wsRef: React.RefObject<WebSocket | null>;
  dark: boolean;
  user: User | null;
  showAlert: (alert: Alert) => void;
}

export default function Chat({ wsRef, dark, user, showAlert }: ChatProps) {
  // if Chat.tsx loads, it means user is logged in, and is not null
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const focusRef = useRef<HTMLTextAreaElement | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([{ message: 'Loading messages...', username: 'System', name: 'System', createdAt: new Date(), _id: '0' }]);
  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');

    const listener = (e: MediaQueryListEvent) => { setIsMobile(e.matches); };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const [mobileView, setMobileView] = useState<'contacts' | 'chat'>('contacts');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (activeContact === null) return;
        const response = await fetch(`${backendUrl}/chats/${activeContact.conversationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        });
        let data = await response.json();
        if (!response.ok) {
          showAlert({ type: 'danger', message: data.message || 'Failed to fetch messages' });
          return;
        }
        if (!Array.isArray(data) || data.length === 0) {
          data = [{ message: 'No messages yet. Start the conversation!', username: 'System', name: 'System', createdAt: new Date(), _id: '0' }];
        }
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        showAlert({ type: 'danger', message: 'Error fetching messages' });
      }
    }
    fetchMessages();
  }, [activeContact]);

  useEffect(() => {
    if (!wsRef.current) return;
    wsRef.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_MESSAGE') {
        const { message, username, name, createdAt, messageId, conversationId } = data;
        if (activeContact && conversationId === activeContact.conversationId) {
          setMessages((prevMessages) => [...prevMessages, { message, username, name, createdAt, _id: messageId }]);
        }
      } else if (data.type === 'UPDATE_MESSAGE') {
        const { message, messageId } = data;
        if (activeContact && data.conversationId === activeContact.conversationId) {
          setMessages((prevMessages) => prevMessages.map(msg => msg._id === messageId ? { ...msg, message } : msg));
        }
      } else if (data.type === 'DELETE_MESSAGE') {
        const { messageId, conversationId } = data;
        if (activeContact && conversationId === activeContact.conversationId) {
          setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== messageId));
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

  const [inputMessage, setInputMessage] = useState<{ msg: string, _id: string | null }>({ msg: '', _id: null });
  const insertMessage = () => {
    try {
      if (!inputMessage._id) {
        wsRef.current?.send(JSON.stringify({ type: 'NEW_MESSAGE', message: inputMessage.msg, conversationId: activeContact?.conversationId }));
      } else {
        wsRef.current?.send(JSON.stringify({ type: 'UPDATE_MESSAGE', message: inputMessage.msg, messageId: inputMessage._id, conversationId: activeContact?.conversationId }));
      }
      setInputMessage({ msg: '', _id: null });
    } catch (e) {
      console.error(e);
      showAlert({ type: 'danger', message: 'Could not send message' });
    }
  }
  const deleteChat = async (_id: string) => {
    try {
      wsRef.current?.send(JSON.stringify({ type: 'DELETE_MESSAGE', messageId: _id, conversationId: activeContact?.conversationId }));
    } catch (e) {
      console.error(e);
      showAlert({ type: 'danger', message: 'Could not delete message' });
    }
  };
  useEffect(() => {
    setInputMessage({ msg: '', _id: null });
  }, [activeContact]);

  return (
    <div className='d-flex'>
      {isMobile ?
        (mobileView === 'contacts' ?
          <ContactPanel dark={dark} contacts={contacts} isMobile={isMobile} setMobileView={setMobileView} setContacts={setContacts} activeContact={activeContact} setActiveContact={setActiveContact} focusRef={focusRef} showAlert={showAlert} />
          :
          <>
            <ChatWindow user={user} dark={dark} focusRef={focusRef} isMobile={isMobile} setMobileView={setMobileView} activeContact={activeContact} messages={messages} setInputMessage={setInputMessage} deleteChat={deleteChat} />
            <Input dark={dark} focusRef={focusRef} activeContact={activeContact} inputMessage={inputMessage} setInputMessage={setInputMessage} insertMessage={insertMessage} />
          </>
        )
        : <>
          <ContactPanel dark={dark} contacts={contacts} isMobile={isMobile} setMobileView={setMobileView} setContacts={setContacts} activeContact={activeContact} setActiveContact={setActiveContact} focusRef={focusRef} showAlert={showAlert} />
          <ChatWindow user={user} dark={dark} focusRef={focusRef} isMobile={isMobile} setMobileView={setMobileView} activeContact={activeContact} messages={messages} setInputMessage={setInputMessage} deleteChat={deleteChat} />
          <Input dark={dark} focusRef={focusRef} activeContact={activeContact} inputMessage={inputMessage} setInputMessage={setInputMessage} insertMessage={insertMessage} />
        </>
      }
    </div>
  )
}
