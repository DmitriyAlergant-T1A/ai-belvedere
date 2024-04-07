import { useEffect, useState } from 'react';
import useStore from '@store/store';

const CompanySystemPromptUpdater = () => {

    const companySystemPrompt = useStore((state) => state.companySystemPrompt);
    const setcompanySystemPrompt = useStore((state) => state.setcompanySystemPrompt);

    const apiEndpoint = useStore((state) => state.apiEndpoint);

    useEffect(() => {
        const fetchCompanySystemPrompt = async () => {
            try {
                const response = await fetch(`${apiEndpoint}/config/company-system-prompt`);

                if (!response.ok)
                    throw new Error('Failed to fetch company system prompt configuration');

                const data = await response.json();

                if (data.companySystemPrompt) {
                    if (data.companySystemPrompt !== companySystemPrompt) {
                        console.debug("Set New Company System Prompt (fetched from the server-side):", data.companySystemPrompt);
                        setcompanySystemPrompt(data.companySystemPrompt);
                    }
                    else {
                        console.debug("Company System Prompt fetched, unchanged");
                    }
                }
            } catch (error) {
                console.error('Error fetching company system prompt: ', error);
            }
        };

        fetchCompanySystemPrompt();
        
    }, [setcompanySystemPrompt, apiEndpoint]);

  return null;
};

export default CompanySystemPromptUpdater;
