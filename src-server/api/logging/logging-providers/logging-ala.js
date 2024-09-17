import { isAggregateLogsUploadError, LogsIngestionClient } from "@azure/monitor-ingestion";
import { getAzureCredential } from './azure-credentials.js';
import os from 'os';

/*TBD make sure these variables are correctly scoped and will survive between requests*/
let azureCredential, logsIngestionClient;

const logToAzureLogAnalytics = async(streamName, requestId, logsData) => {

    const AZURE_LOG_ANALYTICS_RESOURCE_URI=process.env.AZURE_LOG_ANALYTICS_RESOURCE_URI;

    const AZURE_LOG_ANALYTICS_DCR_IMMUTABLE_ID=process.env.AZURE_LOG_ANALYTICS_DCR_IMMUTABLE_ID;
    const AZURE_LOG_ANALYTICS_REQ_LOGS_DS=process.env.AZURE_LOG_ANALYTICS_REQ_LOGS_DS;
    const AZURE_LOG_ANALYTICS_RES_LOGS_DS=process.env.AZURE_LOG_ANALYTICS_RES_LOGS_DS;

    const ENVIRONMENT = process.env.ENVIRONMENT || os.hostname();

    if (AZURE_LOG_ANALYTICS_RESOURCE_URI && AZURE_LOG_ANALYTICS_DCR_IMMUTABLE_ID) {

        if (!azureCredential || !logsIngestionClient) {
            azureCredential = getAzureCredential();
            logsIngestionClient = new LogsIngestionClient(AZURE_LOG_ANALYTICS_RESOURCE_URI, azureCredential);          
        }

      const _logsData = {...logsData,
                        requestId: requestId,
                        TimeGenerated: new Date().toISOString(),
                        environment: ENVIRONMENT};

      let alaStreamName;
      if (streamName == "Chat Completions Request" && AZURE_LOG_ANALYTICS_REQ_LOGS_DS)
        alaStreamName = AZURE_LOG_ANALYTICS_REQ_LOGS_DS;
      else if (streamName == 'Chat Completions Response' && AZURE_LOG_ANALYTICS_RES_LOGS_DS)
        alaStreamName = AZURE_LOG_ANALYTICS_RES_LOGS_DS;
      else {
        console.error(`ERROR: logToAzureLogAnalytics - unknown streamName ${streamName}`)
        return;
      }

      console.log(`${requestId} Logging to ALA stream ${alaStreamName} with data: ${JSON.stringify(_logsData)}`);
        
      logsIngestionClient.upload(AZURE_LOG_ANALYTICS_DCR_IMMUTABLE_ID, alaStreamName, [_logsData])
      .catch(e => {
        let aggregateErrors = isAggregateLogsUploadError(e) ? e.errors : [];
        if (aggregateErrors.length > 0) {
          //console.log(`${requestId} Some logs have failed to complete ingestion`);
          for (const error of aggregateErrors) {
            console.error(`${requestId} ALA logs ingestion error: ${error?.cause?.statusCode}  ${error?.cause?.code} ${error?.cause?.details?.error?.message}`);
            //console.log(`${requestId} Logs ingestion error: ${JSON.stringify(error)}`);
          }
        } else {
          console.error(`${requestId} Error sending logs to ALA: ` + e);
        }
      });
    } else {
        console.error(`ERROR: can't log to ALA, AZURE_LOG_ANALYTICS_RESOURCE_URI or AZURE_LOG_ANALYTICS_DCR_IMMUTABLE_ID env vars are not defined`);
    }
  }

  export default logToAzureLogAnalytics;