import { useState, ChangeEvent, KeyboardEvent, FC, Dispatch, SetStateAction, useEffect } from 'react';
import { TextField, InputAdornment, IconButton, Paper, Box, Avatar, Typography, Skeleton } from "@mui/material";
import Messages from "./Messages";
import { useChat } from "./useChat"
import { isEmpty, isNil } from 'ramda';
import SearchIcon from '@mui/icons-material/Search';
import { Provider } from 'jotai';
import { ChannelInformation } from '../models';

const Chat: FC<{ channel: string; setChannelInformation: Dispatch<SetStateAction<ChannelInformation | null>> }> = ({ channel, setChannelInformation }) => {
  const { emotes, badges, chatMessages, channelInformation } = useChat(channel);

  useEffect(() => {
    setChannelInformation(channelInformation);
  }, [channelInformation]);

  return (
    <Messages channel={channel} emotes={emotes} badges={badges} chatMessages={chatMessages} />
  )
}

const label = 'Search for a channel';

const Container = () => {
  const [search, setSearch] = useState<string>('');
  const [channel, setChannel] = useState<string | null>(null);
  const [channelInformation, setChannelInformation] = useState<ChannelInformation | null>(null);

  const changeText = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value)
  }

  const confirmChannel = () => {
    setChannel(search);
    setSearch('');
  }

  const confirmChannelOnEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }

    confirmChannel()
  }

  return (
    <Paper variant="outlined" sx={{ backgroundColor: 'paper.background', borderLeft: 'none' }}>
      <Paper sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 4 }}>
        <TextField
          variant="filled"
          value={search}
          onChange={changeText}
          onKeyDown={confirmChannelOnEnter}
          label={label}
          InputProps={{ endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={confirmChannel} disabled={isEmpty(search)}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
            )
          }} />
          {
            isNil(channelInformation) && channel && (
              <Box sx={{ display: 'flex', flexDirection: 'row', columnGap: 2, alignItems: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={80} />
              </Box>
            )
          }
          {channelInformation && (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 2 }}>
              <Avatar alt={channelInformation.displayName} src={channelInformation.profileImage} />
              <Typography>{channelInformation.displayName}</Typography>
            </Box>
          )}
        </Paper>
        {channel && (
          <Provider scope={channel}>
            <Chat channel={channel} setChannelInformation={setChannelInformation} />
          </Provider>
        )}
    </Paper>
  )
};

export default Container;