import { getContrastRatio, lighten, Typography, useTheme } from "@mui/material";
import { dec, equals, find, findIndex, flatten, gte, has, isEmpty, isNil, last, max, min, pipe, slice, test, toPairs } from "ramda";
import { makeStyles } from 'tss-react/mui';
import { Badge, ChatMessage, Emote } from "../models";
import parse from 'html-react-parser';
import { memo, FC } from "react";

interface Props {
  chatMessage?: ChatMessage;
  emotes: Array<Emote>;
  badges: Array<Badge>;
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
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    }
  }
}));

const Message: FC<Props> = ({ chatMessage, emotes, badges }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  
  if (isNil(chatMessage)) {
    return null;
  }
  
  const { badges: userBadges, color, displayName, message, type, emotes: testEmotes } = chatMessage;

  if (equals(type, 'connect')) {
    return <Typography className={classes.welcomeMessage}><em>{message}</em></Typography>
  }

  const renderWords = (words: Array<string>) => {
    return words.map((word) => {
      if (!test(/^(http|https):\/\//, word)) {
        return word;
      }

      return `<a href=${word} target="_blank" rel="noopener noreferrer" class=${classes.link}>${word}</a>`;
    })
  }

  const parseMessage = (): Array<string | Array<string>> => {
    const emotesIndexes =  message.split(' ').map((word, index) => {
      const emoteFromEmotesList = toPairs(testEmotes || {}).find(([badge, positions]) => positions.some((position) => {
        const [start, end] = position.split('-');
        const wordFromPosition = message.substring(Number(start), Number(end) + 1);

        return equals(wordFromPosition, word);
      }));

      if (!isNil(emoteFromEmotesList)) {
        return {
          url: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteFromEmotesList[0]}/default/dark/1.0`,
          badge: emoteFromEmotesList[0],
          index,
        }
      }

      const emoteIndex = findIndex(({ name }) => equals(name, word), emotes);

      if (equals(emoteIndex, -1)) {
        return undefined;
      }

      return index;
    }).filter((index) => !isNil(index)) as Array<number | { badge: string; url: string; index: number; }>;

    if (isEmpty(emotesIndexes) || isNil(emotesIndexes)) {
      return [`<span>${renderWords(message.split(' ')).join(' ')}</span>`]
    }

    return emotesIndexes.map((emoteIndex, index) => {
      const isFirstElement = equals(index, 0);

      if (has('badge', emoteIndex)) {
        return [
          `<span>${pipe(slice(isFirstElement ? 0 : emoteIndex.index, emoteIndex.index) as (list: Array<string>) => Array<string>, renderWords)(message.split(' ')).join(' ')}</span>`,
          `<img alt="${emoteIndex.badge}" src="${emoteIndex.url}" className="${classes.emote}" />`
        ]
      }
      const emote = find(({ name }) => equals(name, message.split(' ')[emoteIndex]), emotes) as Emote;

      if (equals(emoteIndex, 0) || equals(emoteIndex - (emotesIndexes as Array<number>)[index - 1], 1)) {
        return [`<img alt="${emote.name}" src="${emote.url}" className="${classes.emote}" />`]
      }

      return [
        `<span>${pipe(slice(isFirstElement ? 0 : emoteIndex - 1, emoteIndex) as (list: Array<string>) => Array<string>, renderWords)(message.split(' ')).join(' ')}</span>`,
        `<img alt="${emote.name}" src="${emote.url}" className="${classes.emote}" />`
      ]
    })
  }

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