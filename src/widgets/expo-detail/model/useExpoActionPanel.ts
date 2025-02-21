import { useState, useEffect } from 'react';

export const useExpoActionPanel = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const openModal = (content: string) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return {
    isModalOpen,
    modalContent,
    openModal,
    closeModal,
  };
};
