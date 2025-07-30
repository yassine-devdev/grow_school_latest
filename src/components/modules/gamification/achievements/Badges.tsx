
import React from 'react';
import { Icons } from '../../../icons';
import GamificationContentPlaceholder from '../GamificationContentPlaceholder';

const Badges: React.FC = () => {
  return (
    <GamificationContentPlaceholder
        title="Badges"
        breadcrumbs="Achievements / Badges"
        icon={<Icons.Badges size={64} />}
    />
  );
};

export default Badges;