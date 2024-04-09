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

  return null;
}

export default AuthenticationUpdater;
