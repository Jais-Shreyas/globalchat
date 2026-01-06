import React, { useEffect, useState } from 'react'
import { redirect, useNavigate, useParams } from 'react-router-dom';
import { User } from './types/user';
import { Alert } from './types/alert';
import { createNewContact } from './helpers/chatHelper';
import { apiFetch } from './helpers/fetchHelper';
import { set } from 'mongoose';

type ProfileProps = {
  user: User | null;
  changeUser: (user: User | null) => void;
  showAlert: (alert: Alert) => void;
}

export default function Profile({ user, changeUser, showAlert }: ProfileProps) {
  const { username } = useParams();
  const navigate = useNavigate();
  type userDataProps = {
    name: string;
    username: string;
    email: string;
    _id: string;
    photoURL: string | null;
  }
  const [userData, setUserData] = useState<userDataProps>({ name: "---", username: "---", email: "", _id: "", photoURL: null });
  const [originalData, setOriginalData] = useState<userDataProps>({ name: "---", username: "---", email: "", _id: "", photoURL: null });
  const [isEditing, toggleEditing] = useState(false);
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
  const handleSubmit = async () => {
    try {
      if (!userData.name || !userData.username || !userData.email) {
        return showAlert({ type: 'danger', message: 'Fields can\'t be empty.' })  
      }

      console.log("Submitting updated data: ", userData);
      const data = await apiFetch(`/profile`, {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      console.log("Profile Update Response: ", data);

      toggleEditing(false);
      setUserData(data.user);
      setOriginalData(data.user);
      showAlert({ type: 'success', message: 'Details updates successfully' });

    } catch (e: any) {
      console.error("Profile Update Error: ", e)
      showAlert({ type: 'danger', message: e.message || 'Could not update profile' });
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
                    alt="Generic placeholder image" className="img-fluid" style={{
                      width: '180px',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '10px'
                    }} />
                </div>
                <div className="flex-grow-1 ms-3">
                  {isEditing ? (
                    <div className="mt-3">
                      <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input
                          className="form-control"
                          type="text"
                          name="name"
                          value={userData.name}
                          onChange={handleCredUpdate}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                          className="form-control"
                          type="text"
                          name="username"
                          value={userData.username}
                          onChange={handleCredUpdate}
                        />
                      </div>

                      {userData.email && (
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            className="form-control"
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleCredUpdate}
                          />
                        </div>
                      )}
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

                  {user?.email === userData.email && !isEditing &&
                    <p className="mb-2">Want to update your details? Click on Edit Profile</p>
                  }
                  {isEditing &&
                    <div className="mb-2">
                      <div className="d-flex pt-1">
                        <button
                          className="btn btn-danger me-1 flex-grow-1"
                          onClick={handleCancel}
                        >Cancel</button>
                        <button className="btn btn-success flex-grow-1" onClick={handleSubmit}>Save</button>
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