import { useEffect, useState, useRef } from 'react'
import Input from './Input';
import type { PrivateUser } from './types/user';
import type { Alert } from './types/alert';
import type { Contact } from './types/contact';
import type { Message } from './types/Message';
import ContactPanel from './ContactPanel';
import ChatWindow from './ChatWindow';
import { apiFetch } from './helpers/fetchHelper';

type ChatProps = {
  wsRef: React.RefObject<WebSocket | null>;
  dark: boolean;
  user: PrivateUser | null;
  showAlert: (alert: Alert) => void;
}

export default function Chat({ wsRef, dark, user, showAlert }: ChatProps) {
  // if Chat.tsx loads, it means user is logged in, and is not null
  const focusRef = useRef<HTMLTextAreaElement | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([{ message: 'Loading messages...', username: 'System', userId: '', name: 'System', createdAt: new Date(), editedAt: null, deletedAt: null, _id: '0' }]);
  // const [displayingUser, setDisplayingUser] = useState<PublicUser | null>(null);

  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');

    const listener = (e: MediaQueryListEvent) => { setIsMobile(e.matches); };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const [mobileView, setMobileView] = useState<'contacts' | 'chat'>('contacts');

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
        const { message, username, name, createdAt, messageId, conversationId } = data;
        setContacts((prevContacts) => {
          const updatedContacts = prevContacts.map(contact => {
            if (contact.conversationId === conversationId) {
              return { ...contact, lastMessage: { message, name, username, sentAt: createdAt } };
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

  const [contactPanelWidth, setContactPanelWidth] = useState<number>(330);
  const newPanelWidth = useRef<number>(330);

  useEffect(() => {
    const width = window.innerWidth;
    if (width < 900) {
      setContactPanelWidth(300);
    } else if (width < 1200) {
      setContactPanelWidth(350);
    } else {
      setContactPanelWidth(480);
    }
  }, []);


  const isResizing = useRef<boolean>(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isResizing.current = true;
    newPanelWidth.current = contactPanelWidth;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isResizing.current) return;

    let newWidth = e.clientX;

    const min = 300;
    const max = window.innerWidth - 400;

    if (newWidth < min) newWidth = min;
    if (newWidth > max) newWidth = max;

    newPanelWidth.current = newWidth;

    // Optional: move resizer visually without committing state
    (e.currentTarget as HTMLElement).style.left = `${newWidth - 5}px`;
    (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isResizing.current) return;

    isResizing.current = false;
    setContactPanelWidth(newPanelWidth.current);

    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    (e.target as HTMLElement).style.backgroundColor = 'transparent';
  };

  return (
    <div className='d-flex'>
      {isMobile ?
        (mobileView === 'contacts' ?
          <div style={{ width: '100vw' }}>
            <ContactPanel dark={dark} user={user} contacts={contacts} isMobile={isMobile} setMobileView={setMobileView} setContacts={setContacts} activeContact={activeContact} setActiveContact={setActiveContact} focusRef={focusRef} showAlert={showAlert} contactPanelWidth={contactPanelWidth} />
          </div>
          :
          <div style={{ width: '100vw' }}>
            <ChatWindow user={user} dark={dark} wsRef={wsRef} focusRef={focusRef} isMobile={isMobile} setMobileView={setMobileView} activeContact={activeContact} messages={messages}  showAlert={showAlert} />
          </div>
        )
        : <>
          <div className=''
            style={{
              width: `${contactPanelWidth}px`,
            }}>
            <ContactPanel dark={dark} user={user} contacts={contacts} isMobile={isMobile} setMobileView={setMobileView} setContacts={setContacts} activeContact={activeContact} setActiveContact={setActiveContact} focusRef={focusRef} showAlert={showAlert} contactPanelWidth={contactPanelWidth} />
          </div>
          <div
            style={{
              height: 'calc(100dvh - 4rem)',
              width: '5px',
              cursor: 'col-resize',
              position: 'absolute',
              left: `${contactPanelWidth - 5}px`,
              top: '4rem',
              backgroundColor: 'transparent',
              touchAction: 'none',
              zIndex: 10,
            }}
            className="resizer"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
          <div
            className=''
            style={{
              width: `calc(100dvw - ${contactPanelWidth}px)`,
              height: 'calc(100dvh - 14rem)',
            }}
          >
            <ChatWindow user={user} dark={dark} wsRef={wsRef} focusRef={focusRef} isMobile={isMobile} setMobileView={setMobileView} activeContact={activeContact} messages={messages} showAlert={showAlert} />
          </div>
        </>
      }
    </div>
  )
}
