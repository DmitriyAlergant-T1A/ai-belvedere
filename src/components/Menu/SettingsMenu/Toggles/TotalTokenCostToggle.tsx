import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import Toggle from './Toggle';

export const TotalTokenCostToggle = () => {
    const { t } = useTranslation('main');
  
    const setCountTotalTokens = useStore((state) => state.setCountTotalTokens);
  
    const [isChecked, setIsChecked] = useState<boolean>(
      useStore.getState().countTotalTokens
    );
  
    useEffect(() => {
      setCountTotalTokens(isChecked);
    }, [isChecked]);
  
    return (
      <Toggle
        label={t('countTotalTokens') as string}
        tooltip='Count accumulated tokens cost and display on the left menu'
        isChecked={isChecked}
        setIsChecked={setIsChecked}
      />
    );
  };

export default TotalTokenCostToggle;