import React, { useState, useEffect } from 'react';
import PopupModal from '@components/PopupModal';
import AboutIcon from '@icon/AboutIcon';
import useStore from '@store/store';

const DemoModeModal = () => {
  const demoMode = useStore((state) => state.demoMode);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (demoMode) {
      setIsModalOpen(true);
    }
  }, [demoMode]);

  return (
    <>
      <a
        className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm'
        onClick={() => setIsModalOpen(true)}
      >
        <div>
          <AboutIcon />
        </div>
        Demo Mode
      </a>
      {isModalOpen && (
        <PopupModal
          title="Demo Mode"
          setIsModalOpen={setIsModalOpen}
          cancelButton={true} // Enable cancel button for dismissing
        >
          <div className="p-6 text-gray-900 dark:text-gray-300">
            <h2 className="text-xl font-bold mb-4">Welcome to AI Belvedere Demo Mode</h2>
            <p className="mb-2">You are currently using the AI Belvedere application in Demo Mode to showcase its UI.</p>
            <p className="mb-2">In Demo Mode:</p>
            <ul className="list-disc list-inside mb-4">
              <li>All model responses are simulated and do not actually connect to any AI LLM providers</li>
              <li>User authentication is not required (integration with Auth0 or Azure AD is disabled)</li>
            </ul>
            <p className="mt-2">
              Please refer to <a href="https://github.com/DmitriyAlergant-T1A/ai-belvedere/" className="text-blue-500 hover:text-blue-700">README.md</a> for deployment instructions.
            </p>
          </div>
        </PopupModal>
      )}
    </>
  );
};

export default DemoModeModal;
