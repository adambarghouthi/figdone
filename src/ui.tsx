import { render } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";

import Frames from "./pages/Frames";
import Settings from "./pages/Settings";
import Dropdown from "./components/Dropdown";
import * as constants from "../utils/constants";

import "!./styles.css";
import airtable from "../utils/airtable";

function Plugin(props: {
  initialFrames: { id: string; name: string; status: string }[];
}) {
  const [figmaUser, setFigmaUser] = useState<string>("");
  const [figDoneUser, setFigDoneUser] = useState<any>();
  const [statuses, setStatuses] = useState<any>();
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyRecId, setApiKeyRecId] = useState<string>("");

  const [openedDropdown, setOpenedDropdown] = useState<string>("");
  const [frames, setFrames] = useState<
    { id: string; name: string; status: string }[]
  >(props.initialFrames);
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [filter, setFilter] = useState<{ label: string; value: string }>({
    label: "All",
    value: "all",
  });
  const [navItem, setNavItem] = useState<string>("frames");

  const handleDropdown = (id: string) => {
    if (id === openedDropdown) {
      setOpenedDropdown("");
    } else {
      setOpenedDropdown(id);
    }
  };

  const handleFilter = (filter: { label: string; value: string }) => {
    setOpenedDropdown("");
    setFilter(filter);
  };

  const handleSaveStatus = (status: {
    label: string;
    value: string;
    emoji: string;
    color: string;
  }) => {
    const saveStatus = async () => {
      const statusResult = await airtable("statuses").create({
        ...status,
        key: [apiKeyRecId],
      });

      const newStatusOptions = [
        ...statuses.statusOptions,
        {
          label: status.label,
          value: status.value,
          color: status.color,
        },
      ];
      const newStatusKeyToIcon = {
        ...statuses.statusKeyToIcon,
        [status.value]: status.emoji,
      };

      setStatuses({
        statusOptions: newStatusOptions,
        statusKeyToIcon: newStatusKeyToIcon,
      });
    };

    saveStatus();
  };

  onmessage = (event) => {
    const { message, ...data } = event.data.pluginMessage;

    if (message === "select-frames") {
      setSelectedFrames(data.selectedFrames);
    }

    if (message === "update-frames") {
      setFrames(data.frames);
    }

    if (message === "set-user") {
      setFigmaUser(data.user);
    }
  };

  useEffect(() => {
    const getData = async () => {
      const userResult = await airtable("users").select(
        `{figmaId}=${figmaUser}`
      );

      const user = userResult.data.records?.[0];

      if (user) {
        const apiKeyResult = await airtable("keys").select(
          `RECORD_ID()="${user.fields.keys[0]}"`
        );

        setFigDoneUser(user);
        setApiKey(apiKeyResult.data.records[0].fields.hash);
        setApiKeyRecId(apiKeyResult.data.records[0].id);
      }
    };

    if (figmaUser) {
      getData();
    }
  }, [figmaUser]);

  useEffect(() => {
    const getStatuses = async () => {
      const statusResults = await airtable("statuses").select(
        `{keyString}=${apiKey}`
      );

      console.log(statusResults.data.records);

      if (statusResults.data.records?.length) {
        const statusOptions: [{ label: string; value: string; color: string }] =
          statusResults.data.records.map((status: any) => ({
            label: status.fields.label,
            value: status.fields.value,
            color: status.fields.color,
          }));

        const statusKeyToIcon: { [key: string]: string } = {};

        statusResults.data.records.forEach(
          (status: { fields: { value: string; emoji: string } }) => {
            statusKeyToIcon[status.fields.value] = status.fields.emoji;
          }
        );

        setStatuses({
          statusOptions,
          statusKeyToIcon,
        });
      }
    };

    if (apiKey) {
      getStatuses();
    }
  }, [apiKey]);

  useEffect(() => {
    emit("GET_FIGMA_USER");
  }, []);

  return (
    <Fragment>
      <div class="navbar">
        <div class="navbar-menu">
          <a
            class={`navbar-item ${navItem === "frames" ? "selected" : ""}`}
            onClick={() => setNavItem("frames")}
          >
            Frames
          </a>
          <a
            class={`navbar-item ${navItem === "settings" ? "selected" : ""}`}
            onClick={() => setNavItem("settings")}
          >
            Settings
          </a>
        </div>
        {navItem === "frames" && (
          <Dropdown
            isShowing={openedDropdown === "filter"}
            value={filter}
            options={[
              { label: "All", value: "all" },
              ...constants.statusOptions,
            ]}
            onBtnClick={() => handleDropdown("filter")}
            onItemClick={handleFilter}
          />
        )}
      </div>

      {navItem === "frames" && (
        <Frames
          filter={filter}
          selectedFrames={selectedFrames}
          frames={frames}
        />
      )}

      {navItem === "settings" && (
        <Settings
          apiKey={apiKey ? true : false}
          statuses={statuses}
          onSaveStatus={handleSaveStatus}
        />
      )}
    </Fragment>
  );
}

export default render(Plugin);
