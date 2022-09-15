import { Autocomplete, ListItemButton, TextField, Box, Chip, Typography, Tooltip, Paper, tooltipClasses, TooltipProps, styled } from '@mui/material';
import { useAtomValue } from 'jotai';
import { equals, isNil, replace, type } from 'ramda';
import { FC, KeyboardEvent, SyntheticEvent, useState } from 'react';
import { tokenAtom, userAtom } from '../atoms';
import credentials from '../credentials.json';

const label = 'Search for a streamer';

interface Stream {
  user_name: string;
  id: string;
  user_login: string;
  game_name: string;
  thumbnail_url: string;
  title: string;
}

interface Props {
  setChannel: (newChannel: string) => void;
}

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'transparent',
  },
}));

const StreamInput: FC<Props> = ({ setChannel }) => {
  const [search, setSearch] = useState<string>('');
  const [options, setOptions] = useState([]);

  const token = useAtomValue(tokenAtom);
  const user = useAtomValue(userAtom);
  const { clientId } = credentials;

  const getFollowedStreams = () => {
    return fetch(`https://api.twitch.tv/helix/streams/followed?user_id=${user?.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Client-Id': clientId,
      }
    })
  }

  const changeText = (_: SyntheticEvent, value: string): void => {
    setSearch(value)
  }

  const openOptions = () => {
    getFollowedStreams().then(async (response) => {
      if (!response.ok) {
        return;
      }

      const result = await response.json();

      setOptions(result.data);
    })
  }

  const renderOption = (props: object, option: Stream) => {
    return (
      <ListItemButton {...props} key={option.user_name}>
        <LightTooltip
          title={
            <Paper sx={{ width: 'fit-content', padding: 2 }}>
              <img src={replace('{width}x{height}', '300x170', option.thumbnail_url)} alt={option.title} />
              <Typography variant="caption">{option.title}</Typography>
            </Paper>
          }
          placement="right">
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', columnGap: 2 }}>
            <Chip color="error" label="Live" size="small" />
            <Box>
              <Typography>{option.user_name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{option.game_name}</Typography>
            </Box>
          </Box>
        </LightTooltip>
      </ListItemButton>
    )
  }

  const changeChannel = (_: SyntheticEvent, value: string | Stream | null) => {
    if (isNil(value)) {
      return;
    }
    
    setChannel(equals(type(value), 'String') ? value as string : (value as Stream).user_name)
  }

  const getOptionLabel = (option: Stream | string) => equals(type(option), 'String') ? option as string : (option as Stream).user_name

  const confirmChannel = () => {
    console.log(search)
    setChannel(search);
  }

  const confirmChannelOnEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }

    confirmChannel()
  }

  return (
    <Autocomplete
      options={options}
      renderInput={(params) => <TextField {...params} label={label} variant="filled" />}
      sx={{ width: 280, marginLeft: 2 }}
      freeSolo
      onOpen={openOptions}
      inputValue={search}
      onInputChange={changeText}
      renderOption={renderOption}
      onChange={changeChannel}
      getOptionLabel={getOptionLabel}
      disableClearable
      onKeyDown={confirmChannelOnEnter}
    />
  )
}

export default StreamInput;