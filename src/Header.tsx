import { useState, FC, ChangeEvent, KeyboardEvent, memo } from 'react';
import { AppBar, Avatar, Box, darken, IconButton, InputAdornment, Skeleton, TextField, Toolbar, Typography } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search';
import { useAtom, useAtomValue } from "jotai"
import { makeStyles } from 'tss-react/mui';
import { channelAtom, channelInformationAtom, isWaitingForConnectionDerivedAtom } from "./atoms"
import { isEmpty, isNil } from 'ramda';
import GitHubIcon from '@mui/icons-material/GitHub';

const label = 'Search for a channel';

const useStyles = makeStyles()((theme) => ({
  appBar: {
    backgroundColor: darken(theme.palette.primary.main, 0.6),
  }
}))

const Header: FC = () => {
  const { classes } = useStyles();

  const [search, setSearch] = useState('');

  const [channel, setChannel] = useAtom(channelAtom);
  const isWaitingForConnection = useAtomValue(isWaitingForConnectionDerivedAtom);
  const channelInformation = useAtomValue(channelInformationAtom);

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

  const goToGithub = (): void => {
    window.open('https://github.com/Thebarda/Thebardabot', '_blank', 'noreferrer noopener')
  }

  return (
    <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Box sx={{ display: 'flex', flexDirection: 'row', columnGap: 4, flexGrow: '1', alignItems: 'center' }}>
            <TextField
              variant="filled"
              value={search}
              onChange={changeText}
              onKeyDown={confirmChannelOnEnter}
              disabled={isWaitingForConnection}
              label={label}
              InputProps={{ endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={confirmChannel} disabled={isEmpty(search) || isWaitingForConnection}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
                )
              }} />
              {
                channel && isNil(channelInformation) && (
                  <Box sx={{ display: 'flex', flexDirection: 'row', columnGap: 2, alignItems: 'center' }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width={80} />
                  </Box>
                )
              }
              {channelInformation && (<Box sx={{ display: 'flex', flexDirection: 'row', columnGap: 2, alignItems: 'center' }}>
                <Avatar src={channelInformation?.profileImage} />
                <Typography>{channelInformation.displayName}</Typography>
              </Box>)}
            </Box>
          <IconButton onClick={goToGithub}><GitHubIcon /></IconButton>
        </Toolbar>
      </AppBar>
  )
}

export default memo(Header);