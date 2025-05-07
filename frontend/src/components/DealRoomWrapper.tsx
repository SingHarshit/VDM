// DealRoomWrapper.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import DealRoom from './Dealroom';

const DealRoomWrapper: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const userRole = (localStorage.getItem('role') as 'Buyer' | 'Seller') || 'Buyer';

  if (!dealId) return <div>Invalid Deal ID</div>;

  return <DealRoom dealId={dealId} userRole={userRole} />;
};

export default DealRoomWrapper;
