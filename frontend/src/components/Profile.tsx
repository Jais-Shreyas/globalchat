import React, { useEffect, useState } from 'react'
import { redirect, useNavigate, useParams } from 'react-router-dom';
import { PrivateUser } from '../types/user';
import { createNewContact } from '../helpers/chatHelper';
import { apiFetch } from '../helpers/fetchHelper';
import { ArrowBack, Image, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  if (!username) {
    redirect('/');
  }
  const { user, setUser } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<PrivateUser>({ name: "---", username: "---", email: "", _id: "", photoURL: null });
  const [originalData, setOriginalData] = useState<PrivateUser>({ name: "---", username: "---", email: "", _id: "", photoURL: null });
  const [isEditing, toggleEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch(`/profile/${username}`);
        setUserData(data.user);
        setOriginalData(data.user);
      } catch (err: any) {
        showAlert({ type: 'danger', message: err.message || 'Could not fetch profile' });
        navigate('/');
      }
    };

    fetchProfile();
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
    if (!userData.name.trim()) {
      return { valid: false, message: 'Name cannot be empty' };
    }
    if (!userData.username.trim()) {
      return { valid: false, message: 'Username cannot be empty' };
    }
    const validUsernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!validUsernameRegex.test(userData.username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, underscores and dots' };
    }
    return { valid: true };
  }

  const handleSubmit = async () => {
    const validation = validateProfileUpdate();
    if (!validation.valid) {
      showAlert({ type: 'danger', message: validation.message || 'Invalid profile details' });
      return;
    }
    const payload: Partial<PrivateUser> = {};
    if (userData.name !== originalData.name) {
      payload.name = userData.name;
    }
    if (userData.username !== originalData.username) {
      payload.username = userData.username;
    }
    if (userData.photoURL !== originalData.photoURL) {
      payload.photoURL = userData.photoURL;
    }
    if (Object.keys(payload).length === 0) {
      toggleEditing(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await apiFetch(`/profile`, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      toggleEditing(false);
      setUserData(data.user);
      setOriginalData(data.user);
      setUser(data.user);
      showAlert({ type: 'success', message: 'Details updates successfully' });

    } catch (e: any) {
      console.error("Profile Update Error: ", e)
      showAlert({ type: 'danger', message: e.message || 'Could not update profile' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const navigateBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  }

  return (
    <section className="w-100 px-4 py-5" style={{ borderRadius: '.5rem .5rem 0 0' }} >
      <div className="row d-flex justify-content-center">
        <div className="col col-md-9 col-lg-7 col-xl-6">
          <div className="card" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4">
              <button className="btn text-dark" onClick={navigateBack} title='Back'><ArrowBack /></button>
              <div className="d-flex w-100 justify-content-center tex-center mx-1 mb-4 mt-2">
                <div className="flex-shrink-0">
                  <img
                   src={originalData.photoURL || "/defaultDP.jpg"}
                    alt="Profile URL" className="img-fluid" style={{
                      border: '1px solid grey',
                      width: '8rem',
                      height: '8rem',
                      objectFit: 'cover',
                      borderRadius: '10px'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/defaultDP.jpg";
                    }}
                  />
                </div>
                <div className="ms-3 text-truncate">
                  {isEditing ? (
                    <div>
                      <div className="input-group mb-1">
                        <span className="input-group-text" id="basic-addon1"><Person /></span>
                        <input autoFocus value={userData.name} onChange={handleCredUpdate} type="text" name="name" className="form-control" placeholder="Name" aria-label="name" aria-describedby="name" />
                      </div>
                      <div className="input-group mb-1">
                        <span className="input-group-text" id="basic-addon1"><Person /></span>
                        <input autoFocus value={userData.username} onChange={handleCredUpdate} type="text" name="username" className="form-control" placeholder="Username" aria-label="username" aria-describedby="username" />
                      </div>
                      <div className="input-group mb-1">
                        <span className="input-group-text" id="basic-addon1"><Image /></span>
                        <input autoFocus value={userData.photoURL ?? ''} onChange={handleCredUpdate} type="text" name="photoURL" className="form-control" placeholder="Link to the DP image" aria-label="photoURL" aria-describedby="photoURL" />
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
                      className="btn btn-primary flex-grow-1 mx-1"
                      onClick={async () => {
                        const alert = await createNewContact(userData.username);
                        if (alert.type === 'success') {
                          // redirect('/');
                        }
                        showAlert(alert);
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