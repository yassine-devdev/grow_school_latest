
import React from 'react';
import { Icons } from '../../../icons';
import GamificationContentPlaceholder from '../GamificationContentPlaceholder';

const LearningChallenges: React.FC = () => {
  return (
    <GamificationContentPlaceholder
        title="Learning Challenges"
        breadcrumbs="Challenges / Learning Challenges"
        icon={<Icons.LearningChallenges size={64} />}
    />
  );
};

export default LearningChallenges;