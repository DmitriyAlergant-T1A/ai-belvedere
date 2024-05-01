

const logToConsole = async(streamName, requestId, logsData) => {
    /* TBC log datetime */
    console.log(`${requestId}: ${streamName} ${JSON.stringify(logsData)}`)
}

export default logToConsole;