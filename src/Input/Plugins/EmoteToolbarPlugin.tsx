import { Button, Paper, Popper } from "@mui/material";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useAtomValue } from "jotai";
import { emotesAtom } from "../../atoms";
import { useEffect, useRef, useState } from "react";
import { Emote } from "../../models";
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  COMMAND_PRIORITY_NORMAL,
  createCommand,
  LexicalNode,
} from "lexical";
import { $createEmoteNode } from "../Nodes/EmoteNode";
import { $moveSelectionPointToEnd } from "lexical/LexicalSelection";

interface Props {
  channel: string;
}

const ADD_EMOTE_COMMAND = createCommand("add_emote");

const EmoteOption = ({ url, name }: Emote): JSX.Element => {
  const [editor] = useLexicalComposerContext();

  const insertEmote = () => {
    editor.dispatchCommand(ADD_EMOTE_COMMAND, { url, name });
  };

  return (
    <Button size="small" sx={{ width: "50px" }} onClick={insertEmote}>
      <img
        src={url.replace("static/light", "default/dark")}
        key={name}
        alt={name}
        style={{ width: "22px", objectFit: "contain" }}
      />
    </Button>
  );
};

const EmoteToolbarPlugin = ({ channel }: Props): JSX.Element => {
  const [isPopperOpened, setIsPopperOpened] = useState(false);
  const anchorEl = useRef(null);

  const emotes = useAtomValue(emotesAtom, channel);
  const [editor] = useLexicalComposerContext();

  const togglePopper = () => setIsPopperOpened((prev) => !prev);

  useEffect(() => {
    editor.registerCommand(
      ADD_EMOTE_COMMAND,
      ({ url, name }: Emote) => {
        const emoteNode = $createEmoteNode(name, url);

        editor.update(() => {
          const lastNode = $getSelection()?.getNodes()[0] as LexicalNode;

          if (lastNode.getType() === "text") {
            lastNode
              .insertAfter(emoteNode)
              .insertAfter($createTextNode(" "))
              .selectNext();

            return;
          }

          const paragraphNode = $createParagraphNode();
          paragraphNode.append(emoteNode).append($createTextNode(" "));
          lastNode.replace(paragraphNode);
          emoteNode.selectNext();
        });

        return false;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor]);

  return (
    <Button
      size="small"
      variant="contained"
      ref={anchorEl}
      onClick={togglePopper}
    >
      <EmojiEmotionsIcon />
      <Popper
        open={isPopperOpened}
        anchorEl={anchorEl.current}
        placement="top-end"
      >
        <Paper
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, 50px)",
            columnGap: 1,
            rowGap: 1,
            width: "400px",
            height: "200px",
            overflowY: "auto",
            padding: 2,
            marginBottom: 2,
          }}
        >
          {emotes.map((emote) => (
            <EmoteOption {...emote} />
          ))}
        </Paper>
      </Popper>
    </Button>
  );
};

export default EmoteToolbarPlugin;
