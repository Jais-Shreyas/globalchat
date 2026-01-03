import Markdown from "react-markdown";
import { Link, useNavigate } from "react-router-dom";
import { Message } from "./types/Message";
import { Contact } from "./types/contact";
import { User } from "./types/user";
import { useEffect, useRef, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwipeUpIcon from '@mui/icons-material/SwipeUp';

type ChatWindowProps = {
  user: User | null;
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

  return (
    <div
      id='chat-window'
      className='flex-column w-100'
      style={{
        border: `5px solid white`,
        borderRadius: '1rem',
        height: `calc(100vh - 7rem)`,
      }}
    >
      {activeContact && (
        <div
          className="w-100 d-flex align-items-center"
          style={{ borderBottom: '1px solid white' }}
        >
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

          <h3 className={`flex-grow-1 py-2 mb-0 text-white ${!isMobile ? 'text-center' : 'text-start'}`}
            style={{
              cursor: 'pointer'
            }}
            onClick={() => {
              if (activeContact.type === 'global') return;
              navigate(`/profile/${activeContact.username}`)
            }}
          >
            {activeContact.name}
            {activeContact.username ? ` (@${activeContact.username})` : ''}
          </h3>
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
          height: 'calc(100vh - 11.4rem)',
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
                {activeContact?.type !== 'private' && <Link to={`/profile/${msg.username}`} style={{ textDecoration: 'none', color: 'grey', textAlign: msg.username !== user!.username ? 'left' : 'left', display: 'block' }}>
                  {'- '}{msg.username === user!.username ? 'You' : msg.name}{'  '}
                  {'\n'}
                </Link>}
                <div style={{ fontFamily: 'inherit' }}>
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