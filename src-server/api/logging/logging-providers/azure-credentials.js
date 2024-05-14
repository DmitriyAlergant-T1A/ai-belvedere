import { DefaultAzureCredential } from "@azure/identity";

const azureCredential = new DefaultAzureCredential();

export const getAzureCredential = () => {
  if (!azureCredential) {
    azureCredential = new DefaultAzureCredential();
    console.log(azureCredential);
  }
  return azureCredential;
};