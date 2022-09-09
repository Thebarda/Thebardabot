import { useState, FC, ChangeEvent, KeyboardEvent, memo } from 'react';
import { AppBar, IconButton, InputAdornment, TextField, Toolbar } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search';
import { useAtomValue, useSetAtom } from "jotai"
import { channelAtom, isWaitingForConnectionDerivedAtom } from "./atoms"
import { isEmpty } from 'ramda';
import GitHubIcon from '@mui/icons-material/GitHub';

const label = 'Search for a channel';

const Header: FC = () => {
  const [search, setSearch] = useState('');
  const setChannel = useSetAtom(channelAtom);
  const isWaitingForConnection = useAtomValue(isWaitingForConnectionDerivedAtom);

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
    <AppBar position="fixed">
        <Toolbar>
          <div style={{ flexGrow: 1 }}>
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
            </div>
          <IconButton onClick={goToGithub}><GitHubIcon /></IconButton>
        </Toolbar>
      </AppBar>
  )
}

export default memo(Header);