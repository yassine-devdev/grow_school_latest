
import React from 'react';
import { Icons } from '../../../icons';
import GamificationContentPlaceholder from '../GamificationContentPlaceholder';

const TradingPost: React.FC = () => {
  return (
    <GamificationContentPlaceholder
        title="Trading Post"
        breadcrumbs="Rewards / Trading Post"
        icon={<Icons.TradingPost size={64} />}
    />
  );
};

export default TradingPost;