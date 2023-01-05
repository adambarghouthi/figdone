import { Fragment, h } from "preact";
import {
  Text,
  Textbox,
  Button,
  useInitialFocus,
  VerticalSpace,
  IconPlus32,
  IconEllipsis32,
  IconButton,
} from "@create-figma-plugin/ui";
import { useEffect, useState } from "preact/hooks";
import { statusKeyToIcon } from "../../utils/constants";

interface SettingsProps {
  apiKey: boolean;
  statuses: {
    statusOptions: [{ label: string; value: string; color: string }];
    statusKeyToIcon: { [key: string]: string };
  };
}

function Settings({ apiKey, statuses }: SettingsProps) {
  const [text, setText] = useState<string>("");
  const initialFocus = useInitialFocus();

  const handleInput = (e: any) => {
    setText(e.target.value.trim());
  };

  const handleSubmit = () => {
    console.log("submit api key");
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
            <IconButton onClick={() => {}}>
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
    </div>
  );
}

export default Settings;
