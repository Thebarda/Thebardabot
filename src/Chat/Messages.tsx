import { useAtomValue } from "jotai";
import { memo, useEffect, useRef } from "react";
import { makeStyles } from "tss-react/mui";
import { chatMessagesAtom } from "../atoms";
import Message from "./Message";

const useStyles = makeStyles()((theme) => ({
  messagesContainer: {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: theme.spacing(2, 0, 2, 4),
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(0.5)
  },
}))

const Messages = () => {
  const { classes } = useStyles();

  const messages = useAtomValue(chatMessagesAtom);

  const parentRef = useRef<HTMLDivElement | null>(null);

  const resize = () => {
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
    <div className={classes.messagesContainer} ref={parentRef}>
        {messages.map((message) => (
          <Message chatMessage={message} key={message?.id} />
        ))}
    </div>
  )
}

export default memo(Messages);