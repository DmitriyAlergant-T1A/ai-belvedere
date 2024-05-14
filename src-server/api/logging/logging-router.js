import logToAzureLogAnalytics from './logging-providers/logging-ala.js';
import logToConsole from './logging-providers/logging-console.js';
import logToPgsql from './logging-providers/logging-pgsql.js';


const logRequestRouter = async(streamName, requestId, logsData) => {

    const LOG_DESTINATION_AZURE_LOG_ANALYTICS=process.env.LOG_DESTINATION_AZURE_LOG_ANALYTICS;
    const LOG_DESTINATION_POSTGRESQL=process.env.LOG_DESTINATION_POSTGRESQL;
    const LOG_DESTINATION_CONSOLE=process.env.LOG_DESTINATION_CONSOLE;
    
    if (LOG_DESTINATION_AZURE_LOG_ANALYTICS) {
        logToAzureLogAnalytics(streamName, requestId, logsData);
    }

    if (LOG_DESTINATION_CONSOLE) {
        logToConsole(streamName, requestId, logsData);
    }

    if (LOG_DESTINATION_POSTGRESQL) {
        logToPgsql(streamName, requestId, logsData);
    }
};

export default logRequestRouter;