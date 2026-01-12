import Input from "./Input";
import Markdown from "react-markdown";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwipeUpIcon from '@mui/icons-material/SwipeUp';
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { MoreVert } from "@mui/icons-material";
import { Message } from "../types/Message";
import { apiFetch } from "../helpers/fetchHelper";
import { useAuth } from "../contexts/AuthContext";
import { useContacts } from "../contexts/ContactContext";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useMessages } from "../contexts/MessagesContext";
import { useAlert } from "../contexts/AlertContext";

type ChatWindowProps = {
  dark: boolean;
  focusRef: React.RefObject<HTMLTextAreaElement> | null;
  isMobile: boolean;
  setMobileView: (view: 'contacts' | 'chat') => void;
}

export default function ChatWindow({ dark, focusRef, isMobile, setMobileView }: ChatWindowProps) {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const { activeContact, setActiveContact } = useContacts();
  const { wsRef } = useWebSocket();
  const { messages } = useMessages();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [scroll, setScroll] = useState(true);
  const [inputHeight, setInputHeight] = useState<number>(72);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  const toggleScroll = () => {
    setScroll(!scroll);
  }

  useEffect(() => {
    if (scroll) {
      scrollToBottom()
    }
  }, [messages, scroll, inputHeight]);

  useEffect(() => {
    setScroll(true);
    setInputMessage({ msg: '', _id: null });
  }, [activeContact]);

  const [inputMessage, setInputMessage] = useState<{ msg: string, _id: string | null }>({ msg: '', _id: null });
  const sendMessage = () => {
    try {
      if (!inputMessage._id) {
        wsRef.current?.send(JSON.stringify({ type: 'NEW_MESSAGE', message: inputMessage.msg.trim(), conversationId: activeContact?.conversationId }));
      } else {
        wsRef.current?.send(JSON.stringify({ type: 'UPDATE_MESSAGE', message: inputMessage.msg.trim(), messageId: inputMessage._id, conversationId: activeContact?.conversationId }));
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

  const showTime = (date: Date) => {
    const GetTime = () => {
      const date = new Date();
      return date.toDateString().slice(4) + ' ' + date.toLocaleTimeString();
    }
    const curDate = GetTime().slice(0, 11);
    const d = new Date(date);
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString().slice(4) !== curDate) {
      return d.toDateString().slice(4) + ' ' + time;
    } else {
      return time;
    }
  }

  useEffect(() => {
    if (isMobile) return;
    focusRef?.current?.focus();
  }, []);

  const isMessageDeletable = (msg: Message) => {
    const now = new Date();
    const createdAt = new Date(msg.createdAt);
    const diffInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  }

  const isMessageEditable = (msg: Message) => {
    const now = new Date();
    const createdAt = new Date(msg.createdAt);
    const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return diffInMinutes <= 60;
  }

  const leaveGroup = async () => {
    if (!activeContact) return;
    try {
      await apiFetch(`/group/${activeContact.conversationId}/leave`, {
        method: 'POST',
      });
      navigate('/');
      setMobileView('contacts');
    } catch (error: any) {
      showAlert({ type: 'danger', message: error.message || 'Could not leave group' });
    }
  }

  if (!activeContact) {
    return null;
  }


  return (
    <>
      <div
        id='chat-window'
        style={{
          border: isMobile ? '' : `1px solid ${dark ? 'white' : 'black'}`,
          borderTop: '1px solid white',
          borderRadius: isMobile ? '' : '1rem',
          width: '100%',
        }}
      >
        <div
          id='chat-window-header'
          className="d-flex align-items-center justify-content-between"
          style={{
            borderBottom: '1px solid white',
            width: '100%',
          }}
        >
          <div className="d-flex" style={{ width: '80%' }}>
            <button
              type='button'
              className="btn btn-link"
              onClick={() => { setActiveContact(null); setMobileView('contacts'); }}
              style={{
                color: dark ? 'white' : 'black',
                backgroundColor: 'transparent'
              }}
            >
              <ArrowBackIcon />
            </button>
            <div className="d-flex"
              onClick={() => {
                navigate(`${activeContact.type === 'private' ? `/profile/${activeContact.username}` : `/conversation/${activeContact.conversationId}`}`);
              }}
              style={{
                cursor: 'pointer',
                alignItems: 'center',
                minWidth: '0',
              }}
            >
              <img
                className="align-self-center mx-2 my-1"
                src={activeContact.photoURL || (activeContact.type === 'private' ? "/defaultDP.jpg" : "/defaultGroupDP.png")}
                alt={activeContact.name}
                style={{ width: '2rem', height: '2rem', borderRadius: '50%', objectFit: 'cover', marginRight: '1rem' }}
                onError={(e) => {
                  e.currentTarget.src = "/defaultDP.jpg";
                }}
              />
              <h3 className={`py-2 mb-0 text-white text-truncate`}>
                {activeContact.name}
                {activeContact.username ? ` (@${activeContact.username})` : ''}
              </h3>
            </div>
          </div>
          <div>
            <button className="btn text-light" type="button" data-bs-toggle="dropdown" aria-expanded={false}>
              <MoreVert />
            </button>
            <ul className="dropdown-menu dropdown-menu-end m-0 p-0 border">
              <button
                className={`py-2 dropdown-item text-light border-bottom btn btn-outline-${dark ? 'light' : 'dark'}`}
                onClick={toggleScroll}
                style={{
                  backgroundColor: dark ? '#293037' : '#e9ecef',
                }}
                title="Toggle Auto Scroll"
              >
                <SwipeUpIcon />Auto Scroll {scroll ? 'On' : 'Off'}
              </button>
              {(activeContact.type === 'group') && <button
                className={`py-2 dropdown-item text-light border-bottom btn btn-outline-${dark ? 'light' : 'dark'}`}
                style={{
                  backgroundColor: dark ? '#293037' : '#e9ecef',
                }}
                onClick={() => navigate(`/conversation/${activeContact.conversationId}`)}
                title="About the group"
              >Group Info</button>
              }
              {(activeContact.type === 'group') && <button
                className={`py-2 dropdown-item text-light border-bottom btn btn-outline-${dark ? 'light' : 'dark'}`}
                style={{
                  backgroundColor: dark ? '#293037' : '#e9ecef',
                }}
                onClick={leaveGroup}
                title="Leave the group"
              >Exit group</button>}
            </ul>
          </div>
        </div>

        <div
          style={{
            borderRadius: '1rem',
            overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none',
            padding: '1rem 1rem 0 1rem',
            height: `calc(100dvh - 7.5rem - ${inputHeight}px)`,
          }}
        >
          {messages.map((msg, i) => {
            const style = msg.username === user!.username ? {
              whiteSpace: 'pre-wrap',
              margin: '0.5rem 0 0.5rem 0',
              maxWidth: '70%',
              width: 'fit-content',
              display: 'inline-block',
              padding: '0.3rem 1rem 0.5em 1rem',
              borderRadius: '1rem 0rem 1rem 1rem',
            } : {
              whiteSpace: 'pre-wrap',
              margin: '0.5rem auto 0.5rem 0',
              maxWidth: '70%',
              width: 'fit-content',
              display: 'inline-block',
              padding: '0.3rem 1rem 0.5em 1rem',
              borderRadius: '0rem 1rem 1rem 1rem',
            }
            return (
              <div key={msg._id + 's'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
                {((msg.username === user!.username) && (!msg.deletedAt)) &&
                  <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle mx-2" style={{ backgroundColor: 'transparent', color: 'rgb(127, 127, 127)', border: 'none' }} type="button" data-bs-toggle="dropdown" aria-expanded={false}>
                    </button>
                    <ul className="dropdown-menu">
                      <button
                        disabled={!isMessageEditable(msg)}
                        className='dropdown-item btn d-inline'
                        style={{ minWidth: '6rem' }}
                        onClick={() => {
                          setInputMessage({ msg: msg.message, _id: msg._id });
                          focusRef?.current?.focus()
                        }}
                      >
                        <EditIcon />Edit message
                      </button>
                      <button
                        disabled={!isMessageDeletable(msg)}
                        className='dropdown-item btn d-inline text-danger'
                        style={{ minWidth: '6rem' }}
                        onClick={() => {
                          deleteChat(msg._id)
                        }}
                      >
                        <DeleteIcon />Delete message
                      </button>
                    </ul>
                  </div>
                }
                <div key={msg._id} style={style} className={`${msg.username === user!.username ? 'user' : 'notuser'} ${dark ? 'bg-light text-dark' : 'bg-dark text-light'} mt-0`}>
                  {activeContact?.type !== 'private' &&
                    <Link to={`/profile/${msg.username}`} style={{ textDecoration: 'none', color: 'grey', textAlign: msg.username !== user!.username ? 'left' : 'left', display: 'block' }}>
                      <div
                        className="text-truncate"
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          marginBottom: '-0.3rem',
                          maxWidth: '10rem'
                        }}>
                        {'- '}{msg.username === user!.username ? 'You' : msg.name}
                      </div>
                    </Link>}
                  <div style={{
                    overflowWrap: 'anywhere',
                    fontFamily: 'inherit',
                    color: msg.deletedAt ? 'grey' : (dark ? 'black' : 'white'),
                  }}>
                    <Markdown children={(msg.message)} />
                  </div>
                  <small
                    style={{
                      fontSize: '0.5rem',
                      lineHeight: '0',
                      color: 'grey',
                      display: 'block',
                      textAlign: 'right',
                      marginTop: '-0.7rem'
                    }}
                  >
                    {msg.editedAt && 'Edited '} {showTime(msg.deletedAt ?? msg.createdAt)}
                  </small>
                </div>
              </div>
            )
          })}
          <div key='endref' ref={messagesEndRef} />
        </div >
      </div>
      <Input dark={dark} isMobile={isMobile} focusRef={focusRef} inputMessage={inputMessage} setInputMessage={setInputMessage} sendMessage={sendMessage} setInputHeight={setInputHeight} />
    </>
  )
}