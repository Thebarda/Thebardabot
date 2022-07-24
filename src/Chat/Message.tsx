import { Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { equals, find, isEmpty, isNil } from "ramda";
import { makeStyles } from 'tss-react/mui';
import { emotesAtom } from "../atoms";
import { ChatMessage } from "../models";
import parse from 'html-react-parser';
import { memo } from "react";

interface Props {
  chatMessage?: ChatMessage;
}

interface MakeStylesProps {
  type?: "chat" | "action" | "whisper" | "connect";
  hasPrime: boolean;
  isBroadcaster: boolean;
}

const useStyles = makeStyles<MakeStylesProps>()((theme) => ({
  welcomeMessage: {
    color: theme.palette.grey[500],
    fontSize: theme.typography.overline.fontSize,
  },
  text: {
    fontSize: theme.typography.body2.fontSize,
  },
  message: {
    fontSize: theme.typography.body2.fontSize,
  },
  emote: {
    margin: theme.spacing(0, 0.4),
    verticalAlign: 'middle'
  },
  badge: {
    marginRight: theme.spacing(0.5),
    verticalAlign: 'middle'
  }
}));

const Message = ({ chatMessage }: Props) => {
  const { classes } = useStyles({ type: chatMessage?.type, hasPrime: chatMessage?.hasPrime || false, isBroadcaster: chatMessage?.isBroadcaster || false });

  const emotes = useAtomValue(emotesAtom);
  
  if (isNil(chatMessage)) {
    return null;
  }
  
  const { hasPrime, isBroadcaster, color, displayName, message, type } = chatMessage;

  if (equals(type, 'connect')) {
    return <Typography className={classes.welcomeMessage}><em>{message}</em></Typography>
  }
  const parseMessage = () => {
    let words: Array<string> = [];
    let fragments: Array<string> = [];
    
    message.split(' ').forEach((word) => {
      const emote = find(({ name }) => equals(name, word), emotes);

      if (isNil(emote)) {
        words.push(word);
        return;
      }

      if (!isEmpty(words)) {
        fragments.push(`<span>${words.join(' ')}</span>`);
        words = [];
      }
      fragments.push(`<img alt="${emote.name}" src="${emote.url}" className="${classes.emote}" />`)
    });

    fragments.push(`<span>${words.join(' ')}</span>`)

    return fragments;
  }

  return (
    <div>
      {isBroadcaster && (
        <img src="https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1" alt="Broadcaster" className={classes.badge} />
      )}
      {hasPrime && (
        <img src="https://static-cdn.jtvnw.net/badges/v1/bbbe0db0-a598-423e-86d0-f9fb98ca1933/1" alt="Broadcaster" className={classes.badge} />
      )}
      <Typography component="span" className={classes.text}><Typography component="span" className={classes.text} sx={{ color, fontWeight: 'bold' }}>{displayName}</Typography>: </Typography>
      <span className={classes.message}>{parse(parseMessage().join(''))}</span>
    </div>
  )
}

export default memo(Message);