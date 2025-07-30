
import React from 'react';
import { Icons } from '../../../icons';
import GamificationContentPlaceholder from '../GamificationContentPlaceholder';

const Showcases: React.FC = () => {
  return (
    <GamificationContentPlaceholder
        title="Showcases"
        breadcrumbs="Achievements / Showcases"
        icon={<Icons.Showcases size={64} />}
    />
  );
};

export default Showcases;