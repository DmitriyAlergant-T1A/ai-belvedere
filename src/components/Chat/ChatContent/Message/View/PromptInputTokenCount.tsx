import React, { useEffect, useMemo, useState } from 'react';
import useStore from '@store/store';
import countTokens from '@utils/messageUtils';
import { _defaultChatConfig, supportedModels } from '@constants/chat';

interface TokenCountProps {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

const PromptInputTokenCount = React.memo<TokenCountProps>(({ content, role }) => {

  const [tokenCount, setTokenCount] = useState<number>(0);

  const requestTokensCount = useStore((state) => state.requestTokensCount);

  const generating = useStore((state) => state.generating);
  const model = useStore((state) =>
    state.chats
      ? state.chats[state.currentChatIndex].config.model
      : _defaultChatConfig.model
  );

  const cost = useMemo(() => {
    const price =
      supportedModels[model].cost.prompt.price  * (tokenCount / supportedModels[model].cost.prompt.unit);
    return price.toFixed(2);
  }, [model, tokenCount]);

  useEffect(() => {
    if (!generating && content && content.length > 0) {
      setTokenCount(
        countTokens(
          [
            {
              content,
              role: role,
            },
          ],
          model,
          false
        )
      );
    } else {
      setTokenCount(0);
    }
  }, [content, generating]);

  /*If requests tokens display is disabled in Settings, show nothing*/
  if (!requestTokensCount) {
    return null;
  }

  return (
    <div className='top-[-16px] left-0'>
      <div className='text-xs italic text-gray-900 dark:text-gray-300'>
        This prompt is approximately {tokenCount} tokens plus size of the previously accummulated chat context
      </div>
    </div>
  );
});

export default PromptInputTokenCount;