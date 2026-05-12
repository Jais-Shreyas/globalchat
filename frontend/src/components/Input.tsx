import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import { useContacts } from '../contexts/ContactContext';
import { useAlert } from '../contexts/AlertContext';
import '../styles/Input.css'
import { useEffect, useState } from 'react';
import { getOptimizedImageUrl, uploadImage } from '../helpers/fileUpload';
import { CircularProgress } from '@mui/material';

type InputMsgProp = {
  msg: string;
  _id: string | null;
}

type ImageProp = {
  url: string;
  publicId: string;
} | null;

type InputProps = {
  dark: boolean;
  isMobile: boolean;
  focusRef: React.RefObject<HTMLTextAreaElement> | null;
  inputMessage: InputMsgProp;
  setInputMessage: (inputMessage: InputMsgProp) => void;
  image: ImageProp;
  setImage: (image: ImageProp) => void;
  sendMessage: () => void;
  setInputHeight: (height: number) => void;
}

export default function Input({ dark, isMobile, focusRef, inputMessage, setInputMessage, image, setImage, sendMessage, setInputHeight }: InputProps) {
  const { activeContact } = useContacts();
  const { showAlert } = useAlert();
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const handleSend = () => {
    if (!activeContact) return;
    if ((!inputMessage.msg.trim() && !image) || isUploadingImage) {
      return;
    }
    if (inputMessage.msg.length > 100 * 1024) { // 100 KB limit
      showAlert({ type: 'danger', message: 'Message too long. Maximum length is 2048 characters.' });
      return;
    }
    sendMessage();
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isMobile) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const resizeTextArea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    const height = Math.min(180, textarea.scrollHeight);
    textarea.style.height = `${height}px`;
    setInputHeight(height);
  };
  useEffect(() => {
    if (!focusRef?.current) return;
    resizeTextArea(focusRef.current);
  }, [inputMessage.msg]);

  const handleTextAreaUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > 100 * 1024) { // 100 KB limit
      showAlert({ type: 'danger', message: 'Message too long. Maximum length is 2048 characters.' });
      return;
    }
    resizeTextArea(e.target);
    setInputMessage({...inputMessage, msg: value});
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const data = await uploadImage(file);
      setImage({ url: data.url, publicId: data.publicId });

    } catch (err) {
      setImage(null);
      console.error(err);
      showAlert({
        type: "danger",
        message: "Image upload failed",
      });

    } finally {
      setIsUploadingImage(false);
      focusRef?.current?.focus();
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend() }}
        className={`input-group`}
        style={{
          backgroundColor: dark ? '#212529' : 'white',
          position: 'sticky',
          bottom: '0',
        }}
      >
        {image &&
          <div
            className="image-preview"
            style={{
              position: "absolute",
              left: "6px",
              top: "-40px",
              display: "inline",
              zIndex: 10,
            }}
          >
            <img
              src={getOptimizedImageUrl(image.url, 32, 32)}
              alt="preview"
              style={{
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <p className='text-light mb-0' style={{ fontSize: '12px', display: 'inline' }}>
              &nbsp;
              Image attached
              &nbsp;
            </p>

            <button
              type="button"
              aria-label="Close"
              onClick={() => setImage(null)}
              style={{
                top: "4px",
                width: "22px",
                height: "22px",
                border: "none",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>}
        {!image &&
          <label className="upload-btn"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.currentTarget.querySelector("input")?.click();
              }
            }}>
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
            <span className=''>+</span>
          </label>
        }
        <textarea
          id='input'
          ref={focusRef}
          placeholder={`${!activeContact ? 'Select a contact to start chatting' : 'Type your message here...'}`}
          value={inputMessage.msg || ''}
          className={`form-control btn-outline-light ${dark ? 'text-light bg-dark' : 'text-dark bg-light'}`}
          onChange={handleTextAreaUpdate}
          onKeyDown={handleKeyDown}
          aria-label="Your message"
          aria-describedby="button-addon2"
          disabled={!activeContact}
          style={{ maxHeight: '180px', resize: 'none', overflowY: 'auto', scrollbarWidth: 'none' }}
        ></textarea>

        <button
          className={`btn btn-light `}
          type="button" id="button-addon2"
          onClick={handleSend}
          style={{ cursor: `${(!(inputMessage.msg.trim() || image) || !activeContact || isUploadingImage) ? 'not-allowed' : 'pointer'}` }}
          title={!activeContact ? 'Select a contact to start chatting' : (isUploadingImage ? 'Please wait for the image to finish uploading' : (!inputMessage.msg.trim() ? 'Enter a message to send' : 'Send message'))}
        >{ isUploadingImage ? <CircularProgress color="secondary" aria-label="Loading…" /> : (inputMessage._id ? <EditIcon /> : <SendIcon />)}</button>
      </form>
    </div>
  )
}