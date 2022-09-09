import { Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { isEmpty } from "ramda";
import { memo, useEffect, useRef } from "react";
import { makeStyles } from "tss-react/mui";
import { channelAtom, chatMessagesAtom } from "../atoms";
import Message from "./Message";

const useStyles = makeStyles()((theme) => ({
  messagesContainer: {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: theme.spacing(2, 0, 2, 4),
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(0.5),
    marginTop: theme.spacing(8)
  },
}))

const Messages = () => {
  const { classes } = useStyles();

  const messages = useAtomValue(chatMessagesAtom);
  const channel = useAtomValue(channelAtom);

  const parentRef = useRef<HTMLDivElement | null>(null);

  const resize = () => {
    parentRef.current?.scrollTo({
      top: parentRef.current?.scrollHeight,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    resize();
  }, [messages]);

  useEffect(() => {
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, []);

  return (
    <div className={classes.messagesContainer} ref={parentRef}>
      {isEmpty(messages) ? <Typography component="em" variant="caption">Connecting to {channel}...</Typography> : messages.map((message) => (
        <Message chatMessage={message} key={message?.id} />
      ))}
    </div>
  )
}

export default memo(Messages);