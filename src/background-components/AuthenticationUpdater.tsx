import { useEffect, useState } from 'react';
import useStore from '@store/store';

import { fetchAuthenticatedUserProfile } from '@utils/getAuthenticatedUserProfile';

const AuthenticationUpdater = () => {
  
  const setUsername = useStore((state) => state.setUserName);

  useEffect(() => {
    const fetchAndSetUsername = async () => {
      const userProfile = await fetchAuthenticatedUserProfile();

      if (userProfile && userProfile.name) {
        setUsername(userProfile.name);
      }
    };

    fetchAndSetUsername();
  }, [setUsername]);


  useEffect(() => {
    if (import.meta.env.VITE_USE_AAD_AUTH === 'Y') {
      const interval = setInterval(() => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = '/.auth/refresh';
        document.body.appendChild(iframe);
        iframe.onload = () => document.body.removeChild(iframe);
      }, 600000); // Refresh every 10 minutes

      return () => clearInterval(interval);
    }
  }, []);

  return null;
}

export default AuthenticationUpdater;