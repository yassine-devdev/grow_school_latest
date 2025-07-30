
import React from 'react';
import { Icons } from '../../../icons';
import LearningGamePlaceholder from './LearningGamePlaceholder';

const LanguageGame: React.FC = () => {
  return (
    <LearningGamePlaceholder
        title="Language Games"
        breadcrumbs="Learning Games / Language"
        icon={<Icons.LanguageGame size={64} />}
    />
  );
};

export default LanguageGame;