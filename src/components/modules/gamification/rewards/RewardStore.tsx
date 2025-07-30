
import React from 'react';
import { Icons } from '../../../icons';
import GamificationContentPlaceholder from '../GamificationContentPlaceholder';

const RewardStore: React.FC = () => {
  return (
    <GamificationContentPlaceholder
        title="Reward Store"
        breadcrumbs="Rewards / Reward Store"
        icon={<Icons.RewardStore size={64} />}
    />
  );
};

export default RewardStore;