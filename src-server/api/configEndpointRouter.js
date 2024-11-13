import express from 'express';

export const configEndpointRouter = () => {
    const router = express.Router();

    router.get('/env', async (req, res) => {
        const config = {
            companySystemPrompt: process.env.COMPANY_SYSTEM_PROMPT || '',
            companyName: process.env.COMPANY_NAME || '',
            anthropicEnable: process.env.ANTHROPIC_ENABLE || 'N',
            openaiO1Enable: process.env.OPENAI_O1_ENABLE || 'N',
            checkAadAuth: process.env.CHECK_AAD_AUTH || 'N',
            demoMode: process.env.DEMO_MODE || 'N',
        };
        res.json(config);
        console.log(`GET /api/config/config, returned config object`);
    });

    return router;
};