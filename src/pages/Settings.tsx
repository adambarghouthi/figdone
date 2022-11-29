import { Fragment, h } from "preact";
import {
  Text,
  Textbox,
  Button,
  useInitialFocus,
  VerticalSpace,
  IconPlus32,
  IconEllipsis32,
  IconButton
} from '@create-figma-plugin/ui'
import { useState } from "preact/hooks";

interface SettingsProps {
  apiKey: boolean,
}

function Settings({
  apiKey
}:SettingsProps) {
  const [text, setText] = useState<string>('');
  const initialFocus = useInitialFocus();

  const handleInput = (e:any) => {
    setText(e.target.value.trim());
  };

  const handleSubmit = () => {
    console.log('submit api key');
  };

  return (
    <div class="container">
      {
        !apiKey &&
          <div class="form">
            <Textbox
              {...initialFocus}
              onInput={handleInput}
              placeholder="Enter api key"
              value={text}
              variant="border"
            />
            <VerticalSpace space="small" />
            <Button
              fullWidth
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
      }

      {
        apiKey &&
          <div class="form">
            <div class="flex align-items-center justify-content-between">
              <Text>
                Custom statuses
              </Text>
              <IconButton onClick={() => {}}>
                <IconPlus32 />
              </IconButton>
            </div>
            <VerticalSpace space="small" />
            <div class="custom-status">
              <div class="flex align-items-center">
                <div class="status-colour" />
                <div class="status-name">
                  <Text>Finished</Text>
                </div>
                <div class="status-emoji">
                  ✅
                </div>
              </div>
              <IconEllipsis32 />
            </div>
            <div class="custom-status">
              <div class="flex align-items-center">
                <div class="status-colour" />
                <div class="status-name">
                  <Text>Finished</Text>
                </div>
                <div class="status-emoji">
                  ✅
                </div>
              </div>
              <IconEllipsis32 />
            </div>
          </div>
      }
    </div>
  );
}

export default Settings;