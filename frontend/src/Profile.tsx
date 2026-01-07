import React, { useEffect, useState } from 'react'
import { redirect, useNavigate, useParams } from 'react-router-dom';
import { PrivateUser } from './types/user';
import { Alert } from './types/alert';
import { createNewContact } from './helpers/chatHelper';
import { apiFetch } from './helpers/fetchHelper';
import { Person } from '@mui/icons-material';

type ProfileProps = {
  user: PrivateUser | null;
  changeUser: (user: PrivateUser | null) => void;
  showAlert: (alert: Alert) => void;
}

export default function Profile({ user, changeUser, showAlert }: ProfileProps) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<PrivateUser>({ name: "---", username: "---", email: "", _id: "", photoURL: null });
  const [originalData, setOriginalData] = useState<PrivateUser>({ name: "---", username: "---", email: "", _id: "", photoURL: null });
  const [isEditing, toggleEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const fetchProfile = async (user: string) => {
      try {
        const data = await apiFetch(`/profile/${user}`);
        setUserData(data.user);
        setOriginalData(data.user);
      } catch (err: any) {
        console.error("Profile Fetch Error: ", err);
        showAlert({ type: 'danger', message: err.message || 'Could not fetch profile' });
        navigate('/');
      }
    };

    fetchProfile(username!);
  }, [username]);

  const handleCredUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value })
  }
  const handleCancel = () => {
    setUserData(originalData);
    toggleEditing(false);
  }

  type ValidationResult = {
    valid: boolean;
    message?: string;
  };

  const validateProfileUpdate = (): ValidationResult => {
    const name = userData.name.trim();
    const username = userData.username.trim();
    if (!name) return { valid: false, message: 'Name is required' };
    if (!username) return { valid: false, message: 'Username is required' };
    if (username.includes(' ')) {
      return { valid: false, message: 'Username cannot contain spaces' };
    }
    return { valid: true };
  }

  const handleSubmit = async () => {
    try {
      if (!userData.name || !userData.username || !userData.email) {
        return showAlert({ type: 'danger', message: 'Fields can\'t be empty.' })
      }
      const validation = validateProfileUpdate();
      if (!validation.valid) {
        showAlert({ type: 'danger', message: validation.message || 'Invalid profile details' });
        return;
      }
      setIsSubmitting(true);
      const data = await apiFetch(`/profile`, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      toggleEditing(false);
      setUserData(data.user);
      setOriginalData(data.user);
      showAlert({ type: 'success', message: 'Details updates successfully' });

    } catch (e: any) {
      console.error("Profile Update Error: ", e)
      showAlert({ type: 'danger', message: e.message || 'Could not update profile' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-100 px-4 py-5" style={{ borderRadius: '.5rem .5rem 0 0' }} >
      <div className="row d-flex justify-content-center">
        <div className="col col-md-9 col-lg-7 col-xl-6">
          <div className="card" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4">
              <div className="d-flex">
                <div className="flex-shrink-0">
                  <img src={userData.photoURL || "/defaultDP.jpg"}
                    alt="Profile URL" className="img-fluid" style={{
                      width: '180px',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '10px'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/defaultDP.jpg";
                    }}
                  />
                </div>
                <div className="flex-grow-1 ms-3 text-truncate">
                  {isEditing ? (
                    <div className="mt-3">
                      <div className="input-group mb-3">
                        <span className="input-group-text" id="basic-addon1"><Person /></span>
                        <input autoFocus value={userData.name} onChange={handleCredUpdate} type="text" name="name" className="form-control" placeholder="Username" aria-label="identifier" aria-describedby="identifier" />
                      </div>
                      <div className="input-group mb-3">
                        <span className="input-group-text" id="basic-addon1"><Person /></span>
                        <input autoFocus value={userData.username} onChange={handleCredUpdate} type="text" name="username" className="form-control" placeholder="Username" aria-label="identifier" aria-describedby="identifier" />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <h5 className="mb-1">{userData.name}</h5>
                      <p className="mb-2 text-muted">@{userData.username}</p>

                      {userData.email && (
                        <h6 className="text-muted">{userData.email}</h6>
                      )}
                    </div>
                  )}

                  {isEditing &&
                    <div className="mb-2">
                      <div className="d-flex pt-1">
                        <button
                          className="btn btn-danger me-1 flex-grow-1"
                          onClick={handleCancel}
                        >Cancel</button>
                        <button className="btn btn-success flex-grow-1" disabled={isSubmitting} onClick={handleSubmit}>Save</button>
                      </div>
                    </div>
                  }
                  {user?.email === userData.email && !isEditing ?
                    <div className="d-flex pt-1">
                      <button data-mdb-button-init data-mdb-ripple-init
                        className="btn btn-outline-primary me-1 flex-grow-1"
                        onClick={() => toggleEditing(true)}
                      >Edit Profile</button>
                    </div>
                    :
                    !isEditing &&
                    <button type='button'
                      className="btn btn-primary flex-grow-1"
                      onClick={async () => {
                        const alert = await createNewContact(userData.username);
                        if (alert.type === 'success') {
                          redirect('/');
                        }
                      }}
                    >Add to Contacts</button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 