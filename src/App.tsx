import { Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { isNil } from "ramda";
import { tokenAtom } from "./atoms";
import Chat from "./Chat";
import useTwitchAuthentication from "./useTwitchAuthentication";


const App = () => {
  useTwitchAuthentication();
  
  const token = useAtomValue(tokenAtom);

  if (isNil(token)) {
    return <Typography variant="h2">Redirecting to Twitch for authentication...</Typography>
  }
  
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Chat />
    </div>
  );
}

export default App;
