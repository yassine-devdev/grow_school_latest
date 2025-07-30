
import React from 'react';
import { Icons } from '../../../icons';
import GamificationContentPlaceholder from '../GamificationContentPlaceholder';

const CharityDonations: React.FC = () => {
  return (
    <GamificationContentPlaceholder
        title="Charity Donations"
        breadcrumbs="Rewards / Charity Donations"
        icon={<Icons.CharityDonations size={64} />}
    />
  );
};

export default CharityDonations;