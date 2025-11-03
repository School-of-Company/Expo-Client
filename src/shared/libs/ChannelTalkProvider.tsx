'use client';

import { useEffect, useRef } from 'react';
import {
  loadChannelTalk,
  bootChannelTalk,
  shutdownChannelTalk,
} from './channelTalk';

type Props = {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
  } | null;
};

export default function ChannelTalkProvider({ user }: Props) {
  const mountedRef = useRef(false);

  useEffect(() => {
    loadChannelTalk();
  }, []);

  useEffect(() => {
    if (mountedRef.current) {
      bootChannelTalk(
        user?.id
          ? {
              id: user.id,
              name: user?.name,
              email: user?.email,
              phoneNumber: user?.phoneNumber,
            }
          : undefined,
      );
      return;
    }
    mountedRef.current = true;

    bootChannelTalk(
      user?.id
        ? {
            id: user.id,
            name: user?.name,
            email: user?.email,
            phoneNumber: user?.phoneNumber,
          }
        : undefined,
    );

    return () => {
      shutdownChannelTalk();
    };
  }, [user?.id]);

  return null;
}
