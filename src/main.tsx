import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Welcome from './Welcome'; 
import './main.css';
await import('katex/dist/katex.min.css');

import './i18n';
import { isUserAuthenticated } from '@utils/getAuthenticatedUserProfile';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Check if the user is authenticated
const _isUserAuthenticated  = await isUserAuthenticated();

console.log("main.tsx: is user authenticated: " + _isUserAuthenticated);

// Render the appropriate component based on the authentication state
root.render(
  <React.StrictMode>
    { 
      (import.meta.env.VITE_CHECK_AAD_AUTH != 'Y' && import.meta.env.AUTH_AUTH0 != 'Y')
        || _isUserAuthenticated ? 
          <App />     /*User authenticated, or no authentication is implemented at all -> go to the main page*/
            : 
          <Welcome />
    }
  </React.StrictMode>
);
