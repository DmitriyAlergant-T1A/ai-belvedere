import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  memo,
  useState,
} from 'react';

import ReactMarkdown from 'react-markdown';
import { CodeProps, ReactMarkdownProps } from 'react-markdown/lib/ast-to-react';

import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import useStore from '@store/store';

import TickIcon from '@icon/TickIcon';
import CrossIcon from '@icon/CrossIcon';

import useSubmit from '@hooks/useSubmit';

import { ChatInterface } from '@type/chat';

import { codeLanguageSubset } from '@constants/chat';

import RefreshButton from './Button/RefreshButton';
import UpButton from './Button/UpButton';
import DownButton from './Button/DownButton';
import CopyButton from './Button/CopyButton';
import EditButton from './Button/EditButton';
import DeleteButton from './Button/DeleteButton';
import MarkdownModeButton from './Button/MarkdownModeButton';

import CodeBlock from '../CodeBlock';
import LikeButton from './Button/LikeButton';

import { useTranslation } from 'react-i18next';
import useValidatePreSubmit from '@hooks/useValidatePreSubmit';

const ContentView = memo(
  ({
    role,
    content,
    setIsEdit,
    messageIndex,
  }: {
    role: string;
    content: string;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    messageIndex: number;
  }) => {
    const { handleSubmit } = useSubmit();

    const [isDelete, setIsDelete] = useState<boolean>(false);

    const currentChatIndex = useStore((state) => state.currentChatIndex);
    const setChats = useStore((state) => state.setChats);
    const lastMessageIndex = useStore((state) =>
      state.chats ? state.chats[state.currentChatIndex].messages.length - 1 : 0
    );
    const inlineLatex = useStore((state) => state.inlineLatex);
    const markdownMode = useStore((state) => state.markdownMode);

    const generatingState = useStore((state) => state.generating);

    const { t } = useTranslation();

    const { validateMessages } = useValidatePreSubmit();

    const handleDelete = () => {
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );

      //Only allow deleting User messages. The button should be hidden in the UI otherwise, anyway*
      if (updatedChats[currentChatIndex].messages[messageIndex].role === 'user')
      {
        //Delete this User message
        updatedChats[currentChatIndex].messages.splice(messageIndex, 1);
        
        if (messageIndex < updatedChats[currentChatIndex].messages.length)
          if (updatedChats[currentChatIndex].messages[messageIndex].role === 'assistant')
            //Also delete the following Assistant message
            updatedChats[currentChatIndex].messages.splice(messageIndex, 1);

        setChats(updatedChats);
      }
    };

    // const handleMove = (direction: 'up' | 'down') => {
    //   const updatedChats: ChatInterface[] = JSON.parse(
    //     JSON.stringify(useStore.getState().chats)
    //   );
    //   const updatedMessages = updatedChats[currentChatIndex].messages;
    //   const temp = updatedMessages[messageIndex];
    //   if (direction === 'up') {
    //     updatedMessages[messageIndex] = updatedMessages[messageIndex - 1];
    //     updatedMessages[messageIndex - 1] = temp;
    //   } else {
    //     updatedMessages[messageIndex] = updatedMessages[messageIndex + 1];
    //     updatedMessages[messageIndex + 1] = temp;
    //   }
    //   setChats(updatedChats);
    // };

    // const handleMoveUp = () => {
    //   handleMove('up');
    // };

    // const handleMoveDown = () => {
    //   handleMove('down');
    // };

    const handleRefresh = () => {
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      const updatedMessages = updatedChats[currentChatIndex].messages;
      updatedMessages.splice(updatedMessages.length - 1, 1);

      // Validate the messages for submission (mainly for checking token limits etc)
      if (validateMessages(updatedMessages) === false) return;

      setChats(updatedChats);
      handleSubmit();
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
    };

    return (
      <>
        <div className='markdown prose w-full md:max-w-full break-words dark:prose-invert dark share-gpt-message'>
          {/* Only apply Markdown for AI responses (role 'Assistant'); Also only if enabled by the button */}
          {markdownMode && role === 'assistant'? (
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
                [remarkMath, { singleDollarTextMath: inlineLatex }],
              ]}
              rehypePlugins={[
                rehypeKatex,
                [
                  rehypeHighlight,
                  {
                    detect: true,
                    ignoreMissing: true,
                    subset: codeLanguageSubset,
                  },
                ],
              ]}
              linkTarget='_new'
              components={{
                code,
                p,
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <span className='whitespace-pre-wrap'>{content}</span>
          )}
        </div>
        <div className='flex justify-end gap-2 w-full mt-2'>
          {!isDelete && (
            <>
              {!generatingState &&
                role === 'assistant' &&
                messageIndex === lastMessageIndex && (
                   <RefreshButton onClick={handleRefresh} />
                )}
              {messageIndex !== 1 && 
                <>
                  {/* <UpButton onClick={handleMoveUp} /> */}
                </>
              }
              {messageIndex !== lastMessageIndex && (
                <>
                  {/* <DownButton onClick={handleMoveDown} /> */}
                </>
              )}

              {(role === 'user' || role === 'assistant') && <EditButton setIsEdit={setIsEdit} />}
              {role === 'assistant' && <MarkdownModeButton />}

              {role === 'user'      && <DeleteButton setIsDelete={setIsDelete} />}
              {/* {role === 'assistant' && <LikeButton />} */}

              <CopyButton onClick={handleCopy} />
            </>
          )}
          {isDelete && (
            <>
              <span className='text-sm text-gray-500 dark:text-gray-300'>{t('deleteConfirmation')}</span>
              <button
                className='p-1 hover:text-white'
                aria-label='cancel'
                onClick={() => setIsDelete(false)}
              >
                <CrossIcon />
              </button>
              <button
                className='p-1 hover:text-white'
                aria-label='confirm'
                onClick={handleDelete}
              >
                <TickIcon />
              </button>
            </>
          )}
        </div>
      </>
    );
  }
);

const code = memo((props: CodeProps) => {
  const { inline, className, children } = props;
  const match = /language-(\w+)/.exec(className || '');
  const lang = match && match[1];

  if (inline) {
    return <code className={className}>{children}</code>;
  } else {
    return <CodeBlock lang={lang || 'text'} codeChildren={children} />;
  }
});

const p = memo(
  (
    props?: Omit<
      DetailedHTMLProps<
        HTMLAttributes<HTMLParagraphElement>,
        HTMLParagraphElement
      >,
      'ref'
    > &
      ReactMarkdownProps
  ) => {
    return <p className='whitespace-pre-wrap'>{props?.children}</p>;
  }
);

export default ContentView;
