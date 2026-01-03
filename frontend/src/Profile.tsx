import React, { useEffect, useState } from 'react'
import { redirect, useNavigate, useParams } from 'react-router-dom';
import { User } from './types/user';
import { Alert } from './types/alert';
import { createNewContact } from './helpers/chatHelper';
import { red } from 'colors';

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

      } catch (err: any) {
        if (err instanceof Error) {
          showAlert({ type: "danger", message: err.message });
        } else {
          console.error(err);
          showAlert({
            type: "danger",
            message: "Internal error occurred...",
          });
        }
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
  // return (
  //   <div className='mt-4'>
  //     <div className="d-flex justify-content-center align-items-center"
  //       style={{
  //         minHeight: '80vh',
  //       }} >
  //         <div className='d-flex card justify-content-center mx-3'
  //           style={{
  //           }}>
  //           <img
  //             src={userData.photoURL ?? "/defaultDP.jpg"}
  //             alt="Profile Picture"
  //             className="rounded-circle img-fluid"
  //             style={{
  //               boxShadow: '0 0 20px rgba(0,0,0,0.3)',
  //               width: '200px',
  //               height: '200px',
  //               objectFit: 'cover',
  //               borderRadius: '100px'
  //             }}
  //             onError={(e) => {
  //               showAlert({ type: 'warning', message: 'Failed to load profile picture, showing default.' });
  //               e.currentTarget.onerror = null;
  //               e.currentTarget.src = "/defaultDP.jpg";
  //             }}
  //           />
  //         </div>
  //       <div className=" shadow card card-body" style={{ minWidth: '300px', maxWidth: '600px', width: '50%' }}>
  //         <h3 className="text-center mt-3">Profile</h3>
  //         <div className="container">
  //           <div className='form-group'>
  //             {isEditing &&
  //               <div className="row mt-3 mb-3">
  //                 <div className="col-sm-4">
  //                   <p className="mb-0">Profile URL</p>
  //                 </div>
  //                 <div className="col-sm-8">
  //                   <input
  //                     className='form-control'
  //                     type='text' name='photoURL' value={userData.photoURL || ''} onChange={handleCredUpdate} />
  //                 </div>
  //               </div>
  //             }
  //           </div>
  //           <hr />
  //           <div className="row">
  //             <div className="col-sm-4">
  //               <p className="mb-0">Full Name</p>
  //             </div>
  //             <div className="col-sm-8">
  //               {isEditing ?
  //                 <input
  //                   className='form-control'
  //                   type="text" name='name' value={userData.name} onChange={handleCredUpdate} />
  //                 :
  //                 <p className="text-muted mb-0">{userData.name}</p>
  //               }
  //             </div>
  //           </div>
  //           <hr />
  //           <div className="row">
  //             <div className="col-sm-4">
  //               <p className="mb-0">Username</p>
  //             </div>
  //             <div className="col-sm-8">
  //               {isEditing ?
  //                 <input
  //                   className='form-control'
  //                   type="text" name='username' value={userData.username} onChange={handleCredUpdate} />
  //                 :
  //                 <p className="text-muted mb-0">{userData.username}</p>
  //               }
  //             </div>
  //           </div>
  //           <hr />
  //           {userData.email && <>
  //             <div className="row">
  //               <div className="col-sm-4">
  //                 <p className="mb-0">Email</p>
  //               </div>
  //               <div className="col-sm-8">
  //                 <p className="text-muted mb-0">{userData.email}</p>
  //               </div>
  //             </div>
  //           </>
  //           }
  //         </div>
  //         {user?.email === userData.email && <div>
  //           {isEditing ?
  //             <div className='mx-4 mt-4'>
  //               <button className="btn btn-danger" onClick={handleCancel}>Cancel</button>
  //               <button className="btn btn-success mx-4" onClick={handleSubmit}>Save</button>
  //             </div>
  //             :
  //             <button className="btn btn-primary mx-4 mt-4" onClick={() => toggleEditing(true)}>Edit Credentials</button>
  //           }
  //         </div>
  //         }
  //       </div>
  //     </div>
  //   </div>
  // )
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
                            value={userData.email}
                            disabled
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