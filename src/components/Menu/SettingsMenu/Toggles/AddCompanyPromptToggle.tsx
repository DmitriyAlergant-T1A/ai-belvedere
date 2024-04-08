import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@store/store';
import Toggle from './Toggle';

const AddCompanyPromptToggle = () => {
  const { t } = useTranslation();

  const setAddCompanyPromptToggle = useStore((state) => state.setAddCompanyPromptToggle);

  const [isChecked, setIsChecked] = useState<boolean>(
    useStore.getState().addCompanyPromptToggle
  );

  useEffect(() => {
    setAddCompanyPromptToggle(isChecked);
  }, [isChecked]);

  return (
    <Toggle
      label={t('addCompanyPromptToggle') as string}
      tooltip='Add company-provided system prompt fragment to your system prompt (configured above) for all new chats'
      isChecked={isChecked}
      setIsChecked={setIsChecked}
    />
  );
};

export default AddCompanyPromptToggle;
