import { useEffect, useState } from "react";
import { Contact } from "../types/contact";
import { createGroup, createNewContact } from "../helpers/chatHelper";
import { Link } from "react-router-dom";
import { Add, ArrowBack, ArrowForward, GroupAdd, PersonAdd, SendRounded } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { useContacts } from "../contexts/ContactContext";

type ContactPanelProps = {
  dark: boolean;
  isMobile: boolean;
  setMobileView: (view: 'contacts' | 'chat') => void;
  focusRef: React.RefObject<HTMLTextAreaElement> | null;
}

export default function ContactPanel({ dark, isMobile, setMobileView, focusRef }: ContactPanelProps) {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const { contacts, activeContact, setActiveContact } = useContacts();

  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);
  const [addContactName, setAddContactname] = useState<string>('');

  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>('');
  const [groupContactUsers, setGroupContactUsers] = useState<string[]>([]);

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
    const alert = await createNewContact(addContactName);
    if (alert.type === 'success') {
      setSearchContact('');
      setIsAddingContact(false);
    }
    showAlert(alert);
  }

  const handleCreateGroup = async () => {
    if (!groupName) {
      showAlert({ type: 'danger', message: 'Group name is required' });
      return;
    }
    const alert = await createGroup(groupContactUsers, groupName);
    if (alert.type === 'success') {
      setGroupContactUsers([]);
      setIsCreatingGroup(false);
    }
    showAlert(alert);
  }

  const formatMessageTime = (date?: string | Date) => {
    if (!date) return '';

    const d = new Date(date);
    const now = new Date();

    const isToday = d.toLocaleDateString() === now.toLocaleDateString();

    return isToday
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { day: '2-digit', month: 'short', year: (d.getFullYear !== now.getFullYear ? 'numeric' : undefined) });
  };

  return (
    <div
      id='contact-sidebar'
      className={`flex-column ${dark ? 'text-light' : 'text-dark'} `}
      style={{
        border: isMobile ? '' : `1px solid ${dark ? 'white' : 'black'}`,
        borderRadius: '1rem',
        height: `calc(100dvh - 4rem)`,
        padding: '1rem 0.5rem 0 0.5rem',
      }}
    >
      {isCreatingGroup &&
        <>
          <div className={`d-flex align-items-center my-1`}>
            <button
              className={`btn btn-sm btn-outline-light border-0`}
              onClick={() => {
                setIsCreatingGroup(false);
                setGroupContactUsers([]);
              }}
            ><ArrowBack /></button>
            <h4 className="ms-2 my-auto">New Group</h4>
          </div>
          <div
            style={{
              overflowY: 'auto',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              maxHeight: 'calc(100dvh - 7.5rem)',
              flexGrow: 1
            }}
          >
            <div className="mb-2">
              <div className="d-flex gap-1 mb-2">
                <input
                  placeholder="Enter the group name"
                  className="form-control"
                  type="text" value={groupName} onChange={(e) => { setGroupName(e.target.value) }} />
                <button
                  className="btn btn-success"
                  disabled={groupContactUsers.length === 0}
                  onClick={handleCreateGroup}
                  title="Create a group with the selected users"
                ><ArrowForward /></button>
              </div>
              <h5 className="d-flex justify-content-between align-items-center">Selected Contacts:</h5>
              <div className="d-flex flex-wrap border rounded px-2" style={{ minHeight: '1.7rem' }}
                title="Selected a contact from below list"
              >
                {groupContactUsers.map((username) => (
                  <div key={username}>{username}&nbsp;</div>
                ))}
              </div>
            </div>
            <div
              style={{
                overflowY: 'auto',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                maxHeight: 'calc(100dvh - 15rem)',
                flexGrow: 1
              }}
            >

              {contacts.map((contact) => (
                contact.username &&
                <div
                  key={contact.username}
                  className={`form-check fs-4 align-items-center ${contact.type !== 'private' ? 'd-none' : ''}`}
                >
                  <label className="form-check-label w-100 text-truncate" htmlFor={contact.username!}
                    style={{ cursor: 'pointer' }}
                  >
                    {contact.name} (@{contact.username})
                  </label>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={contact.username}
                    id={contact.username!}
                    style={{ cursor: 'pointer' }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGroupContactUsers((prev) => [...prev, contact.username!]);
                      } else {
                        setGroupContactUsers((prev) => prev.filter(u => u !== contact.username));
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>}

      {isAddingContact &&
        <>
          <div className={`d-flex align-items-center my-1`}>
            <button
              className={`btn btn-sm btn-outline-light border-0`}
              onClick={() => {
                setAddContactname('');
                setIsAddingContact(false);
              }}
            ><ArrowBack /></button>
            <h4 className="ms-2 my-auto">New Chat</h4>
          </div>
          <div className='mb-2 mt-2 d-flex flex-row'>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username"
              value={addContactName}
              onChange={(e) => setAddContactname(e.target.value)}
            />
          </div>
          <button
            className="btn btn-success w-100"
            onClick={handleCreateContact}
          >
            Add to Contacts <SendRounded />
          </button>
        </>
      }

      {
        !isAddingContact && !isCreatingGroup &&
        <>
          <div className={`d-flex justify-content-between align-items-center my-1`}>
            <h3>Contacts</h3>
            <div className="d-flex gap-2">
              <div className="dropdown">
                <button className="btn btn-success" type="button" data-bs-toggle="dropdown" aria-expanded={false}>
                  <Add />
                </button>
                <ul className="bg-transparent dropdown-menu dropdown-menu-end m-0 p-0">
                  <button
                    className={`py-2 dropdown-item text-light btn btn-outline-${dark ? 'light' : 'dark'}`}
                    style={{
                      border: '1px solid white',
                      backgroundColor: dark ? '#343a40' : '#e9ecef',
                    }}
                    onClick={() => setIsAddingContact(true)}
                    title="Add a New Contact"
                  ><PersonAdd /> New contact</button>
                  <button
                    className={`py-2 dropdown-item text-light btn btn-outline-${dark ? 'light' : 'dark'}`}
                    style={{
                      border: '1px solid white',
                      backgroundColor: dark ? '#343a40' : '#e9ecef',
                    }}
                    onClick={() => setIsCreatingGroup(true)}
                    title="Create Group Chat"
                  ><GroupAdd /> New group</button>
                </ul>
              </div>
            </div>
          </div>
          <div className='mb-2 d-flex flex-row'>
            <input
              id='SearchContactsInput'
              type="text"
              className="form-control"
              placeholder="Search contacts . . ."
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
            />
          </div>
          <div
            style={{
              overflowY: 'auto',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              maxHeight: 'calc(100dvh - 11rem)',
              flexGrow: 1
            }}
          >
            {(searchContact ? filteredContacts : contacts).map((contact) => (
              <div
                key={contact.conversationId}
                className='d-flex border-bottom'
                style={{
                  color: dark ? 'white' : 'black',
                  backgroundColor: activeContact?.conversationId === contact.conversationId ? (dark ? '#343a40' : '#e9ecef') : 'transparent'
                }}>
                <Link to={contact.type === 'private' ? `/profile/${contact.username}` : `/conversation/${contact.conversationId}`}
                  className="d-flex">
                  <img
                    src={contact.photoURL || (contact.type === 'global' ? '/GlobalChatDP.png' : contact.type === 'group' ? '/defaultGroupDP.png' : '/defaultDP.jpg')}
                    alt={contact.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '0.5rem',
                      marginTop: '0.75rem',
                      marginBottom: '0.75rem',
                      marginLeft: '0.5rem',
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/defaultDP.jpg";
                    }}
                  />
                </Link>
                <div className={`d-flex flex-column p-2 rounded`}
                  onClick={() => selectContact(contact)}
                  style={{
                    cursor: 'pointer',
                    width: 'calc(100% - 70px)'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-truncate"
                      style={{
                        width: 'calc(100%)',
                      }}
                      title={`@${contact.username ? contact.username : 'group chat'}`}
                    >
                      {contact.name}</h5>
                    {contact.lastMessage && (
                      <div className="text-muted flex-shrink-0"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {formatMessageTime(contact.lastMessage?.sentAt)}
                      </div>
                    )}
                  </div>
                  {contact.lastMessage && (
                    <div>
                      <div
                        className="mb-0 text-truncate me-2 text-muted"
                        title={contact.lastMessage.message}
                      >
                        {contact.lastMessage.username === user?.username ? 'You' : contact.lastMessage.name}
                        {': '}
                        {contact.lastMessage.deletedAt ?
                          (contact.lastMessage.username === user?.username ?
                            (<p className="d-inline">⊘ <i>You deleted this message</i></p>) :
                            (<p className="d-inline">⊘ <i>This message was deleted</i></p>)
                          ) :
                          (
                            contact.lastMessage.message
                          )}
                      </div>

                    </div>
                  )}
                </div>
              </div>
            ))}
            {(searchContact) &&
              <>
                {filteredContacts.length === 0 &&
                  <p>No such contacts found.</p>}
              </>
            }
          </div>
        </>
      }
    </div >
  )
}