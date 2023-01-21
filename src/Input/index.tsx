import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import EmotePlugin from "./Plugins/EmotePlugins";
import { EmoteNode } from "./Nodes/EmoteNode";
import ParagraphPlugin from "./Plugins/ParagraphPlugin";
import ContentEditable from "./ContentEditable";

const onError = (error: Error) => {
  console.error(error);
};

interface InputProps {
  sendMessage: (message: string) => void;
}

const Input = ({ sendMessage }: InputProps): JSX.Element => {
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
      <EmotePlugin />
      <ParagraphPlugin sendMessage={sendMessage} />
    </LexicalComposer>
  );
};

export default Input;
