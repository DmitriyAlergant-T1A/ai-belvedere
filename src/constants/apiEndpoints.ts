export const builtinAPIEndpoint = '/api/chat/completions';

export const developmentAPIEndpoint = 'http://localhost:5500/api/chat/completions';

export const availableEndpoints = [builtinAPIEndpoint, developmentAPIEndpoint];

export const defaultAPIEndpoint = import.meta.env.VITE_DEFAULT_API_ENDPOINT || builtinAPIEndpoint;

