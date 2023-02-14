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
  const [refreshStatuses, setRefreshStatuses] = useState<boolean>(false);
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

  const handleDeleteStatus = (id: string) => {
    const deleteStatus = async () => {
      const result: any = await airtable("statuses").deleteById(id);

      if (result.data.deleted) {
        setRefreshStatuses(true);
      }
    };

    deleteStatus();
  };

  const handleSaveStatus = (status: {
    id: string;
    label: string;
    value: string;
    emoji: string;
    color: string;
  }) => {
    const saveStatus = async () => {
      const { id, ...rest } = status;
      let statusResult;

      if (id) {
        statusResult = await airtable("statuses").updateById(id, {
          ...rest,
          key: [apiKeyRecId],
        });
      } else {
        statusResult = await airtable("statuses").create({
          ...rest,
          key: [apiKeyRecId],
        });
      }

      console.log(statusResult);

      setRefreshStatuses(true);
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
            id: status.id,
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

    if (apiKey || refreshStatuses) {
      getStatuses();
    }

    if (refreshStatuses) {
      setRefreshStatuses(false);
    }
  }, [apiKey, refreshStatuses]);

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

      <div style={{ display: navItem !== "frames" ? "none" : "block" }}>
        <Frames
          filter={filter}
          selectedFrames={selectedFrames}
          frames={frames}
        />
      </div>

      <div style={{ display: navItem !== "settings" ? "none" : "block" }}>
        <Settings
          apiKey={apiKey ? true : false}
          statuses={statuses}
          onSaveStatus={handleSaveStatus}
          onDeleteStatus={handleDeleteStatus}
        />
      </div>
    </Fragment>
  );
}

export default render(Plugin);
