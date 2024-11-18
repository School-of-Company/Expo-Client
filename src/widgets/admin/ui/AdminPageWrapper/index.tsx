'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { AdminProfile } from '@/entities/admin';
import { SignUpItem } from '@/shared/types/\bSignUp/type';
import { ExpoItem } from '@/shared/types/Expo/type';
import { TableForm } from '@/shared/ui/Table';

const AdminPageWrapper = () => {
  const [expoList, setExpoList] = useState<ExpoItem[]>([]);
  const [requestSignUp, setRequestSignUp] = useState<SignUpItem[]>([]);

  const fetchExpoList = async () => {
    const response = await axios.get('/api/expo');
    setExpoList(
      response.data.map(
        ({ coverImage: _coverImage, ...rest }: ExpoItem) => rest,
      ),
    );
  };

  const fetchRequestSignUp = async () => {
    const response = await axios.get('/api/admin');
    setRequestSignUp(response.data);
  };

  useEffect(() => {
    fetchExpoList();
    fetchRequestSignUp();
  }, []);

  return (
    <div className="space-y-[73px]">
      <AdminProfile />
      <div className="space-y-[26px]">
        <p className="text-h2 text-black">회원가입 요청</p>
        <div className="h-auto">
          <TableForm
            data={requestSignUp}
            maxHeight="270px"
            footerType="default"
          />
        </div>
      </div>
      <div className="space-y-[26px]">
        <p className="text-h2 text-black">등록된 박람회</p>
        <div className="h-auto">
          <TableForm data={expoList} maxHeight="414px" footerType="default" />
        </div>
      </div>
    </div>
  );
};

export default AdminPageWrapper;
