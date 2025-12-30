import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

export default function Profile({ user, changeUser, dark, showAlert }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { username } = useParams();
  const [userData, setUserData] = useState({ name: "", username: "", email: "" });
  const [newData, setNewData] = useState({ name: "", username: "", email: "" });
  const [isEditing, toggleEditing] = useState(false);
  useEffect(() => {
    // console.log("User", user);
    fetch(`${backendUrl}/profile/${username}/${user.id}`, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        // console.log(data);
        if (data.isValid) {
          setUserData({ name: data.user.name, username: data.user.username, email: (data.user.email) });
          setNewData({ name: data.user.name, username: data.user.username, email: (data.user.email) });
        } else {
          showAlert('danger', data.message);
        }
      })
      .catch(e => {
        console.log(e);
        showAlert('danger', e.message);
      })
  }, []);
  const handleCredUpdate = (e) => {
    setNewData({ ...newData, [e.target.name]: e.target.value })
  }
  const handleCancel = () => {
    setNewData(userData);
    toggleEditing(false);
  }
  const handleSubmit = async () => {
    if (!newData.name || !newData.username) {
      return showAlert('danger', 'Fields can\'t be empty.')
    }
    const response = await fetch(`${backendUrl}/profile/${user.id}?_method=PATCH`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ oldUsername: userData.username, newUsername: newData.username, newName: newData.name })
    });
    try {
      const json = await response.json();
      if (json.isValid) {
        showAlert('success', 'Details updates successfully');
        setUserData(newData);
        changeUser({ username: json.user.username, name: json.user.name, id: json.user._id, email: json.user.email });
        toggleEditing(false);
      } else {
        showAlert('danger', json.message);
      }
    } catch (e) {
      showAlert('danger', json.message);
    }
  }
  return (
    <div>
      <div className="row" style={{ marginTop: '5rem' }}>
        <div className="col col-md-6 offset-md-3">
          <div className="card shadow card-body">
            <h3 className="text-center mt-3">Profile</h3>
            <div className="container my-3">
              <div className="row">
                <div className="col-sm-4">
                  <p className="mb-0">Full Name</p>
                </div>
                <div className="col-sm-8">
                  {isEditing ?
                    <input type="text" name='name' value={newData.name} onChange={handleCredUpdate} />
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
                    <input type="text" name='username' value={newData.username} onChange={handleCredUpdate} />
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
            {user.username === userData.username && <div>
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