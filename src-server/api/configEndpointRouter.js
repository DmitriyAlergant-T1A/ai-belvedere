//configApiRouter.js

import express from 'express';

export const configEndpointRouter = () => {

    const router = express.Router();        
       
    router.get('/company-system-prompt', async (req, res) => {
        const companySystemPrompt = process.env.COMPANY_SYSTEM_PROMPT || '';
        res.json({ companySystemPrompt });
        console.log(`GET /api/config/company-system-prompt, returned ${companySystemPrompt.length} characters`);
    });


    return router;
};