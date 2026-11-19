'use client';

import { FeatureSettingsManager } from '@/features/exhibition/feature-settings';
import { Header } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const RegistrationFeaturesPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex flex-1 justify-center p-16">
        <FeatureSettingsManager />
      </div>
    </div>
  );
};

export default RegistrationFeaturesPage;
