'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { checkActions, deleteActions } from '@/shared/model/footerActions';
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

  const expoListCategories = [
    '번호',
    '박람회이름',
    '박람회 설명',
    '모집 시작 날짜',
    '모집 종료 날짜',
  ];

  const requestSignUpCategories = [
    '번호',
    '성명',
    '아이디',
    '이메일',
    '연락처',
  ];

  const checkSignupActions = checkActions(fetchRequestSignUp);
  const deleteExpoActions = deleteActions(fetchExpoList);

  return (
    <div className="space-y-[73px]">
      <div className="space-y-[26px]">
        <p className="text-h2 text-black">회원가입 요청</p>
        <div className="h-auto">
          <TableForm
            categories={requestSignUpCategories}
            data={requestSignUp}
            maxHeight="270px"
            footerType="check"
            text="회원가입 요청"
            actions={checkSignupActions}
          />
        </div>
      </div>
      <div className="space-y-[26px]">
        <p className="text-h2 text-black">등록된 박람회</p>
        <div className="h-auto">
          <TableForm
            categories={expoListCategories}
            data={expoList}
            maxHeight="414px"
            footerType="delete"
            text="등록된 박람회"
            actions={deleteExpoActions}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPageWrapper;
