import useStore from '@store/store';

import { OIDCUserProfile } from '@type/auth';

export const fetchAuthenticatedUserProfile = async (): Promise<OIDCUserProfile | undefined> => {

    const apiEndpoint = useStore.getState().apiEndpoint;
    
    try {
        const response = await fetch(`${apiEndpoint}/profile`);
      if (!response.ok) {
        console.debug ('/api/profile response code ' + response.status);
        return undefined;
      }
      
      const profileResponseString = await response.text();

      try{
        const profileData = JSON.parse(profileResponseString);

        console.debug('Fetched authenticated user profile: ', profileData);

        return profileData;
      }
      catch (error) {
        console.log ('/api/profile returned ' + profileResponseString + ' which is not a valid JSON');
        return undefined;
      }
    } catch (error) {
      console.log('Error fetching authenticated user profile: ', error);
      return undefined;
    }
};

export const isUserAuthenticated = async () : Promise <boolean>  => {
    const profile = await fetchAuthenticatedUserProfile();
    
    return profile !== undefined && Object.keys(profile).length > 0;
  };
