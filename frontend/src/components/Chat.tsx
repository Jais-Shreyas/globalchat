import ContactPanel from './ContactPanel';
import ChatWindow from './ChatWindow';
import { useEffect, useState, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext';
import { useContacts } from '../contexts/ContactContext';
import '../styles/Chat.css'

export default function Chat() {
  const { dark } = useTheme();
  const { activeContact } = useContacts();
  const focusRef = useRef<HTMLTextAreaElement | null>(null);

  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');

    const listener = (e: MediaQueryListEvent) => { setIsMobile(e.matches); };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const [mobileView, setMobileView] = useState<'contacts' | 'chat'>('contacts');

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
            <ContactPanel dark={dark} isMobile={isMobile} setMobileView={setMobileView} focusRef={focusRef} />
          </div>
          :
          <div style={{ width: '100vw' }}>
            <ChatWindow dark={dark} focusRef={focusRef} isMobile={isMobile} setMobileView={setMobileView} />
          </div>
        )
        : <>
          <div className=''
            style={{
              width: `${contactPanelWidth}px`,
            }}>
            <ContactPanel dark={dark} isMobile={isMobile} setMobileView={setMobileView} focusRef={focusRef} />
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
          {activeContact ?
            <div
              className=''
              style={{
                width: `calc(100dvw - ${contactPanelWidth}px)`,
                height: `calc(100dvh - 14rem)`,
              }}
            >
              <ChatWindow dark={dark} focusRef={focusRef} isMobile={isMobile} setMobileView={setMobileView} />
            </div> :
            <div className='d-flex flex-grow-1 align-items-center justify-content-center text-white'
              style={{
                height: `calc(100dvh - 4rem)`,
                border: '1px solid white',
                borderRadius: '1rem'
              }}
            >
              <h3 className='text-center'>Select a contact to start messaging</h3>
            </div>}
        </>
      }
    </div>
  )
}
