import React, { useEffect, useState, useRef } from 'react'
import Input from './Input';
import Edit from './Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SwipeUpIcon from '@mui/icons-material/SwipeUp';
import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { User } from './types/user';
import { Alert } from './types/alert';

type ChatProps = {
  dark: boolean;
  user: User | null;
  showAlert: (alert: Alert) => void;
}

export default function Chat({ dark, user, showAlert }: ChatProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [messages, setMessages] = useState([{ message: 'Loading...', username: 'Loading...', createdAt: 'Loading...' }]);
  const [scroll, setScroll] = useState(true);
  const admin = import.meta.env.VITE_ADMIN;
  const toggleScroll = () => {
    setScroll(!scroll);
  }
  useEffect(() => {
    fetch(`${backendUrl}/chat`)
      .then(response => response.json())
      .then(data => {
        setMessages(data)
      });
  }, []);
  const time = () => {
    const date = new Date();
    return date.toDateString().slice(4) + ' ' + date.toLocaleTimeString();
  }
  useEffect(() => {
    const interval = setInterval(() => {
      if (scroll) {
        fetch(`${backendUrl}/chat`)
          .then(response => response.json())
          .then(data => {
            const lastEntry = messages[messages.length - 1];
            if (data.length && lastEntry && (lastEntry.createdAt).toLowerCase() !== (data[data.length - 1].createdAt).toLowerCase()) {
              setMessages(data);
            }
          });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [scroll, messages]);
  
  type InputMsgProp = {
    msg: string;
    id: string | null;
  }
  const [inputMessage, setInputMessage] = useState<InputMsgProp>({ msg: '', id: null });
  const toggleEditing = (msg: string, id: string | null) => {
    setInputMessage({ msg, id });
  }

  const insertMessage = (msg: string, id: string | null = null) => {
    if (!inputMessage.id) {
      fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ message: msg, username: user.username, id: user.id, createdAt: time() })
      })
      setMessages([...messages, { message: msg, username: user.username, createdAt: time() }]);
    } else {
      fetch(`${backendUrl}/chat/${id}?_method=PATCH`, {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ message: msg, user_id: user.id })
      });
      const newmsg = messages;
      for (let i = 0; i < newmsg.length; i++) {
        if (newmsg[i]._id === id) {
          newmsg[i].message = msg;
        }
      }
      setMessages(newmsg);
      toggleEditing('', null)
    }
  }
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  const deleteChat = async (id: string) => {
    try {
      fetch(`${backendUrl}/chat/${id}?_method=DELETE`, {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.id })
      })
        .then(response => response.json())
        .then(data => {
          if (!data.isValid) {
            showAlert({ type: 'danger', message: data.message });
            return;
          }
          setMessages(messages.filter(msg => msg._id !== id));
        });
    } catch (e) {
      console.log(e);
      showAlert({ type: 'danger', message: 'Could not delete message' });
    }
  }

  const curDate = time().slice(0, 11);
  const showTime = (date: Date) => {
    const d = new Date(date);
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString().slice(4) !== curDate) {
      return d.toDateString().slice(4) + ' ' + time;
    } else {
      return time;
    }
  }
  return (<>
    {!user
      ?
      "Please login"
      :
      <div style={{ border: `5px solid ${dark ? 'white' : 'black'}`, borderRadius: '1rem', height: 'calc(100vh - 7.5rem)', overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '3rem', marginTop: '0rem', padding: '1rem 1rem' }} className={`container ${dark ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        {messages.map((msg, i) => {
          const style = msg.username === user.username ? {
            whiteSpace: 'pre-wrap',
            margin: '0.5rem 0 0.5rem 0',
            maxWidth: '70%',
            width: 'fit-content',
            display: 'inline-block',
            padding: '0.3rem 1rem 0.5em 1rem',
            borderRadius: '1.5rem 0rem 1.5rem 1.5rem',
          } : {
            whiteSpace: 'pre-wrap',
            margin: '0.5rem auto 0.5rem 0',
            maxWidth: '70%',
            width: 'fit-content',
            display: 'inline-block',
            padding: '0.3rem 1rem 0.5em 1rem',
            borderRadius: '0rem 1.5rem 1.5rem 1.5rem',
          }
          return (
            <div key={msg._id + 'chat'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
              {(msg.username === user.username) &&
                <div className="dropdown">
                  <p className="btn btn-secondary dropdown-toggle mx-2" style={{ backgroundColor: 'transparent', color: dark ? 'white' : 'black', border: 'none' }} type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  </p>
                  <ul className="dropdown-menu">
                    <button className='dropdown-item btn d-inline' style={{ minWidth: '6rem' }} onClick={() => toggleEditing(msg.message, msg._id)}><EditIcon />Edit message</button>
                    <button className='dropdown-item btn d-inline text-danger' style={{ minWidth: '6rem' }} onClick={() => deleteChat(msg._id)}><DeleteIcon />Delete message</button>
                  </ul>
                </div>
              }
              <div key={msg._id} style={style} className={`${msg.username === user.username ? 'user' : 'notuser'} ${dark ? 'bg-light text-dark' : 'bg-dark text-light'} mt-0`}>
                <Link to={`/profile/${msg.username}`} style={{ textDecoration: 'none', color: 'grey', textAlign: msg.username === user ? 'right' : 'left', display: 'block' }}>
                  {'- '}{msg.username === user.username ? 'You' : msg.name}{'  '}
                  {'\n'}
                </Link>
                <div style={{ fontFamily: 'inherit' }}>
                  <Markdown children={(msg.message)} />
                </div>
                <small style={{ fontSize: '0.5rem', lineHeight: '0', color: 'grey', display: 'block', textAlign: 'right', marginTop: '-0.7rem' }}>{showTime(msg.createdAt)}</small>
              </div>
              {(user.email === admin) && <p className='d-inline text-danger' onClick={() => deleteChat(msg._id)}><DeleteIcon /></p>}
            </div>
          )
        })}
        <div key='scrollchat' style={{ position: "fixed", top: '4.5rem', marginRight: 'auto' }}>
          <button onClick={toggleScroll} className={`btn btn-${scroll ? 'success' : 'danger'} btn-sm`}>
            <SwipeUpIcon />{scroll ? 'Stop' : 'Start'} Auto Scroll
          </button>
        </div>
        <div key='endref' ref={messagesEndRef} />
        <Input dark={dark} user={user} inputMessage={inputMessage} setInputMessage={setInputMessage} insertMessage={insertMessage} />
      </div >
    }
  </>
  )
}
