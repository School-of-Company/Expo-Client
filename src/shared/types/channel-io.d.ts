export {};

declare global {
  interface IChannelIO {
    (cmd: string, ...args: unknown[]): void;
    q?: unknown[];
    c?: (args: unknown[]) => void;
  }

  interface Window {
    ChannelIO?: IChannelIO;

    ChannelIOInitialized?: boolean;

    __channelioLoaded?: boolean;
    __channelioBooted?: boolean;
  }
}
