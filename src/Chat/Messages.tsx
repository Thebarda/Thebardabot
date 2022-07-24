import { useAtomValue } from "jotai";
import { isNil, lt } from "ramda";
import { memo, useEffect, useRef, useState } from "react";
import { chatMessagesAtom } from "../atoms";
import Message from "./Message";

const Messages = () => {
  const messages = useAtomValue(chatMessagesAtom);

  const [translation, setTranslation] = useState(0);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const chatListRef = useRef<HTMLDivElement | null>(null);

  const resize = () => {
    const tr = (parentRef.current?.getBoundingClientRect().height || 0) - (chatListRef.current?.getBoundingClientRect().height || 0) - 8
    setTranslation(lt(tr, 0) ? -8 : tr)
    parentRef.current?.scrollTo({
      top: parentRef.current?.scrollHeight,
    })
  }

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [messages]);

  useEffect(() => {
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, []);

  return (
    <div style={{ width: '340px', height: '100%', overflowY: 'auto' }} ref={parentRef}>
      <div 
        ref={chatListRef}
        style={{
          transform: `translateY(${translation}px)`,
        }}
      >
        {messages.map((message) => (
          <Message chatMessage={message} key={message?.id} />
        ))}
      </div>
    </div>
  )
}

export default memo(Messages);