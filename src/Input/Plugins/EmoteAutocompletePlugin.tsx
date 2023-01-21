import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  QueryMatch,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { List, ListItem, ListItemButton, Paper, Popper } from "@mui/material";
import { useAtomValue } from "jotai";
import { TextNode } from "lexical";
import { last, split } from "ramda";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { emotesAtom } from "../../atoms";
import { $createEmoteNode } from "../Nodes/EmoteNode";

class EmoteTypeAheadOption extends TypeaheadOption {
  name: string;
  url: string;

  constructor(name: string, url: string) {
    super(name);
    this.name = name;
    this.url = url;
  }
}

const EmoteTypeaheadMenuItem = ({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: EmoteTypeAheadOption;
}) => {
  let className = "item";
  if (isSelected) {
    className += " selected";
  }
  return (
    <ListItemButton
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <img style={{ height: "22px" }} src={option.url} alt={option.name} />
    </ListItemButton>
  );
};

interface Props {
  channel: string;
}

const EmoteAutocompletePlugin = ({ channel }: Props) => {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const emotes = useAtomValue(emotesAtom, channel);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const onSelectOption = useCallback(
    (
      selectedOption: EmoteTypeAheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const emoteNode = $createEmoteNode(
          selectedOption.name,
          selectedOption.url
        );

        if (nodeToReplace) {
          let targetNode;
          const textContent = nodeToReplace.getTextContent();

          const lastWord = last(split(" ", textContent)) || "";

          const endIndexLastWord = textContent.length;
          const startIndexLastWord = textContent.length - lastWord?.length;

          nodeToReplace.setTextContent(`${textContent} `);

          const [, emptyNode] = nodeToReplace.splitText(
            endIndexLastWord,
            endIndexLastWord + 2
          );

          if (emptyNode) {
            emptyNode.select(1, 1);
          }

          if (startIndexLastWord === 0) {
            [targetNode] = nodeToReplace.splitText(endIndexLastWord);
          } else {
            [, targetNode] = nodeToReplace.splitText(
              startIndexLastWord,
              endIndexLastWord
            );
          }

          targetNode.replace(emoteNode);
        }
        emoteNode.select();
        closeMenu();
        setTimeout(() => {
          editor.blur();
          editor.focus();
        }, 10);
      });
    },
    [editor]
  );

  const checkForEmotesMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      return slashMatch;
    },
    [emotes, editor]
  );

  const filteredEmotes = useMemo(
    () =>
      emotes.filter(({ name }) =>
        name.toLowerCase().startsWith(queryString?.toLowerCase() || "")
      ),
    [emotes, queryString]
  );

  const options = useMemo(
    () =>
      filteredEmotes
        .map(({ name, url }) => new EmoteTypeAheadOption(name, url))
        .slice(0, 5),
    [filteredEmotes]
  );

  return (
    <LexicalTypeaheadMenuPlugin<EmoteTypeAheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForEmotesMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && filteredEmotes.length
          ? createPortal(
              <Popper
                open
                anchorEl={anchorElementRef.current}
                placement="top-start"
                style={{ zIndex: 1000 }}
              >
                <Paper>
                  <List>
                    {options.map((option, i: number) => (
                      <ListItem
                        dense
                        disableGutters
                        tabIndex={-1}
                        role="option"
                      >
                        <EmoteTypeaheadMenuItem
                          index={i}
                          isSelected={selectedIndex === i}
                          onClick={() => {
                            setHighlightedIndex(i);
                            selectOptionAndCleanUp(option);
                          }}
                          onMouseEnter={() => {
                            setHighlightedIndex(i);
                          }}
                          key={option.key}
                          option={option}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Popper>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
};

export default EmoteAutocompletePlugin;
