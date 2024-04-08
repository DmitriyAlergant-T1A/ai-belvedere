import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import Toggle from './Toggle';

const ReplaceCurrentChatToggle = () => {
  const { t } = useTranslation();

  const setReplaceCurrentChat = useStore((state) => state.setReplaceCurrentChat);

  const [isChecked, setIsChecked] = useState<boolean>(useStore.getState().replaceCurrentChat);

  useEffect(() => {
    setReplaceCurrentChat(isChecked);
  }, [isChecked]);

  return (
    <Toggle
      label={t('replaceCurrentChatToggle') as string}
      tooltip='New Chat button will always replace (drop) the current chat. Basically, avoid chat history accumulation. Use Clone Chat button to have more then one chat.'
      isChecked={isChecked}
      setIsChecked={setIsChecked}
    />
  );
};

export default ReplaceCurrentChatToggle;
