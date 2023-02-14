import { Fragment, h } from "preact";
import {
  Text,
  Textbox,
  TextboxColor,
  Button,
  useInitialFocus,
  VerticalSpace,
  IconPlus32,
  IconEllipsis32,
  IconButton,
  Modal,
  TextboxAutocomplete,
} from "@create-figma-plugin/ui";
import { useEffect, useState } from "preact/hooks";
import emojis from "emojilib";
import fuzzysort from "fuzzysort";

interface SettingsProps {
  apiKey: boolean;
  statuses: {
    statusOptions: [
      { label: string; value: string; color: string; id: string }
    ];
    statusKeyToIcon: { [key: string]: string };
  };
  onSaveStatus: (status: {
    id: string;
    label: string;
    value: string;
    emoji: string;
    color: string;
  }) => void;
  onDeleteStatus: (id: string) => void;
}

function Settings({
  apiKey,
  statuses,
  onSaveStatus,
  onDeleteStatus,
}: SettingsProps) {
  const [text, setText] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [emoji, setEmoji] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [statusToEdit, setStatusToEdit] = useState<any>();
  const [options, setOptions] = useState<{ value: string }[]>(
    Object.keys(emojis).map((key) => ({ value: key }))
  );

  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const initialFocus = useInitialFocus();

  const handleInput = (e: any) => {
    setText(e.target.value.trim());
  };

  const handleSubmit = () => {
    console.log("submit api key");
  };

  const handleShowStatusModal = () => {
    setShowStatusModal(!showStatusModal);
  };

  const handleShowApiKeyModal = () => {
    setShowApiKeyModal(!showApiKeyModal);
  };

  const handleColorChange = (e: any) => {
    setColor(e.target.value);
  };

  const handleEmojiChange = (e: any) => {
    console.log(e.target.value);
    setEmoji(e.target.value);
  };

  const handleNameChange = (e: any) => {
    setName(e.target.value);
  };

  useEffect(() => {
    if (apiKey) {
    }
  }, [apiKey]);

  useEffect(() => {
    const filterEmojis = async () => {
      const filteredOptions = Object.keys(emojis)
        .filter((key) => {
          if (!emoji) return true;

          const targets = emojis[key];
          const results = fuzzysort.go(emoji, targets, {
            threshold: -20, // Don't return matches worse than this (higher is faster)
            limit: 1, // Don't return more results than this (lower is faster)
            all: false, // If true, returns all results for an empty search
          });

          return results.length;
        })
        .map((key) => ({
          value: key,
        }));

      setOptions(filteredOptions);
    };

    if (emoji) {
      filterEmojis();
    }
  }, [emoji]);

  console.log("statusToEdit", statusToEdit);

  return (
    <div class="container">
      <div class="form">
        <div class="flex align-items-center justify-content-between">
          <Text>Custom statuses</Text>
          <IconButton
            onClick={apiKey ? handleShowStatusModal : handleShowApiKeyModal}
          >
            <IconPlus32 />
          </IconButton>
        </div>
        <VerticalSpace space="small" />
        {statuses?.statusOptions.map((statusOption) => (
          <div class="custom-status">
            <div class="flex align-items-center">
              <div
                class="status-colour"
                style={{ backgroundColor: `#${statusOption.color}` }}
              />
              <div class="status-name">
                <Text>{statusOption.label}</Text>
              </div>
              <div class="status-emoji">
                {statuses.statusKeyToIcon[statusOption.value]}
              </div>
            </div>
            <div class="status-options">
              <a
                class="status-options-item"
                onClick={() => {
                  handleShowStatusModal();
                  setStatusToEdit(statusOption);
                  setName(statusOption.label);
                  setEmoji(statuses.statusKeyToIcon[statusOption.value]);
                  setColor(statusOption.color);
                }}
              >
                Edit
              </a>
              <a
                class="status-options-item"
                onClick={() => onDeleteStatus(statusOption.id)}
              >
                Delete
              </a>
            </div>
          </div>
        ))}
        {!statuses && (
          <div class="empty-state">
            <h1>😵‍💫</h1>
            <p>No custom statuses yet</p>
          </div>
        )}
      </div>

      <Modal
        open={showStatusModal}
        title="Add new status"
        onOverlayClick={handleShowStatusModal}
      >
        <div style={{ height: "auto", padding: "12px", width: "auto" }}>
          <TextboxColor
            hexColor={color}
            hexColorPlaceholder="Color"
            onHexColorInput={handleColorChange}
            onOpacityInput={() => {}}
            opacity="100"
            variant="border"
          />
          <VerticalSpace space="small" />
          <TextboxAutocomplete
            options={options}
            value={emoji}
            variant="border"
            onChange={handleEmojiChange}
          />
          <VerticalSpace space="small" />
          <Textbox
            placeholder="Name"
            value={name}
            variant="border"
            onChange={handleNameChange}
          />
          <VerticalSpace space="small" />
          <Button
            onClick={() => {
              onSaveStatus({
                id: statusToEdit?.id,
                label: name[0].toUpperCase() + name.substring(1),
                value: name.split(" ").join("-").toLowerCase(),
                emoji: emoji,
                color: color,
              });
              if (statusToEdit) {
                setStatusToEdit(null);
              }
              setShowStatusModal(false);
            }}
          >
            Save
          </Button>
        </div>
      </Modal>

      {!apiKey && (
        <Modal
          open={showApiKeyModal}
          title="Enter api key to unlock premium features"
          onCloseButtonClick={handleShowApiKeyModal}
        >
          <div style={{ height: "auto", padding: "12px", width: "auto" }}>
            <Textbox
              {...initialFocus}
              onInput={handleInput}
              placeholder="Enter api key"
              value={text}
              variant="border"
            />
            <VerticalSpace space="small" />
            <Button fullWidth onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Settings;
