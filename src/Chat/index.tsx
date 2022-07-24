import Messages from "./Messages";
import { useChat } from "./useChat"

const Chat = () => {
  useChat();

  return <Messages />
}

export default Chat;