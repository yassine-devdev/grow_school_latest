
import React from 'react';
import { Icons } from '../../../icons';
import GamificationContentPlaceholder from '../GamificationContentPlaceholder';

const GameLibrary: React.FC = () => {
  return (
    <GamificationContentPlaceholder
        title="Game Library"
        breadcrumbs="Challenges / Game Library"
        icon={<Icons.GameLibrary size={64} />}
    />
  );
};

export default GameLibrary;