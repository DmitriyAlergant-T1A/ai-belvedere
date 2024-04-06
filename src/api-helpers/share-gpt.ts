import { ShareGPTSubmitBodyInterface } from "@type/share-gpt";


export const submitShareGPT = async (body: ShareGPTSubmitBodyInterface) => {
    const request = await fetch('https://sharegpt.com/api/conversations', {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  
    const response = await request.json();
    const { id } = response;
    const url = `https://shareg.pt/${id}`;
    window.open(url, '_blank');
  };