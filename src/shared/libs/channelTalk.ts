let loaded = false;

export function loadChannelTalk() {
  if (typeof window === 'undefined') return;

  if (window.ChannelIO && window.ChannelIOInitialized) return;
  if (loaded) return;
  loaded = true;

  (function () {
    const w = window as Window & { ChannelIO?: IChannelIO };
    if (w.ChannelIO) return;

    const ch = (function () {
      const fn = function (cmd: string, ...args: unknown[]) {
        (fn as IChannelIO).c?.([cmd, ...args]);
      } as IChannelIO;

      fn.q = [];
      fn.c = function (args: unknown[]) {
        (fn.q as [string, ...unknown[]][])!.push(
          args as [string, ...unknown[]],
        );
      };

      return fn;
    })();

    w.ChannelIO = ch;

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
    s.charset = 'UTF-8';
    const x = document.getElementsByTagName('script')[0];
    x?.parentNode?.insertBefore(s, x);
  })();
}

type User = {
  id?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  avatar_url?: string;
  profile?: Record<string, unknown>;
};

export function bootChannelTalk(user?: User) {
  if (typeof window === 'undefined') return;
  const pluginKey = process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY;
  if (!pluginKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('ChannelTalk: plugin key missing');
    }
    return;
  }
  window.ChannelIO?.('boot', {
    pluginKey,
    language: 'ko',
    memberId: user?.id,
    profile: {
      name: user?.name,
      email: user?.email,
      mobileNumber: user?.phoneNumber,
      avatarUrl: user?.avatar_url,
      ...user?.profile,
    },
  });
  window.ChannelIOInitialized = true;
}

export function shutdownChannelTalk() {
  if (typeof window === 'undefined') return;
  try {
    window.ChannelIO?.('shutdown');
  } catch (error) {
    console.error(error);
  }
  window.ChannelIOInitialized = false;
}

export function openChannel() {
  if (typeof window === 'undefined') return;
  window.ChannelIO?.('showMessenger');
}

export function trackChannel(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.ChannelIO?.('track', event, props || {});
}
