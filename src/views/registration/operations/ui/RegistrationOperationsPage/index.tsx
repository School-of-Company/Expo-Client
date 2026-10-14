'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ExpoOperations } from '@/features/registration/operations';
import { FormTypeModal } from '@/shared/ui';
import { Header, ModalLayout } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const RegistrationOperationsPage = () => {
  const { expoId } = useParams<{ expoId: string }>();
  const [modal, setModal] = useState<{ type: string; text: string } | null>(
    null,
  );

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex flex-1 justify-center p-16">
        <ExpoOperations
          onOpenModal={(type, text) => setModal({ type, text })}
        />
      </div>
      {modal && (
        <ModalLayout>
          <FormTypeModal
            text={modal.text}
            onClose={() => setModal(null)}
            params={expoId}
            modalType={modal.type}
          />
        </ModalLayout>
      )}
    </div>
  );
};

export default RegistrationOperationsPage;
