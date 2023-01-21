import { useState, FC, Dispatch, SetStateAction, useEffect } from "react";
import { Paper, Box, Avatar, Typography, Skeleton } from "@mui/material";
import Messages from "./Messages";
import { useChat } from "./useChat";
import { isNil } from "ramda";
import { Provider } from "jotai";
import { ChannelInformation } from "../models";
import StreamInput from "./StreamInput";
import Input from "../Input";

const Chat: FC<{
  channel: string;
  setChannelInformation: Dispatch<SetStateAction<ChannelInformation | null>>;
}> = ({ channel, setChannelInformation }) => {
  const { emotes, badges, chatMessages, channelInformation, clientRef } =
    useChat(channel);

  useEffect(() => {
    setChannelInformation(channelInformation);
  }, [channelInformation]);

  const sendMessage = (message: string) => {
    if (isNil(clientRef.current) || isNil(channelInformation)) {
      return;
    }

    clientRef.current.say(channelInformation?.login, message);
  };

  return (
    <section>
      <Messages
        channel={channel}
        emotes={emotes}
        badges={badges}
        chatMessages={chatMessages}
      />
      <Input sendMessage={sendMessage} />
    </section>
  );
};

const Container = () => {
  const [channel, setChannel] = useState<string | null>(null);
  const [channelInformation, setChannelInformation] =
    useState<ChannelInformation | null>(null);

  const changeChannel = (newChannel: string) => {
    setChannel(newChannel);
  };

  return (
    <Paper
      variant="outlined"
      sx={{ backgroundColor: "paper.background", borderLeft: "none" }}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          columnGap: 4,
        }}
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
          />
        </Provider>
      )}
    </Paper>
  );
};

export default Container;
