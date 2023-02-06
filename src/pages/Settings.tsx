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
} from "@create-figma-plugin/ui";
import { useEffect, useState } from "preact/hooks";
import { statusKeyToIcon } from "../../utils/constants";

interface SettingsProps {
  apiKey: boolean;
  statuses: {
    statusOptions: [{ label: string; value: string; color: string }];
    statusKeyToIcon: { [key: string]: string };
  };
  onSaveStatus: (status: {
    label: string;
    value: string;
    emoji: string;
    color: string;
  }) => void;
}

function Settings({ apiKey, statuses, onSaveStatus }: SettingsProps) {
  const [text, setText] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [emoji, setEmoji] = useState<string>("");
  const [name, setName] = useState<string>("");

  const [showModal, setShowModal] = useState<boolean>(false);
  const initialFocus = useInitialFocus();

  const handleInput = (e: any) => {
    setText(e.target.value.trim());
  };

  const handleSubmit = () => {
    console.log("submit api key");
  };

  const handleShowModal = () => {
    setShowModal(!showModal);
  };

  const handleColorChange = (e: any) => {
    setColor(e.target.value);
  };

  const handleEmojiChange = (e: any) => {
    setEmoji(e.target.value);
  };

  const handleNameChange = (e: any) => {
    setName(e.target.value);
  };

  useEffect(() => {
    if (apiKey) {
    }
  }, [apiKey]);

  return (
    <div class="container">
      {!apiKey && (
        <div class="form">
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
      )}

      {apiKey && (
        <div class="form">
          <div class="flex align-items-center justify-content-between">
            <Text>Custom statuses</Text>
            <IconButton onClick={handleShowModal}>
              <IconPlus32 />
            </IconButton>
          </div>
          <VerticalSpace space="small" />
          {statuses?.statusOptions.map((statusOption) => (
            <div class="custom-status">
              <div class="flex align-items-center">
                <div
                  class="status-colour"
                  style={{ backgroundColor: statusOption.color }}
                />
                <div class="status-name">
                  <Text>{statusOption.label}</Text>
                </div>
                <div class="status-emoji">
                  {statuses.statusKeyToIcon[statusOption.value]}
                </div>
              </div>
              <div class="status-options">
                <a class="status-options-item">Edit</a>
                <a class="status-options-item">Delete</a>
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
      )}

      <Modal
        open={showModal}
        title="Add new status"
        onCloseButtonClick={handleShowModal}
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
          <Textbox
            placeholder="Emoji"
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
                label: name[0].toUpperCase() + name.substring(1),
                value: name.split(" ").join("-").toLowerCase(),
                emoji: emoji,
                color: color,
              });
              setShowModal(false);
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default Settings;
