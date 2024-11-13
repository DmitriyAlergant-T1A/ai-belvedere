import { useEffect } from 'react';
import useStore from '@store/store';

const ServerEnvConfigUpdater = () => {
    const {
        setcompanySystemPrompt,
        setCompanyName,
        setAnthropicEnable,
        setOpenaiO1Enable,
        setCheckAadAuth,
        setDemoMode,
        apiEndpoint
    } = useStore((state) => ({
        setcompanySystemPrompt: state.setcompanySystemPrompt,
        setCompanyName: state.setCompanyName,
        setAnthropicEnable: state.setAnthropicEnable,
        setOpenaiO1Enable: state.setOpenaiO1Enable,
        setCheckAadAuth: state.setCheckAadAuth,
        setDemoMode: state.setDemoMode,
        apiEndpoint: state.apiEndpoint
    }));

    useEffect(() => {

        const fetchConfig = async () => {
            try {
                const response = await fetch(`${apiEndpoint}/config/env`);

                if (!response.ok)
                    throw new Error('Failed to fetch configuration');

                const data = await response.json();

                console.debug("Received configuration from server:", data);


                setcompanySystemPrompt(data.companySystemPrompt || '');
                setCompanyName(data.companyName || '');
                setAnthropicEnable(data.anthropicEnable=='Y' || false);
                setOpenaiO1Enable(data.openaiO1Enable=='Y' || false);
                setCheckAadAuth(data.checkAadAuth=='Y' || false);
                setDemoMode(data.demoMode=='Y' || false);
            } catch (error) {
                console.error('Error fetching configuration: ', error);
            }
        };

        fetchConfig();
        
    }, [apiEndpoint]);

    return null;
};

export default ServerEnvConfigUpdater;