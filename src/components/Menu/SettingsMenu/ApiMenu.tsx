import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import useStore from '@store/store';

import useHideOnOutsideClick from '@hooks/useHideOnOutsideClick';
import PopupModal from '@components/PopupModal';

import {developmentAPIEndpoint, builtinAPIEndpoint, availableEndpoints} from '@constants/apiEndpoints'


const ApiMenu = ({
  setIsModalOpen,
}: {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation(['main', 'api']);

  const companyName:string = import.meta.env.VITE_COMPANY_NAME || "";

  const apiEndpoint = useStore((state) => state.apiEndpoint);
  const setApiEndpoint = useStore((state) => state.setApiEndpoint);

  const [_apiEndpoint, _setApiEndpoint] = useState<string>(apiEndpoint);

  const handleSave = () => {
    setApiEndpoint(_apiEndpoint);
    setIsModalOpen(false);
  };

  const handleToggleEndpointType = (value: string) => {

    console.log('handleToggleEndpointType', value);

    if ( value === 'builtin') {
      _setApiEndpoint(builtinAPIEndpoint);
    } else if ( value === 'development') {
      _setApiEndpoint(developmentAPIEndpoint);
    }

  };
  

  return (
    <PopupModal
      title={t('api') as string}
      setIsModalOpen={setIsModalOpen}
      handleConfirm={handleSave}
    >
      <div className='p-6 border-b border-gray-200 dark:border-gray-600'>
        <div className='flex gap-2 items-center mb-2'>
          <div className='min-w-fit text-gray-900 dark:text-gray-300 text-sm'>
            API Endpoint Type
          </div>
          <select
            className='text-gray-800 dark:text-gray-300 p-1 text-sm border bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md m-0 w-full mr-0 h-8 focus:outline-none'
            value={(_apiEndpoint === builtinAPIEndpoint) ? 'builtin' : 'development'}
            onChange={(e) => handleToggleEndpointType(e.target.value)}
          >
            <option value="builtin">{companyName}-Provided Endpoint</option>
            <option value="development">Local Development Endpoint</option>
          </select>
        </div>

        <div className='flex items-center mb-6'>
          <input
            type='text'
            className={`${
              _apiEndpoint === builtinAPIEndpoint
                ? 'bg-gray-200 text-gray-500                border    border-gray-300     dark:bg-gray-700 dark:text-gray-500 dark:border-gray-300 '
                : 'bg-white hover:bg-gray-100 text-gray-800 border    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'}  
              p-3 text-sm rounded-md m-0 w-full mr-0 h-8 focus:outline-none`}
            readOnly={_apiEndpoint === builtinAPIEndpoint ? true : undefined}
            value={_apiEndpoint}
            onChange={(e) => {
              _setApiEndpoint(e.target.value);
            }}
          />
        </div>

        <div className='min-w-fit text-gray-900 dark:text-gray-300 text-sm flex flex-col gap-3 leading-relaxed'>

          {(_apiEndpoint === builtinAPIEndpoint) ? 
            (
            <p>The {companyName}-Provided API endpoint is an integral part of this application. This is the default. <br/> Do not change unless you know what you are doing.</p>
            )
            :
            (
            <p>This is only used for local development changes to this UI application, to connect to the locally-run middleware backend (NodeJS).
            You would need to provide your own API keys in environment variables. See <a href="https://github.com/DmitriyAlergant-T1A/BetterChatGPT-t1a/" 
              className="font-medium text-blue-600 dark:text-blue-500 hover:underline">GitHub repository</a> for more information.
            </p>
            )
          }
        </div>
      </div>
    </PopupModal>
  );
};

export default ApiMenu;
