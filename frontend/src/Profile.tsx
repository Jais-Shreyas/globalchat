import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { User } from './types/user';
import { Alert } from './types/alert';

type ProfileProps = {
  user: User | null;
  changeUser: (user: User | null) => void;
  showAlert: (alert: Alert) => void;
}

export default function Profile({ user, changeUser, showAlert }: ProfileProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
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
  const [isEditing, toggleEditing] = useState(false);
  useEffect(() => {
    const fetchProfile = async (user: string) => {
      try {
        const response = await fetch(`${backendUrl}/profile/${user}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Profile fetch failed")
        }

        const { name, username, email, photoURL, _id } = data.user;
        setUserData({ name, username, email, photoURL, _id });
        
      } catch (err) {
        
        console.error(err);
        showAlert({
          type: "danger",
          message: "Internal error occurred...",
        });
      }
    };

    fetchProfile(username!);
  }, [username]);

  const handleCredUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value })
  }
  const handleCancel = () => {
    toggleEditing(false);
    navigate(`/profile/${username}`);
  }
  const handleSubmit = async () => {
    try {
      if (!userData.name || !userData.username) {
        return showAlert({ type: 'danger', message: 'Fields can\'t be empty.' })
      }
      const response = await fetch(`${backendUrl}/profile?_method=PATCH`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ...userData })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      const { name, username, photoURL } = data.user;
      changeUser({ ...user!, name, username, photoURL });

      toggleEditing(false);
      showAlert({ type: 'success', message: 'Details updates successfully' });

      navigate(`/profile/${username}`);

    } catch (e: any) {
      console.error("Profile Update Error: ", e)
      if (e instanceof TypeError) {
        showAlert({ type: 'danger', message: "Unable to reach server, please try again later." });
      } else if (e instanceof Error) {
        showAlert({ type: 'danger', message: e.message });
      } else {
        showAlert({ type: 'danger', message: "Something went wrong" })
      }
    }
  }
  return (
    <div>
      <div className="row" style={{ marginTop: '5rem' }}>
        <div className="col col-md-6 offset-md-3">
          <div className="card shadow card-body">
            <h3 className="text-center mt-3">Profile</h3>
            <div className="container my-3">
              <div className='row'>
                {isEditing ?
                  <>
                    <div className="col-sm-4">
                      <p className="mb-0">Profile URL</p>
                    </div>
                    <div className="col-sm-8">
                      <input type='text' name='photoURL' value={userData.photoURL || ''} onChange={handleCredUpdate} />
                    </div>
                  </>
                  :
                  <img
                    src={userData.photoURL ?? "/defaultDP.jpg"}
                    alt="Profile Picture"
                    style={{
                      margin: 'auto',
                      maxWidth: '400px',
                      borderRadius: '50%'
                    }}
                    onError={(e) => {
                      showAlert({ type: 'warning', message: 'Failed to load profile picture, showing default.' });
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/defaultDP.jpg";
                    }}
                  />
                }
              </div>
              <hr />
              <div className="row">
                <div className="col-sm-4">
                  <p className="mb-0">Full Name</p>
                </div>
                <div className="col-sm-8">
                  {isEditing ?
                    <input type="text" name='name' value={userData.name} onChange={handleCredUpdate} />
                    :
                    <p className="text-muted mb-0">{userData.name}</p>
                  }
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-sm-4">
                  <p className="mb-0">Username</p>
                </div>
                <div className="col-sm-8">
                  {isEditing ?
                    <input type="text" name='username' value={userData.username} onChange={handleCredUpdate} />
                    :
                    <p className="text-muted mb-0">{userData.username}</p>
                  }
                </div>
              </div>
              {userData.email && <>
                <hr />
                <div className="row">
                  <div className="col-sm-4">
                    <p className="mb-0">Email</p>
                  </div>
                  <div className="col-sm-8">
                    <p className="text-muted mb-0">{userData.email}</p>
                  </div>
                </div>
              </>
              }
            </div>
            {user?.email === userData.email && <div>
              {isEditing ?
                <div className='mx-4'>
                  <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
                  <button className="btn btn-success mx-4" onClick={handleSubmit}>Save</button>
                </div>
                :
                <button className="btn btn-primary mx-4" onClick={() => toggleEditing(true)}>Edit Credentials</button>
              }
            </div>
            }
          </div>
        </div>
      </div>
    </div>
  )
} 