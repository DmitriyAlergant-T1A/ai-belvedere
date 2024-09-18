const logToConsole = async (streamName, requestId, logsData) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${requestId}: ${streamName} ${JSON.stringify(logsData)}`);
}

export default logToConsole;