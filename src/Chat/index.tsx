import { useState, FC, useEffect, SetStateAction, Dispatch } from "react";
import { Paper, Box, Avatar, Typography, Skeleton, alpha } from "@mui/material";
import Messages from "./Messages";
import { useChat } from "./useChat";
import { isNil } from "ramda";
import { Provider } from "jotai";
import StreamInput from "./StreamInput";
import Input from "../Input";
import { ChannelInformation } from "../models";

const Chat: FC<{
  channel: string;
  setChannelInformation: Dispatch<SetStateAction<ChannelInformation | null>>;
  setChannelColor: Dispatch<SetStateAction<string | null>>;
}> = ({ channel, setChannelInformation, setChannelColor }) => {
  const {
    emotes,
    badges,
    chatMessages,
    channelInformation,
    clientRef,
    channelColor,
  } = useChat(channel);

  useEffect(() => {
    setChannelInformation(channelInformation);
    setChannelColor(channelColor);
  }, [channelInformation, channelColor]);

  const sendMessage = (message: string) => {
    if (isNil(clientRef.current) || isNil(channelInformation)) {
      return;
    }

    clientRef.current.say(channelInformation?.login, message);
  };

  return (
    <section
      style={{
        background: `linear-gradient(${alpha(channelColor, 0.3)}, #000)`,
      }}
    >
      <Messages
        channel={channel}
        emotes={emotes}
        badges={badges}
        chatMessages={chatMessages}
      />
      <Input sendMessage={sendMessage} channel={channel} />
    </section>
  );
};

const Container = () => {
  const [channel, setChannel] = useState<string | null>(null);
  const [channelInformation, setChannelInformation] =
    useState<ChannelInformation | null>(null);
  const [channelColor, setChannelColor] = useState<string | null>(null);

  const changeChannel = (newChannel: string) => {
    setChannel(newChannel);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderLeft: "none",
        borderRight: "none",
      }}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          columnGap: 4,
          backgroundColor: channelColor
            ? alpha(channelColor, 0.3)
            : "paper.background",
        }}
        square
      >
        <StreamInput setChannel={changeChannel} />
        {isNil(channelInformation) && channel && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              columnGap: 2,
              alignItems: "center",
            }}
          >
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={80} />
          </Box>
        )}
        {channelInformation && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              columnGap: 2,
            }}
          >
            <Avatar
              alt={channelInformation.displayName}
              src={channelInformation.profileImage}
            />
            <Typography>{channelInformation.displayName}</Typography>
          </Box>
        )}
      </Paper>
      {channel && (
        <Provider scope={channel}>
          <Chat
            channel={channel}
            setChannelInformation={setChannelInformation}
            setChannelColor={setChannelColor}
          />
        </Provider>
      )}
    </Paper>
  );
};

export default Container;
