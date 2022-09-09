import { memo } from 'react';
import { Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { isNil } from "ramda";
import { channelAtom, tokenAtom } from "./atoms";
import Chat from "./Chat";
import Header from "./Header";
import useTwitchAuthentication from "./useTwitchAuthentication";

const App = () => {
  useTwitchAuthentication();
  
  const token = useAtomValue(tokenAtom);
  const channel = useAtomValue(channelAtom);

  if (isNil(token)) {
    return <Typography variant="h2">Redirecting to Twitch for authentication...</Typography>
  }
  
  return (
    <div style={{ width:'100%', height: 'calc(100vh - 70px)' }}>
      <Header />
      {channel ? <Chat /> : <Typography variant="h4" sx={{ ml: 3, mt: 2 }}>Please select a channel</Typography>}
    </div>
  );
}

export default memo(App);
