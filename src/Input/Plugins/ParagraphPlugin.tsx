import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useAtomValue } from "jotai";
import { $getRoot, LineBreakNode } from "lexical";
import { join, pluck, replace } from "ramda";
import { useEffect } from "react";
import { channelInformationAtom } from "../../atoms";

interface Props {
  sendMessage: (message: string) => void;
}

const ParagraphPlugin = ({ sendMessage }: Props) => {
  const [editor] = useLexicalComposerContext();
  const channelInformation = useAtomValue(channelInformationAtom);

  useEffect(() => {
    const removeTransform = editor.registerNodeTransform(
      LineBreakNode,
      (node) => {
        node.remove();

        const line = editor.getEditorState().toJSON().root
          .children[0] as unknown as { children: Array<{ text: string }> };

        const text = join("", pluck("text", line.children));

        const trimmedText = replace(/\s\s+/g, " ", text);

        sendMessage(trimmedText);

        editor.update(() => {
          $getRoot().clear();
        });
      }
    );

    return removeTransform;
  }, [editor, channelInformation]);

  return null;
};

export default ParagraphPlugin;
