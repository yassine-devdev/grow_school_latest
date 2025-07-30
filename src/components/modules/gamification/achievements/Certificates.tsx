
import React from 'react';
import { Icons } from '../../../icons';
import GamificationContentPlaceholder from '../GamificationContentPlaceholder';

const Certificates: React.FC = () => {
  return (
    <GamificationContentPlaceholder
        title="Certificates"
        breadcrumbs="Achievements / Certificates"
        icon={<Icons.Certificates size={64} />}
    />
  );
};

export default Certificates;