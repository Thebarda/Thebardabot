import { memo } from 'react';
import { Typography, Box } from "@mui/material";
import { useAtomValue } from "jotai";
import { isNil } from "ramda";
import { tabsAtom, tokenAtom } from "./atoms";
import Chat from "./Chat";
import Header from "./Header";
import useTwitchAuthentication from "./useTwitchAuthentication";

const App = () => {
  useTwitchAuthentication();
  
  const tabs = useAtomValue(tabsAtom);
  const token = useAtomValue(tokenAtom);

  
  if (isNil(token)) {
    return <Typography variant="h2">Redirecting to Twitch for authentication...</Typography>
  }
  
  return (
    <div style={{ width:'100%', overflowY: 'hidden' }}>
      <Header />
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${tabs}, 1fr)`, mt: 8 }}>
      {
        Array(tabs).fill(0).map((_, index) => (
          <Chat key={`tab_${index.toString()}`} />
        ))
      }
      </Box>
    </div>
  );
}

export default memo(App);
