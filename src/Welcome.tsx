import React, { useEffect, useRef } from 'react';
import useStore from '@store/store';
import i18n from './i18n';

const Welcome = () => {

    const apiEndpoint = useStore((state) => state.apiEndpoint);

    const loginEndpoint = `${apiEndpoint.replace('/api', '')}/login`;

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="mb-8 flex flex-col items-center">
        <img src="favicon-516x516.png" alt="App Logo" className="h-48" />
        
        <div className="mt-12 mb-4">
            <h1 className="text-4xl font-bold text-gray-800">{useStore.getState().companyName} AI Chat Assistant</h1>
        </div>
        </div>
        <a
          href={loginEndpoint}
          className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
        >
          Login
        </a>
      </div>
    );
  };
  
  export default Welcome;
