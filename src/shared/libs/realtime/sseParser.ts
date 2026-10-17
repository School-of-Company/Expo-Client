/** text/event-stream 한 건. event 가 없으면 'message' */
export interface SseMessage {
  event: string;
  data: string;
  id?: string;
}

interface SseParserHandlers {
  onMessage: (message: SseMessage) => void;
  /** 서버가 retry: 로 정한 재연결 대기(ms) */
  onRetry?: (ms: number) => void;
}

/**
 * fetch 스트림에서 받은 문자열 조각을 SSE 메시지로 나눈다(WHATWG 규칙).
 * 조각이 줄 중간에서 끊겨도 다음 조각과 이어 읽고, 빈 줄을 만나면 한 건으로 보낸다.
 * ':' 로 시작하는 주석 줄(heartbeat)은 메시지로 만들지 않는다
 */
export const createSseParser = ({ onMessage, onRetry }: SseParserHandlers) => {
  let buffer = '';
  let isFirstChunk = true;
  // 앞 조각이 \r 로 끝났으면 다음 조각의 \n 은 같은 줄바꿈이다
  let pendingCr = false;
  let event = '';
  let data: string[] = [];
  let id: string | undefined;
  let lastEventId: string | undefined;

  const dispatch = () => {
    if (id !== undefined) lastEventId = id;
    if (data.length > 0) {
      onMessage({
        event: event || 'message',
        data: data.join('\n'),
        ...(lastEventId !== undefined && { id: lastEventId }),
      });
    }
    event = '';
    data = [];
    id = undefined;
  };

  const readLine = (line: string) => {
    if (line === '') {
      dispatch();
      return;
    }
    if (line.startsWith(':')) return;

    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);

    switch (field) {
      case 'event':
        event = value;
        break;
      case 'data':
        data.push(value);
        break;
      case 'id':
        // NUL 이 든 id 는 규칙상 무시한다
        if (!value.includes('\0')) id = value;
        break;
      case 'retry':
        if (/^\d+$/.test(value)) onRetry?.(Number(value));
        break;
      default:
        break;
    }
  };

  return {
    push(chunk: string) {
      let text = chunk;
      if (isFirstChunk && text.length > 0) {
        isFirstChunk = false;
        if (text.startsWith('﻿')) text = text.slice(1);
      }
      if (pendingCr && text.startsWith('\n')) text = text.slice(1);
      pendingCr = false;
      buffer += text;

      let start = 0;
      for (let index = 0; index < buffer.length; index += 1) {
        const char = buffer[index];
        if (char !== '\n' && char !== '\r') continue;
        readLine(buffer.slice(start, index));
        if (char === '\r') {
          if (index + 1 === buffer.length) pendingCr = true;
          else if (buffer[index + 1] === '\n') index += 1;
        }
        start = index + 1;
      }
      buffer = buffer.slice(start);
    },
    /** 마지막으로 받은 SSE id. 재연결할 때 Last-Event-ID 로 보낸다 */
    get lastEventId() {
      return lastEventId;
    },
  };
};
