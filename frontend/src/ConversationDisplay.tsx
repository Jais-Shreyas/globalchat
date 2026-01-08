import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "./helpers/fetchHelper";
import { GroupData } from "./types/GroupData";
import { ArrowBack } from "@mui/icons-material";

export default function ConversationDisplay() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [originalData, setOriginalData] = useState<GroupData | null>(null);

  useEffect(() => {
    const fetchConversationData = async () => {
      try {
        const data = await apiFetch(`/conversation/${conversationId}`);
        const group = data.group;
        const groupData: GroupData = {
          name: group.name,
          photoURL: group.photoURL,
          memberList: group.participants,
          _id: group._id
        };
        setGroupData(groupData);
        setOriginalData(groupData);
      } catch (err: any) {
        console.error("Conversation Fetch Error: ", err);
      }
    };

    fetchConversationData();
  }, [conversationId]);

  return (
    <section className="w-100 px-4 py-5" style={{ borderRadius: '.5rem .5rem 0 0' }} >
      <div className="row d-flex justify-content-center">
        <div className="col col-md-9 col-lg-7 col-xl-6">
          <div className="card" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4">
              <Link className="text-dark" to='/' title="Back"><ArrowBack /></Link>
              <div className="text-center">
                <img
                  src={groupData?.photoURL || '/defaultDP.jpg'}
                  alt={groupData?.name || 'Group'}
                  className="img-fluid"
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/defaultDP.jpg";
                  }}
                />
                <h2>{groupData?.name ?? 'Unknown group'}</h2>
              </div>
              <div className='row mt-4 mx-2'>
                {groupData?.memberList.map(member => (
                  <Link
                    to={`/profile/${member.username}`}
                    key={member._id}
                    className="text-dark col-6 d-flex align-items-center my-2"
                    style={{ display: 'block', textDecoration: 'none' }}
                  >
                    <img src={member.photoURL || '/defaultDP.jpg'}
                      alt="Member profile photo"
                      style={{
                        height: '40px',
                        width: '40px',
                        borderRadius: '50%'
                      }}
                    />
                    <div className="ps-1 text-truncate">
                      <h6 className="mb-0 fw-semibold text-truncate">
                        {member.name}
                      </h6>
                      <small className="text-muted text-truncate">
                        @{member.username}
                      </small>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}