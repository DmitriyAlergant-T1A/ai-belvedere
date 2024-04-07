import { useEffect, useState } from 'react';
import useStore from '@store/store';

const AuthenticationUpdater = () => {
  const setUsername = useStore((state) => state.setUserName);

  const apiEndpoint = useStore((state) => state.apiEndpoint);

  useEffect(() => {
    const fetchClientPrincipalName = async () => {
      try {
        const response = await fetch(`${apiEndpoint}/get-authenticated-principal-name`);
        if (!response.ok) {
          throw new Error('Failed to fetch client principal name');
        }
        const data = await response.json();
        if (data.clientPrincipalName) {
          console.log("Authenticated User Name:", data.clientPrincipalName);
          setUsername(data.clientPrincipalName);
        }
      } catch (error) {
        console.error('Error fetching authenticated principal user name:', error);
      }
    };

    fetchClientPrincipalName();
  }, [setUsername]);

  return null;
};

export default AuthenticationUpdater;
