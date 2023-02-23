import {
  render,
  LoadingIndicator,
  Banner,
  IconCheckCircle32,
} from "@create-figma-plugin/ui";
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
  initialFrames: { id: string; name: string; statusIcon: string }[];
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [figmaUser, setFigmaUser] = useState<any>();
  const [figDoneUser, setFigDoneUser] = useState<any>();
  const [statuses, setStatuses] = useState<any>();
  const [refreshStatuses, setRefreshStatuses] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyRecId, setApiKeyRecId] = useState<string>("");

  const [openedDropdown, setOpenedDropdown] = useState<string>("");
  const [frames, setFrames] = useState<
    { id: string; name: string; statusIcon: string }[]
  >(props.initialFrames);
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [filter, setFilter] = useState<{ label: string; value: string }>({
    label: "All",
    value: "all",
  });
  const [navItem, setNavItem] = useState<string>("frames");

  const handleSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => {
      setSuccess("");
    }, 2000);
  };

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
      let result;

      try {
        result = await airtable("statuses").deleteById(id);
      } catch (error) {
        console.log(error);
      }

      if (result?.data.deleted) {
        handleSuccess("Deleted successfully.");
        setLoading(false);
        setRefreshStatuses(true);
      }
    };

    setLoading(true);
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

      try {
        if (id) {
          const oldStatus = statuses.statusOptions.find(
            (status: any) => status.id === id
          );
          const updatableFrames = frames
            .filter(
              (f) => f.statusIcon === statuses.statusKeyToIcon[oldStatus.value]
            )
            .map((f) => f.id);

          statusResult = await airtable("statuses").updateById(id, {
            ...rest,
            key: [apiKeyRecId],
          });

          emit("UPDATE_STATUS", updatableFrames, status.emoji);
        } else {
          statusResult = await airtable("statuses").create({
            ...rest,
            key: [apiKeyRecId],
          });
        }

        handleSuccess("Saved successfully.");
        setLoading(false);
        setRefreshStatuses(true);
      } catch (error) {
        console.log(error);
      }

      // console.log(statusResult);
    };

    setLoading(true);
    saveStatus();
  };

  const handleSubmitApiKey = (key: string) => {
    const submitApiKey = async () => {
      const apiKeyResult = await airtable("keys").select(
        `AND({hash}=${key},{userNum}<{licenseNum})`
      );

      if (apiKeyResult.data.records.length) {
        const userResult: any = await airtable("users").create({
          figmaId: figmaUser.id,
          name: figmaUser.name,
          keys: [apiKeyResult.data.records[0].id],
        });

        const user = userResult.data.records?.[0];

        if (user) {
          setFigDoneUser(user);
          setApiKey(apiKeyResult.data.records[0].fields.hash);
          setApiKeyRecId(apiKeyResult.data.records[0].id);
        }

        handleSuccess("Custom statuses unlocked!");
        setLoading(false);
      }
    };

    setLoading(true);
    submitApiKey();
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
        `{figmaId}=${figmaUser.id}`
      );

      const user = userResult.data.records?.[0];

      if (user) {
        const apiKeyResult = await airtable("keys").select(
          `RECORD_ID()="${user.fields.keys[0]}"`
        );

        setFigDoneUser(user);
        setApiKey(apiKeyResult.data.records[0].fields.hash);
        setApiKeyRecId(apiKeyResult.data.records[0].id);
      } else {
        setStatuses({
          statusOptions: constants.statusOptions,
          statusKeyToIcon: constants.statusKeyToIcon,
          statusIconToKey: constants.statusIconToKey,
        });
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

      if (statusResults.data.records?.length) {
        const statusOptions: {
          id: string;
          label: string;
          value: string;
          color: string;
        }[] = [
          ...statusResults.data.records.map((status: any) => ({
            id: status.id,
            label: status.fields.label,
            value: status.fields.value,
            color: status.fields.color,
          })),
          { label: "No status", value: "no-status" },
        ];

        const statusKeyToIcon: { [key: string]: string } = {};

        statusResults.data.records.forEach(
          (status: { fields: { value: string; emoji: string } }) => {
            statusKeyToIcon[status.fields.value] = status.fields.emoji;
          }
        );

        const statusIconToKey: { [key: string]: string } = {};

        statusResults.data.records.forEach(
          (status: { fields: { value: string; emoji: string } }) => {
            statusIconToKey[status.fields.emoji] = status.fields.value;
          }
        );

        setStatuses({
          statusOptions,
          statusKeyToIcon,
          statusIconToKey,
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
          statuses={statuses}
        />
      </div>

      <div style={{ display: navItem !== "settings" ? "none" : "block" }}>
        <Settings
          apiKey={apiKey ? true : false}
          statuses={statuses}
          onSaveStatus={handleSaveStatus}
          onDeleteStatus={handleDeleteStatus}
          onSaveApiKey={handleSubmitApiKey}
        />
      </div>

      {loading && (
        <div class="banner">
          <Banner icon={<LoadingIndicator />}>Loading...</Banner>
        </div>
      )}

      {success && (
        <div class="banner">
          <Banner icon={<IconCheckCircle32 />} variant="success">
            {success}
          </Banner>
        </div>
      )}
    </Fragment>
  );
}

export default render(Plugin);
