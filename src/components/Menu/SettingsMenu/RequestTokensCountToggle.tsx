import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import Toggle from '@components/Menu/Toggle';

const RequestTokensCountToggle = () => {
  const { t } = useTranslation();

  const setRequestTokensCount = useStore((state) => state.setRequestTokensCount);

  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().requestTokensCount
  );

  useEffect(() => {
    setRequestTokensCount(isChecked);
  }, [isChecked]);

  return (
    <Toggle
      label={t('requestTokensCount') as string}
      tooltip='After each submission show tokens count in the left bottom corner'
      isChecked={isChecked}
      setIsChecked={setIsChecked}
    />
  );
};

export default RequestTokensCountToggle;
