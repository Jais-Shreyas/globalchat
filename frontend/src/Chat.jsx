import React, { useEffect, useState, useRef } from 'react'
import Input from './Input';
import Edit from './Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SwipeUpIcon from '@mui/icons-material/SwipeUp';
export default function Chat({ dark, user }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [message, setMessage] = useState([]);
  const [scroll, setScroll] = useState(true);
  const admin = import.meta.env.VITE_ADMIN;
  const toggleScroll = () => {
    setScroll(!scroll);
  }
  useEffect(() => {
    fetch(`${backendUrl}/chat`)
      .then(response => response.json())
      .then(data => {
        setMessage(data)
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
            const lastEntry = message[message.length - 1];
            if (data.length && lastEntry && (lastEntry.createdAt).toLowerCase() !== (data[data.length - 1].createdAt).toLowerCase()) {
              setMessage(data);
            }
          });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [scroll, message]);
  const insertMessage = (msg, id = null) => {
    if (!isEditing.id) {
      fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ message: msg, username: user })
      })
      setMessage([...message, { message: msg, user: { username: user }, createdAt: time() }]);
    } else {
      fetch(`${backendUrl}/chat/${id}?_method=PATCH`, {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ message: msg })
      });
      toggleEditing(null, null)
    }
  }
  const visible = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom()
  }, [message]);

  const deleteChat = (id) => {
    if (id) {
      fetch(`${backendUrl}/chat/${id}?_method=DELETE`, {
        method: "POST"
      });
      setMessage(message.filter(msg => msg._id !== id));
    }
  }
  const [isEditing, setEditing] = useState({ id: null, msg: null });
  const toggleEditing = (id, msg) => {
    setEditing({ id, msg });
  }
  const curDate = time().slice(0,12);
  return (<>
    <div style={{ border: `5px solid ${dark ? 'white' : 'black'}`, borderRadius: '1rem', height: 'calc(100vh - 7.5rem)', overflowY: 'auto', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '3rem', marginTop: '0rem', padding: '1rem 1rem' }} className={`container ${dark ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      {message.map((msg, i) => {
        const style = msg.user.username === user ? {
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
          <div key={msg._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'right' }}>
            {(msg.user.username === user) &&
              <div className="dropdown">
                <p className="btn btn-secondary dropdown-toggle mx-2" style={{ backgroundColor: 'transparent', color: dark ? 'white' : 'black', border: 'none' }} type="button" data-bs-toggle="dropdown" aria-expanded="false">
                </p>
                <ul className="dropdown-menu">
                  <button className='dropdown-item btn d-inline' style={{ minWidth: '6rem' }} onClick={() => toggleEditing(msg._id, msg.message)}><EditIcon />Edit message</button>
                  <button className='dropdown-item btn d-inline text-danger' style={{ minWidth: '6rem' }} onClick={() => deleteChat(msg._id)}><DeleteIcon />Delete message</button>
                </ul>
              </div>
            }
            <div key={msg._id} style={style} className={`${msg.user.username === user ? 'user' : 'notuser'} ${dark ? 'bg-light text-dark' : 'bg-dark text-light'} mt-0`}>
              <small style={{ cursor: 'pointer', color: 'grey', textAlign: msg.user.username === user ? 'right' : 'left', display: 'block' }}>
                {'  '}{msg.user.username === user ? 'You' : msg.user.username}{'  '}
                {'\n'}
              </small>
              <div style={{ fontFamily: 'inherit' }}>{msg.message}</div>
              <small style={{ fontSize: '0.5rem', lineHeight: '0', color: 'grey', display: 'block', textAlign: 'right', marginTop: '0.5rem' }}>{msg.createdAt.slice(0, 12) === curDate ? msg.createdAt.slice(12) : msg.createdAt}</small>
            </div>  
            {(user === admin && msg.user.username !== admin) && <p className='d-inline text-danger' onClick={() => deleteChat(msg._id)}><DeleteIcon /></p>}
          </div>
        )
      })}
      <div key='scrollchat' style={{ position: "fixed", top: '4.5rem', marginRight: 'auto' }}>
        <button onClick={toggleScroll} className={`btn btn-${scroll ? 'success' : 'danger'} btn-sm`}>
          <SwipeUpIcon />{scroll ? 'Stop' : 'Start'} Auto Scroll
        </button>
      </div>
      <div key='endref' ref={messagesEndRef} />
      {!isEditing.id ?
        <Input dark={dark} user={user} insertMessage={insertMessage} scroll={scroll} toggleScroll={toggleScroll} />
        :
        <Edit dark={dark} user={user} insertMessage={insertMessage} id={isEditing} />
      }
    </div >
  </>
  )
}
