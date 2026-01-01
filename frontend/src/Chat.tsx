import { useEffect, useState, useRef } from 'react'
import Input from './Input';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SwipeUpIcon from '@mui/icons-material/SwipeUp';
import Markdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { User } from './types/user';
import { Alert } from './types/alert';

type ChatProps = {
  wsRef: React.RefObject<WebSocket | null>;
  dark: boolean;
  user: User | null;
  showAlert: (alert: Alert) => void;
}

export default function Chat({ wsRef, dark, user, showAlert }: ChatProps) {
  // if Chat loads, it means user is logged in, and is not null
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  type Message = {
    message: string;
    username: string;
    name: string;
    createdAt: Date;
    _id: string;
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const [scroll, setScroll] = useState(true);
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

  useEffect(() => {
    if (!wsRef.current) return;
    wsRef.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_MESSAGE') {
        const { message, username, name, createdAt, _id } = data;
        setMessages((prevMessages) => [...prevMessages, { message, username, name, createdAt, _id }]);
      } else if (data.type === 'UPDATE_MESSAGE') {
        const { message, _id } = data;
        setMessages((prevMessages) => prevMessages.map(msg => msg._id === _id ? { ...msg, message } : msg));
      } else if (data.type === 'DELETE_MESSAGE') {
        setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== data._id));
      } else if (data.type === 'ERROR') {
        showAlert({ type: 'danger', message: data.message });
      } else {
        console.log("Unknown message type:", data);
      }
    };
  }, [wsRef.current]);
  const time = () => {
    const date = new Date();
    return date.toDateString().slice(4) + ' ' + date.toLocaleTimeString();
  }

  type InputMsgProp = {
    msg: string;
    _id: string | null;
  }
  const [inputMessage, setInputMessage] = useState<InputMsgProp>({ msg: '', _id: null });
  const insertMessage = () => {
    // if _id is null, it's a new message
    try {
      if (!inputMessage._id) {
        wsRef.current?.send(JSON.stringify({ type: 'NEW_MESSAGE', message: inputMessage.msg }));
      } else {
        wsRef.current?.send(JSON.stringify({ type: 'UPDATE_MESSAGE', message: inputMessage.msg, messageId: inputMessage._id }));
      }
      setInputMessage({ msg: '', _id: null });
    } catch (e) {
      console.log(e);
      showAlert({ type: 'danger', message: 'Could not send message' });
    }
  }
  const deleteChat = async (_id: string) => {
    try {
      wsRef.current?.send(JSON.stringify({ type: 'DELETE_MESSAGE', messageId: _id }));
    } catch (e) {
      console.log(e);
      showAlert({ type: 'danger', message: 'Could not delete message' });
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages]);

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
                  <button className="btn btn-secondary dropdown-toggle mx-2" style={{ backgroundColor: 'transparent', color: dark ? 'white' : 'black', border: 'none' }} type="button" data-bs-toggle="dropdown" aria-expanded={false}>
                  </button>
                  <ul className="dropdown-menu">
                    <button className='dropdown-item btn d-inline' style={{ minWidth: '6rem' }} onClick={() => setInputMessage({ msg: msg.message, _id: msg._id })}><EditIcon />Edit message</button>
                    <button className='dropdown-item btn d-inline text-danger' style={{ minWidth: '6rem' }} onClick={() => deleteChat(msg._id)}><DeleteIcon />Delete message</button>
                  </ul>
                </div>
              }
              <div key={msg._id} style={style} className={`${msg.username === user.username ? 'user' : 'notuser'} ${dark ? 'bg-light text-dark' : 'bg-dark text-light'} mt-0`}>
                <Link to={`/profile/${msg.username}`} style={{ textDecoration: 'none', color: 'grey', textAlign: msg.username !== user.username ? 'left' : 'left', display: 'block' }}>
                  {'- '}{msg.username === user.username ? 'You' : msg.name}{'  '}
                  {'\n'}
                </Link>
                <div style={{ fontFamily: 'inherit' }}>
                  <Markdown children={(msg.message)} />
                </div>
                <small style={{ fontSize: '0.5rem', lineHeight: '0', color: 'grey', display: 'block', textAlign: 'right', marginTop: '-0.7rem' }}>{showTime(msg.createdAt)}</small>
              </div>
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
