export const _builtinAPIEndpoint = '/api';
export const _developmentAPIEndpoint = 'http://localhost:5500/api';

export const availableEndpoints = [_builtinAPIEndpoint, _developmentAPIEndpoint];

export const defaultAPIEndpoint = import.meta.env.VITE_DEFAULT_API_ENDPOINT || _builtinAPIEndpoint;

