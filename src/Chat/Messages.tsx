import { Button, Popper, Slide, Typography } from "@mui/material";
import { isEmpty } from "ramda";
import {
  memo,
  useEffect,
  useRef,
  FC,
  useState,
  UIEventHandler,
  UIEvent,
} from "react";
import { makeStyles } from "tss-react/mui";
import Message from "./Message";
import { Badge, ChatMessage, Emote } from "../models";

const useStyles = makeStyles()((theme) => ({
  messagesContainer: {
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    padding: theme.spacing(2, 0, 1, 4),
    display: "flex",
    flexDirection: "column",
    rowGap: theme.spacing(0.5),
    "&::-webkit-scrollbar": {
      width: theme.spacing(1),
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "darkgrey",
      borderRadius: theme.shape.borderRadius,
    },
  },
  resumeChat: {
    marginTop: "-80px",
  },
}));

interface Props {
  channel: string;
  emotes: Array<Emote>;
  badges: Array<Badge>;
  chatMessages: Array<ChatMessage>;
}

const Messages: FC<Props> = ({ channel, chatMessages, emotes, badges }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const { classes } = useStyles();

  const parentRef = useRef<HTMLDivElement | null>(null);

  const resize = () => {
    if (isScrolling) {
      return;
    }

    parentRef.current?.scrollTo({
      top: parentRef.current?.scrollHeight,
      behavior: "smooth",
    });
  };

  const scroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollPosition = Math.abs(
      event.currentTarget.scrollHeight -
        event.currentTarget.scrollTop -
        event.currentTarget.clientHeight
    );

    if (scrollPosition > 50) {
      setIsScrolling(true);
      return;
    }

    if (!isScrolling) {
      return;
    }

    parentRef.current?.scrollTo({
      top: parentRef.current?.scrollHeight,
      behavior: "smooth",
    });
    setIsScrolling(false);
  };

  useEffect(() => {
    resize();
  }, [chatMessages]);

  useEffect(() => {
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  const resumeChat = () => {
    parentRef.current?.scrollTo({
      top: parentRef.current?.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div style={{ height: "calc(100vh - 159px)", overflowY: "hidden" }}>
      <div
        className={classes.messagesContainer}
        ref={parentRef}
        onScroll={scroll as UIEventHandler<HTMLDivElement>}
      >
        {isEmpty(chatMessages) ? (
          <Typography component="em" variant="caption">
            Connecting to {channel}...
          </Typography>
        ) : (
          chatMessages.map((message) => (
            <Message
              chatMessage={message}
              key={message?.id}
              emotes={emotes}
              badges={badges}
            />
          ))
        )}
      </div>
      <Popper
        open={isScrolling}
        transition
        anchorEl={parentRef.current}
        placement="bottom-end"
      >
        {({ TransitionProps }) => (
          <Slide {...TransitionProps} direction="up" timeout={100}>
            <Button
              variant="contained"
              color="primary"
              onClick={resumeChat}
              className={classes.resumeChat}
            >
              Resume chat
            </Button>
          </Slide>
        )}
      </Popper>
    </div>
  );
};

export default memo(Messages);
