import { useEffect, useState } from "react";
import { Contact } from "./types/contact";
import { createNewContact } from "./helpers/chatHelper";
import { Alert } from "./types/alert";
import { apiFetch } from "./helpers/fetchHelper";
import { PrivateUser } from "./types/user";
import { Link } from "react-router-dom";

type ContactPanelProps = {
  dark: boolean;
  user: PrivateUser | null;
  contacts: Contact[];
  isMobile: boolean;
  setMobileView: (view: 'contacts' | 'chat') => void;
  setContacts: (contact: Contact[]) => void;
  activeContact: Contact | null;
  setActiveContact: (contact: Contact | null) => void;
  focusRef: React.RefObject<HTMLTextAreaElement> | null;
  // setMessages: (messages: Message[]) => void;
  showAlert: (alert: Alert) => void;
}

export default function ContactPanel({ dark, user, contacts, isMobile, setMobileView, setContacts, activeContact, setActiveContact, focusRef, showAlert }: ContactPanelProps) {
  const [searchContact, setSearchContact] = useState<string>('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);

  const selectContact = (contact: Contact) => {
    setSearchContact('');
    setActiveContact(contact);
    if (isMobile) {
      setMobileView('chat');
    }
    focusRef?.current?.focus();
  }

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
        if (!activeContact) {
          const globalChat = data.find((contact: Contact) => contact.type === 'global');
          if (globalChat) {
            setActiveContact(globalChat);
          }
        }
      } catch (error: any) {
        console.error('Error fetching contacts:', error);
        showAlert({ type: 'danger', message: error.message || 'Could not fetch contacts' });
      }
    }
    fetchContacts();
  }, []);


  useEffect(() => {
    if (!searchContact) {
      setFilteredContacts(contacts);
    } else {
      const lowerSearch = searchContact.toLowerCase();
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(lowerSearch) ||
        (contact.username && contact.username.toLowerCase().includes(lowerSearch))
      );
      setFilteredContacts(filtered);
    }
  }, [searchContact, contacts]);

  const handleCreateContact = async () => {
    const alert = await createNewContact(searchContact);
    if (alert.type === 'success') {
      setSearchContact('');
    }
    showAlert(alert);
  }

  return (
    <div
      id='contact-sidebar'
      className={`flex-column ${isMobile ? 'w-100' : 'col-md-4'} ${dark ? 'text-light' : 'text-dark'} `}
      style={{
        border: `5px solid ${dark ? 'white' : 'black'}`,
        borderRadius: '1rem',
        height: `calc(100vh - ${isMobile ? '4rem' : '7rem'})`,
        maxWidth: (isMobile ? '100%' : '600px'),
        padding: '1rem 1rem'
      }}

    >
      <h3>Contacts</h3>
      <div className='mb-2 d-flex flex-row'>
        <input
          type="text"
          className="form-control"
          placeholder="Search Contacts or Start New"
          value={searchContact}
          onChange={(e) => setSearchContact(e.target.value)}
        />
      </div>
      <div
        style={{
          overflowY: 'auto',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          maxHeight: 'calc(100vh - 14rem)',
          flexGrow: 1
        }}
      >
        {(searchContact ? filteredContacts : contacts).map((contact) => (
          <div
            key={contact.conversationId}
            className='d-flex border-bottom w-100'
            style={{ color: dark ? 'white' : 'black', backgroundColor: activeContact?.conversationId === contact.conversationId ? (dark ? '#343a40' : '#e9ecef') : 'transparent' }}>
            <Link to={`/profile/${contact.username || 'global'}`}
              className="d-flex">
              <img
                className="mx-2 my-3"
                src={contact.photoURL || '/defaultDP.jpg'}
                alt={contact.name}
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginRight: '1rem' }}
              />
            </Link>
            <div className={`d-flex align-items-center p-2 rounded w-100`}
              onClick={() => selectContact(contact)}
              style={{ cursor: 'pointer' }}
            >
              <div className="text-trucate w-100">
                <h5 className="mb-0">{contact.name} (<small>@{contact.type === 'global' ? 'global' : contact.username}</small>)</h5>
                {contact.lastMessage && (
                  <div className="d-flex justify-content-between align-items-center">
                    <p className="mb-0 text-truncate text-light me-2" style={{ maxWidth: '75%' }}>
                      {contact.lastMessage.username === user?.username ? 'You' : contact.lastMessage.name}
                      {': '}
                      {contact.lastMessage.message}
                    </p>

                    <small className="text-muted flex-shrink-0">
                      {new Date(contact.lastMessage.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {(searchContact) &&
          <>
            {filteredContacts.length === 0 &&
              <p>No contacts found.</p>}
            <button
              className='btn btn-success my-1'
              onClick={handleCreateContact}
            >Start a new conversation</button>
          </>
        }
      </div>
    </div>
  )
}