import { Typography } from "@mui/material";
import { isEmpty } from "ramda";
import { memo, useEffect, useRef, FC } from "react";
import { makeStyles } from "tss-react/mui";
import Message from "./Message";
import { Badge, ChatMessage, Emote } from "../models";

const useStyles = makeStyles()((theme) => ({
  messagesContainer: {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: theme.spacing(2, 0, 2, 4),
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(0.5),
  },
}))

interface Props {
  channel: string;
  emotes: Array<Emote>;
  badges: Array<Badge>;
  chatMessages: Array<ChatMessage>;
}

const Messages: FC<Props> = ({ channel, chatMessages, emotes, badges }) => {
  const { classes } = useStyles();

  const parentRef = useRef<HTMLDivElement | null>(null);

  const resize = () => {
    parentRef.current?.scrollTo({
      top: parentRef.current?.scrollHeight,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    resize();
  }, [chatMessages]);

  useEffect(() => {
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 150px)' }}>
      <div className={classes.messagesContainer} ref={parentRef}>
        {isEmpty(chatMessages) ? <Typography component="em" variant="caption">Connecting to {channel}...</Typography> : chatMessages.map((message) => (
          <Message chatMessage={message} key={message?.id} emotes={emotes} badges={badges} />
        ))}
      </div>
    </div>
  )
}

export default memo(Messages);