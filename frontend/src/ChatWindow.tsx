import Markdown from "react-markdown";
import { Link, useNavigate } from "react-router-dom";
import { Message } from "./types/Message";
import { Contact } from "./types/contact";
import { PrivateUser } from "./types/user";
import { useEffect, useRef, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwipeUpIcon from '@mui/icons-material/SwipeUp';

type ChatWindowProps = {
  user: PrivateUser | null;
  dark: boolean;
  focusRef: React.RefObject<HTMLTextAreaElement> | null;
  isMobile: boolean;
  setMobileView: (view: 'contacts' | 'chat') => void;
  messages: Message[];
  activeContact: Contact | null;
  setInputMessage: (inputMessage: { msg: string; _id: string | null }) => void;
  deleteChat: (_id: string) => void;
}

export default function ChatWindow({ user, dark, focusRef, isMobile, setMobileView, activeContact, messages, setInputMessage, deleteChat }: ChatWindowProps) {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [scroll, setScroll] = useState(true);
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
  }, [messages, scroll]);
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

  return (
    <div
      id='chat-window'
      style={{
        width: isMobile ? '100vw' : '70vw',
        border: isMobile ? '' : `1px solid ${dark ? 'white' : 'black'}`,
        borderTop: '1px solid white',
        borderRadius: isMobile ? '' : '1rem',
        height: `calc(100dvh - 6.5rem)`,
      }}
    >
      {activeContact && (
        <div
          className="w-100 d-flex align-items-center justify-content-between"
          style={{ borderBottom: '1px solid white' }}
        >
          <div className="d-flex">
            {isMobile &&
              <button
                type='button'
                className="btn btn-link d-md-none"
                onClick={() => setMobileView('contacts')}
                style={{
                  color: dark ? 'white' : 'black',
                  backgroundColor: 'transparent'
                }}
              > <ArrowBackIcon /></button>}
            <div className="d-flex"
              onClick={() => {
                navigate(`${activeContact.type === 'private' ? `/profile/${activeContact.username}` : `/conversation/${activeContact.conversationId}`}`);
              }}
              style={{ cursor: 'pointer' }}
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
              <h3 className={`py-2 mb-0 text-white text-truncate`}
                style={{ maxWidth: '40dvw' }}>
                {activeContact.name}
                {activeContact.username ? ` (@${activeContact.username})` : ''}
              </h3>
            </div>
          </div>
          <div key='scrollchat' className="px-2" >
            <button onClick={toggleScroll} className={`btn btn-${scroll ? 'success' : 'danger'} btn-sm`}>
              <SwipeUpIcon />Auto Scroll
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          borderRadius: '1rem',
          height: 'calc(100dvh - 10rem)',
          overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none',
          padding: '1rem 1rem 0 1rem',
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
              {(msg.username === user!.username) &&
                <div className="dropdown">
                  <button className="btn btn-secondary dropdown-toggle mx-2" style={{ backgroundColor: 'transparent', color: 'rgb(127, 127, 127)', border: 'none' }} type="button" data-bs-toggle="dropdown" aria-expanded={false}>
                  </button>
                  <ul className="dropdown-menu">
                    <button className='dropdown-item btn d-inline' style={{ minWidth: '6rem' }} onClick={() => { setInputMessage({ msg: msg.message, _id: msg._id }); focusRef?.current?.focus() }}><EditIcon />Edit message</button>
                    <button className='dropdown-item btn d-inline text-danger' style={{ minWidth: '6rem' }} onClick={() => deleteChat(msg._id)}><DeleteIcon />Delete message</button>
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
                  fontFamily: 'inherit'
                }}>
                  <Markdown children={(msg.message)} />
                </div>
                <small style={{ fontSize: '0.5rem', lineHeight: '0', color: 'grey', display: 'block', textAlign: 'right', marginTop: '-0.7rem' }}>{showTime(msg.createdAt)}</small>
              </div>
            </div>
          )
        })}
        <div key='endref' ref={messagesEndRef} />
      </div >
    </div>
  )
}