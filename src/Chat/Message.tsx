import { getContrastRatio, lighten, Tooltip, Typography, useTheme } from "@mui/material";
import { dec, equals, find, findIndex, flatten, gt, has, isEmpty, isNil, max, min, pipe, propEq, slice, test, toPairs } from "ramda";
import { makeStyles } from 'tss-react/mui';
import { Badge, ChatMessage, Emote } from "../models";
import { memo, FC, ReactNode } from "react";

interface Props {
  chatMessage?: ChatMessage;
  emotes: Array<Emote>;
  badges: Array<Badge>;
}

interface RenderBadgeProps {
  badge: Badge;
  value: string;
  title?: string;
}

interface EmoteInMessage { badge: string; url: string; index: number; word: string; };

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
    cursor: 'pointer',
  },
  badge: {
    marginRight: theme.spacing(0.5),
    verticalAlign: 'middle',
    cursor: 'pointer',
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    }
  },
  messageContainer: {
    paddingLeft: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: lighten(theme.palette.background.default, 0.2),
    }
  },
  tooltip: {
    fontSize: theme.typography.body2.fontSize
  }
}));

const Text: FC<{ children: string | Array<ReactNode> }> = ({ children }) => <Typography variant="body2" component="span">{children}</Typography>;

const EmoteWithTooltip: FC<{ emote: Emote }> = ({ emote }) => {
  const { classes } = useStyles();

  return (
    <Tooltip title={emote.name} placement="top" classes={{ tooltip: classes.tooltip }}>
      <img alt={emote.name} src={emote.url} className={classes.emote} />
    </Tooltip>
  )
}

const BadgeWithTooltip: FC<{ badge: Badge; img: string; title?: string; }> = ({ badge, img, title }) => {
  const { classes } = useStyles();

  return (
    <Tooltip title={title || badge.set_id} placement="top" classes={{ tooltip: classes.tooltip }}>
      <img alt={badge.set_id} src={img} className={classes.badge} />
    </Tooltip>
  )
}

const Message: FC<Props> = ({ chatMessage, emotes, badges }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  
  if (isNil(chatMessage)) {
    return null;
  }
  
  const { badges: userBadges, color, displayName, message, type, emotes: testEmotes, subscriberBadgeMessage, badgeInfo } = chatMessage;

  if (equals(type, 'connect')) {
    return <Typography className={classes.welcomeMessage}><em>{message}</em></Typography>
  }

  const renderWords = (words: Array<string>): Array<string | ReactNode> => {
    return words.map((word) => {
      if (!test(/^(http|https):\/\//, word)) {
        return word + " ";
      }

      return <a href={word} target="_blank" rel="noopener noreferrer" className={classes.link}>{word}</a>;
    })
  }

  const renderBadge = ({ badge, value, title }: RenderBadgeProps) => {
    const selectedBadge = badge.versions.find(propEq('id', value));

    if (isNil(selectedBadge)) {
      return undefined;
    }

    return <BadgeWithTooltip img={selectedBadge.image_url_1x} badge={badge} title={title} />;
  }

  const parseMessage = (): Array<ReactNode | Array<ReactNode>> => {
    const emotesIndexes =  message.split(' ').map((word, index) => {
      const emoteFromEmotesList = toPairs(testEmotes || {}).find(([badge, positions]) => positions.some((position) => {
        const [start, end] = position.split('-');
        const wordFromPosition = message.substring(Number(start), Number(end) + 1);

        return equals(wordFromPosition, word);
      }));

      if (!isNil(emoteFromEmotesList)) {
        const [start, end] = emoteFromEmotesList[1][0].split('-');
        const wordFromPosition = message.substring(Number(start), Number(end) + 1);

        return {
          url: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteFromEmotesList[0]}/default/dark/1.0`,
          badge: emoteFromEmotesList[0],
          index,
          word: wordFromPosition,
        }
      }

      const emoteIndex = findIndex(({ name }) => equals(name, word), emotes);

      if (equals(emoteIndex, -1)) {
        return undefined;
      }

      return index;
    }).filter((index) => !isNil(index)) as Array<number | EmoteInMessage>;

    if (isEmpty(emotesIndexes) || isNil(emotesIndexes)) {
      return [<Text>{renderWords(message.split(' '))}</Text>]
    }

    return emotesIndexes.map((emoteIndex, index) => {
      const isFirstElement = equals(index, 0);
      const previousEmoteIndex = has('badge', emotesIndexes[index - 1]) ? (emotesIndexes[index - 1] as EmoteInMessage).index : emotesIndexes[index - 1] as number;
      
      if (has('badge', emoteIndex)) {
        const hasTextAfterLastElement = equals(index, dec(emotesIndexes.length)) && !equals(emoteIndex.index, dec(message.split(' ').length));
        
        const hasWordBetweenEmote = gt(emoteIndex.index - previousEmoteIndex, 1);
        
        return [
          <Text>{pipe(slice(isFirstElement ? 0 : hasWordBetweenEmote ? previousEmoteIndex + 1 : emoteIndex.index, emoteIndex.index) as (list: Array<string>) => Array<string>, renderWords)(message.split(' '))}</Text>,
          <EmoteWithTooltip emote={{ name: emoteIndex.word, url: emoteIndex.url }} />,
          hasTextAfterLastElement ? <Text>{pipe(slice(isFirstElement ? 0 : emoteIndex.index + 1, message.length - 1) as (list: Array<string>) => Array<string>, renderWords)(message.split(' '))}</Text> : undefined,
        ]
      }
      const emote = find(({ name }) => equals(name, message.split(' ')[emoteIndex]), emotes) as Emote;

      if (equals(emoteIndex, 0) || equals(emoteIndex - (emotesIndexes as Array<number>)[index - 1], 1)) {
        return [<EmoteWithTooltip emote={{ name: emote.name, url: emote.url }} />]
      }

      const hasTextAfterLastElement = equals(index, dec(emotesIndexes.length)) && !equals(emoteIndex, dec(message.split(' ').length));
        
      const hasWordBetweenEmote = gt(emoteIndex - previousEmoteIndex, 1);

      return [
        <Text>{pipe(slice(isFirstElement ? 0 : hasWordBetweenEmote ? previousEmoteIndex + 1 : emoteIndex, emoteIndex) as (list: Array<string>) => Array<string>, renderWords)(message.split(' '))}</Text>,
        <EmoteWithTooltip emote={{ name: emote.name, url: emote.url }} />,
        hasTextAfterLastElement ? <Text>{pipe(slice(isFirstElement ? 0 : emoteIndex + 1, message.length - 1) as (list: Array<string>) => Array<string>, renderWords)(message.split(' '))}</Text> : undefined,
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
    
    if (equals(key, 'predictions')) {
      return renderBadge({ badge, title: `Prediction: ${badgeInfo?.predictions}`, value });
    }

    if (equals(key, 'subscriber')) {
      return renderBadge({ badge, title: subscriberBadgeMessage, value });
    }

    if (equals(key, 'bits')) {
      return renderBadge({ badge, title: `Bits: ${userBadges?.bits}`, value });
    }

    if (equals(key, 'sub-gifter')) {
      return <BadgeWithTooltip img={badge.versions[max(index, 0)]?.image_url_1x} badge={badge} title={"Sub Gifter"} />;
    }
    
    return <BadgeWithTooltip img={badge.versions[max(index, 0)]?.image_url_1x} badge={badge} />;
  }).filter(Boolean);

  return (
    <div className={classes.messageContainer}>
      {messageBadges}
      <Typography component="span" className={classes.text}><Typography component="span" className={classes.text} sx={{ color: usernameColor, fontWeight: 'bold' }}>{displayName}</Typography>: </Typography>
      <Typography component="span" className={classes.message}>{flatten(parseMessage())}</Typography>
    </div>
  )
}

export default memo(Message);