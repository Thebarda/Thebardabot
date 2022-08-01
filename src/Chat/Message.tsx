import { getContrastRatio, lighten, Typography, useTheme } from "@mui/material";
import { useAtomValue } from "jotai";
import { dec, equals, find, findIndex, flatten, gt, gte, isEmpty, isNil, keys, last, max, min, slice } from "ramda";
import { makeStyles } from 'tss-react/mui';
import { badgesAtom, emotesAtom } from "../atoms";
import { ChatMessage, Emote } from "../models";
import parse from 'html-react-parser';
import { memo } from "react";

interface Props {
  chatMessage?: ChatMessage;
}

const useStyles = makeStyles()((theme) => ({
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
    verticalAlign: 'middle',
  },
  badge: {
    marginRight: theme.spacing(0.5),
    verticalAlign: 'middle'
  }
}));

const Message = ({ chatMessage }: Props) => {
  const { classes } = useStyles();
  const theme = useTheme();

  const emotes = useAtomValue(emotesAtom);
  const badges = useAtomValue(badgesAtom);
  
  if (isNil(chatMessage)) {
    return null;
  }
  
  const { badges: userBadges, color, displayName, message, type } = chatMessage;

  if (equals(type, 'connect')) {
    return <Typography className={classes.welcomeMessage}><em>{message}</em></Typography>
  }

  const parseMessage = (): Array<string | Array<string>> => {
    const emotesIndexes =  message.split(' ').map((word, index) => {
      const emoteIndex = findIndex(({ name }) => equals(name, word), emotes);

      if (equals(emoteIndex, -1)) {
        return undefined;
      }

      return index;
    }).filter((index) => !isNil(index)) as Array<number>;

    if (isEmpty(emotesIndexes)) {
      return [`<span>${message}</span>`]
    }

    return emotesIndexes.map((emoteIndex, index) => {
      const emote = find(({ name }) => equals(name, message.split(' ')[emoteIndex]), emotes) as Emote;

      if (equals(emoteIndex, 0) || equals(emoteIndex - emotesIndexes[index - 1], 1)) {
        return [`<img alt="${emote.name}" src="${emote.url}" className="${classes.emote}" />`]
      }

      const isFirstElement = equals(index, 0);

      return [
        `<span>${slice(isFirstElement ? 0 : emoteIndex - 1, emoteIndex, message.split(' ')).join(' ')}</span>`,
        `<img alt="${emote.name}" src="${emote.url}" className="${classes.emote}" />`
      ]
    })
  }

  console.log(displayName, color, getContrastRatio(color || '#fff', theme.palette.background.default))

  const usernameColor = getContrastRatio(color || '#fff', theme.palette.background.default) < 4 ? lighten(color || '#fff' , 0.4) : color;

  const messageBadges = Object.entries(userBadges || {}).map(([key, value]) => {
    const badge = badges.find(({ set_id, }) => equals(set_id, key));
    
    if (isNil(badge) || isNil(value)) {
      return undefined;
    }

    const index = dec(min(parseInt(value, 10), badge.versions.length));

    if (equals(key, 'subscriber') || equals(key, 'bits')) {
      const selectedVersions = badge.versions.filter(({ id }) => gte(parseInt(value, 10), parseInt(id, 10)));
      const sortedVersions = selectedVersions.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
      const img = last(sortedVersions || [])?.image_url_1x;

      if (isNil(img)) {
        return undefined;
      }

      return `<img src="${img}" alt="${badge.set_id}" className="${classes.badge}" />`;
    }
    
    return `<img src="${badge.versions[max(index, 0)]?.image_url_1x}" alt="${badge.set_id}" className="${classes.badge}" />`;
  }).filter(Boolean);

  return (
    <div>
      {parse(messageBadges.join(''))}
      <Typography component="span" className={classes.text}><Typography component="span" className={classes.text} sx={{ color: usernameColor, fontWeight: 'bold' }}>{displayName}</Typography>: </Typography>
      <span className={classes.message}>{parse(flatten(parseMessage()).join(''))}</span>
    </div>
  )
}

export default memo(Message);