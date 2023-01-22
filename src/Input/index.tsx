import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import EmotePlugin from "./Plugins/EmotePlugins";
import { EmoteNode } from "./Nodes/EmoteNode";
import ParagraphPlugin from "./Plugins/ParagraphPlugin";
import ContentEditable from "./ContentEditable";
import EmoteAutocompletePlugin from "./Plugins/EmoteAutocompletePlugin";
import EmoteToolbarPlugin from "./Plugins/EmoteToolbarPlugin";
import { Box } from "@mui/material";
import { useState } from "react";
import FloatingActionsToolbarPlugin from "./Plugins/FloatingActionsToolbarPlugin";

const onError = (error: Error) => {
  console.error(error);
};

interface InputProps {
  sendMessage: (message: string) => void;
  channel: string;
}

const Input = ({ sendMessage, channel }: InputProps): JSX.Element => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<
    HTMLElement | undefined
  >();

  const onRef = (_floatingAnchorElem: HTMLElement) => {
    if (_floatingAnchorElem !== undefined) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const initialConfig = {
    namespace: "MyEditor",
    onError,
    nodes: [EmoteNode],
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr min-content",
        columnGap: 1,
      }}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <PlainTextPlugin
          contentEditable={<ContentEditable onRef={onRef} />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <EmotePlugin channel={channel} />
        <ParagraphPlugin sendMessage={sendMessage} channel={channel} />
        <EmoteAutocompletePlugin channel={channel} />
        <EmoteToolbarPlugin channel={channel} />
        <FloatingActionsToolbarPlugin anchorElem={floatingAnchorElem} />
      </LexicalComposer>
    </Box>
  );
};

export default Input;
