import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "./helpers/fetchHelper";
import { GroupData } from "./types/GroupData";
import { AddModerator, ArrowBack, Cancel, Close, Edit, Info, PersonAdd, PersonAddAlt1Outlined, PersonAddDisabled, PersonAddOutlined, PersonRemoveOutlined, RemoveModerator, SaveOutlined, Shield } from "@mui/icons-material";
import { PrivateUser, PublicUser } from "./types/user";
import type { Alert } from "./types/alert";

type GroupProfileProps = {
  user: PrivateUser | null;
  showAlert: (alert: Alert) => void;
}

export default function GroupProfile({ user, showAlert }: GroupProfileProps) {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [groupData, setGroupData] = useState<GroupData>({ name: '', type: 'group', memberList: [], admins: [], _id: '', photoURL: null });
  const [originalData, setOriginalData] = useState<GroupData>({ name: '', type: 'group', memberList: [], admins: [], _id: '', photoURL: null });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [myContacts, setMyContacts] = useState<PublicUser[]>([]);
  const [isAddingContacts, setIsAddingContacts] = useState<boolean>(false);

  useEffect(() => {
    const fetchConversationData = async () => {
      try {
        const data = await apiFetch(`/group/${conversationId}`);
        const group = data.group;
        const groupData: GroupData = {
          type: group.type,
          name: group.name,
          photoURL: group.photoURL,
          memberList: group.participants,
          admins: group.admins,
          _id: group._id
        };

        groupData.memberList?.sort((a, b) => {
          if (a._id === user?._id) return -1;
          if (b._id === user?._id) return 1;
          return a.name.localeCompare(b.name);
        });

        setGroupData(groupData);
        setOriginalData(groupData);
      } catch (err: any) {
        console.error("Conversation Fetch Error: ", err);
      }
    };

    const fetchContacts = async () => {
      try {
        const data = await apiFetch('/myContacts');
        setMyContacts(data);
      } catch (err: any) {
        console.error("Contacts Fetch Error: ", err);
      }
    };

    fetchConversationData();
    fetchContacts();
  }, [conversationId]);

  type ValidationResult = {
    valid: boolean;
    message?: string;
  };

  const validateGroupUpdate = (): ValidationResult => {
    if (!groupData.name.trim()) {
      return { valid: false, message: 'Group name cannot be empty' };
    }
    if (groupData.name.length > 64) {
      return { valid: false, message: 'Group name can be atmost 64 in length' }
    }
    if (!groupData.memberList?.some(member => member._id === user?._id)) {
      return { valid: false, message: 'You must be a member of the group' };
    }
    if (groupData.memberList?.length < 2) {
      return { valid: false, message: 'A group must have at least 2 members' };
    }
    if (groupData.admins?.length === 0) {
      return { valid: false, message: 'A group must have at least 1 admin' };
    }
    return { valid: true };
  }
  const handleGroupUpdate = async () => {
    const validation = validateGroupUpdate();
    if (!validation.valid) {
      showAlert({ type: 'danger', message: validation.message! });
      return;
    }

    const payload: Partial<GroupData> = {};
    if (groupData.name !== originalData.name) {
      payload.name = groupData.name;
    }
    payload.memberList = groupData.memberList;
    payload.admins = groupData.admins;
    if (groupData.photoURL !== originalData.photoURL) {
      payload.photoURL = groupData.photoURL;
    }
    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await apiFetch(`/group/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const { name, type, photoURL, admins, participants, _id } = data.group;
      const updatedGroup: GroupData = {
        name, type,
        photoURL, _id,
        admins,
        memberList: participants
      };

      updatedGroup.memberList?.sort((a, b) => {
        if (a._id === user?._id) return -1;
        if (b._id === user?._id) return 1;
        return a.name.localeCompare(b.name);
      });

      setOriginalData(updatedGroup);
      setGroupData(updatedGroup);
      setIsEditing(false);
      setIsAddingContacts(false);
      showAlert({ type: 'success', message: 'Group updated successfully' });

    } catch (err: any) {
      console.error("Group Update Error: ", err);
      showAlert({ type: 'danger', message: err.message || 'Could not update group' });

    } finally {
      setIsSubmitting(false);
    }
  }

  const isAnAdmin = (member: PublicUser) => {
    return groupData.admins?.some(admin => admin._id === member._id);
  }

  const addAdmin = (member: PublicUser) => {
    setGroupData({ ...groupData, admins: [...(groupData.admins || []), member] });
  }

  const removeAdmin = (member: PublicUser) => {
    setGroupData({ ...groupData, admins: groupData.admins!.filter(admin => admin._id !== member._id) });
  }

  const addMember = (member: PublicUser) => {
    setGroupData({ ...groupData, memberList: [...(groupData.memberList || []), member] });
  }

  const removeMember = (member: PublicUser) => {
    setGroupData({ ...groupData, memberList: groupData.memberList!.filter(mem => mem._id !== member._id) })
  }

  const isGettingDeleted = (member: PublicUser) => {
    return !groupData.memberList!.some(mem => mem._id === member._id);
  }

  const isGettingAdded = (contact: PublicUser) => {
    return groupData.memberList!.some(mem => mem._id === contact._id);
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
              <div className="d-flex justify-content-between align-items-center">
                <button className="btn text-dark" onClick={navigateBack} title="Back"><ArrowBack /></button>
                {originalData?.admins?.some(admin => admin._id === user?._id) &&
                  (isEditing ?
                    (
                      <div>
                        <button type="button"
                          className="btn btn-success me-2"
                          onClick={() => {
                            handleGroupUpdate();
                          }}
                          disabled={isSubmitting}
                          title="Save Changes"
                        ><SaveOutlined /></button>
                        <button type="button"
                          className="btn btn-danger"
                          onClick={() => {
                            setIsAddingContacts(false);
                            setIsEditing(false);
                            setGroupData(originalData);
                          }}
                          disabled={isSubmitting}
                          title="Cancel Changes"
                        ><Cancel /></button>
                      </div>
                    ) : (
                      <button type="button"
                        className="btn"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit />
                      </button>
                    )
                  )
                }
              </div>
              <div className="text-center">
                <img
                  src={originalData?.photoURL || (originalData?.type === 'global' ? '/GlobalChatDP.png' : '/defaultGroupDP.png')}
                  alt={originalData?.name || 'Group'}
                  className="img-fluid mt-2"
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    if (originalData?.type === 'global') {
                      e.currentTarget.src = "/GlobalChatDP.png";
                    } else {
                      e.currentTarget.src = "/defaultGroupDP.png";
                    }
                  }}
                />
                {isEditing ? (
                  <div className="mt-1 d-flex justify-content-center">
                    <input
                      type="text"
                      className="form-control text-center fs-4"
                      autoFocus
                      style={{ width: 'fit-content', minWidth: '200px' }}
                      value={groupData?.name || ''}
                      onChange={(e) => setGroupData({ ...groupData!, name: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="mt-3">
                    <h2>{originalData?.name ?? 'Unknown group'}</h2>
                  </div>
                )}
              </div>
              <div className='row mt-4'>
                {originalData.type === 'global' ?
                  <h4 className="mb-0 pb-0 mx-1 text-center text-muted ">
                    Welcome to the Global Chat! This is a public group where all users are members by default. The member list and admin controls are disabled.
                  </h4>
                  :
                  originalData.memberList?.map(member => {
                    const isSelf = member._id === user?._id;
                    const isAdmin = isAnAdmin(member);
                    const isGettingDelete = isGettingDeleted(member);
                    return (
                      <Link
                        to={`/profile/${member.username}`}
                        key={member._id}
                        className="text-dark col-md-6 col-xxl-4 d-flex align-items-center px-1 rounded shadow-sm py-1 mb-1"
                        style={{
                          display: 'block',
                          textDecoration: 'none',
                          cursor: isEditing ? 'default' : 'pointer',
                        }}
                        onClick={(e) => {
                          if (isEditing) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                      >
                        <img src={member.photoURL || '/defaultDP.jpg'}
                          alt="Member profile photo"
                          style={{
                            height: '40px',
                            width: '40px',
                            borderRadius: '50%'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = "/defaultDP.jpg";
                          }}
                        />
                        <div style={{ width: 'calc(100% - 50px)' }}>
                          <div className="ms-0 row"
                          >
                            <div className="col-10">
                              <h6
                                className="mb-0 fw-semibold text-truncate"
                                style={{
                                  color: isGettingDelete ? 'rgb(214 86 86)' : ''
                                }}
                              >
                                {isEditing && !isSelf ?
                                  (isAdmin ?
                                    <span
                                      onClick={() => removeAdmin(member)}
                                      style={{ cursor: 'pointer' }}
                                      title="Remove admin privileges"
                                    >
                                      <RemoveModerator />
                                    </span> :
                                    <span
                                      onClick={() => addAdmin(member)}
                                      style={{ cursor: 'pointer' }}
                                      title="Give admin privileges"
                                    >
                                      <AddModerator />
                                    </span>
                                  )
                                  :
                                  isAdmin &&
                                  <span
                                    title={(isSelf && isEditing) ? 'Cannot remove yourself as an admin' : 'Admin'}
                                    style={{ cursor: isEditing ? 'not-allowed' : '' }}
                                  >
                                    <Shield />
                                  </span>
                                }
                                {isSelf ? '(You)' : member.name}

                              </h6>
                              <small className="text-muted text-truncate">
                                @{member.username}
                              </small>
                            </div>
                            {isEditing && (isSelf ?
                              <div
                                className="col-2 g-0 d-flex justify-content-between align-items-center"
                                style={{ cursor: 'not-allowed' }}
                              >
                                <span
                                  className="-ms-1"
                                  onClick={() => addMember(member)}
                                  title="You can't remove yourself"
                                >
                                  <PersonAddDisabled />
                                </span>
                              </div>
                              :
                              <div
                                className="col-2 g-0 d-flex justify-content-between align-items-center"
                                style={{ cursor: 'pointer' }}
                              >
                                {isGettingDelete ?
                                  <span
                                    className="text-success"
                                    onClick={() => addMember(member)}
                                    title='Keep member in group'
                                  >
                                    <PersonAddAlt1Outlined />
                                  </span>
                                  :
                                  <span
                                    className="text-danger"
                                    onClick={() => removeMember(member)}
                                    title='Remove member from group'
                                  >
                                    <PersonRemoveOutlined />
                                  </span>
                                }
                              </div>)
                            }
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                {isEditing &&
                  <div
                    className="d-flex flex-column justify-content-center align-items-center my-2 px-1"
                  >
                    {isAddingContacts ? (<>
                      <button onClick={() => setIsAddingContacts(false)} className="btn-danger btn px-5"><Close /></button>
                      <div className="row px-2">
                        <p className="d-inline fs-6 mb-0 mt-3"><Info /> Select contact below to add</p>
                        {myContacts.filter(contact => !originalData.memberList!.some(member => member._id === contact._id)).map(contact => {
                          const isAdded = isGettingAdded(contact);
                          return (
                            <div key={contact._id} className="col-md-6 col-xxl-4 d-flex align-items-center px-1 border-bottom border-start rounded shadow-sm py-1 mb-1">
                              <img src={contact.photoURL || '/defaultDP.jpg'}
                                alt="Contact profile photo"
                                style={{
                                  height: '40px',
                                  width: '40px',
                                  borderRadius: '50%'
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = "/defaultDP.jpg";
                                }}
                              />
                              <div style={{ width: 'calc(100% - 50px)' }}>
                                <div className="ms-0 row">
                                  <div className="col-10">
                                    <h6
                                      className="mb-0 text-truncate"
                                      style={{
                                        color: isAdded ? 'rgb(11, 205, 7)' : '',
                                      }}
                                    >
                                      {contact.name}
                                    </h6>
                                    <small className="d-block text-muted text-truncate">
                                      @{contact.username}
                                    </small>
                                  </div>
                                  <div
                                    className="col-2 g-0 d-flex justify-content-between align-items-center"
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {isAdded ?
                                      <span
                                        onClick={() => removeMember(contact)}
                                        title='Cancel adding member to group'
                                      >
                                        <PersonAddDisabled />
                                      </span>
                                      :
                                      <span
                                        onClick={() => addMember(contact)}
                                        title='Add member to group'
                                      >
                                        <PersonAddOutlined />
                                      </span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>) : (
                      <button
                        className="btn-success btn px-5"
                        title="Add members"
                        onClick={() => setIsAddingContacts(true)}
                      >
                        <PersonAdd />
                      </button>
                    )}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section >
  )
}