import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import EmotePlugin from "./Plugins/EmotePlugins";
import { EmoteNode } from "./Nodes/EmoteNode";
import ParagraphPlugin from "./Plugins/ParagraphPlugin";
import ContentEditable from "./ContentEditable";
import EmoteAutocompletePlugin from "./Plugins/EmoteAutocompletePlugin";

const onError = (error: Error) => {
  console.error(error);
};

interface InputProps {
  sendMessage: (message: string) => void;
  channel: string;
}

const Input = ({ sendMessage, channel }: InputProps): JSX.Element => {
  const initialConfig = {
    namespace: "MyEditor",
    onError,
    nodes: [EmoteNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <PlainTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <EmotePlugin channel={channel} />
      <ParagraphPlugin sendMessage={sendMessage} channel={channel} />
      <EmoteAutocompletePlugin channel={channel} />
    </LexicalComposer>
  );
};

export default Input;
