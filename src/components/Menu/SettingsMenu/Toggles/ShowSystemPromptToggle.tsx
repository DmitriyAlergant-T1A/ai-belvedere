import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import Toggle from './Toggle';

const ShowSystemPromptToggle = () => {
  const { t } = useTranslation();

  const setShowSystemPrompt = useStore((state) => state.setShowSystemPrompt);

  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().showSystemPrompt
  );

  useEffect(() => {
    setShowSystemPrompt(isChecked);
  }, [isChecked]);

  return (
    <Toggle
      label={t('showSystemPromptToggle') as string}
      tooltip='Show system prompt in each chat'
      isChecked={isChecked}
      setIsChecked={setIsChecked}
    />
  );
};

export default ShowSystemPromptToggle;
