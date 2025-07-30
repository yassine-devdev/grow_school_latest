
import React from 'react';
import { Icons } from '../../../icons';
import GamificationContentPlaceholder from '../GamificationContentPlaceholder';

const EduCoinWallet: React.FC = () => {
  return (
    <GamificationContentPlaceholder
        title="EduCoin Wallet"
        breadcrumbs="Rewards / EduCoin Wallet"
        icon={<Icons.EduCoinWallet size={64} />}
    />
  );
};

export default EduCoinWallet;