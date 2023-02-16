import { useEffect, useState } from "preact/hooks";
import { emit } from "@create-figma-plugin/utilities";
import { useRef } from "react";
import { h } from "preact";

import Dropdown from "../components/Dropdown";
import * as constants from "../../utils/constants";
import { LoadingIndicator } from "@create-figma-plugin/ui";

interface FrameProps {
  filter: { label: string; value: string };
  selectedFrames: string[];
  frames: { id: string; name: string; statusIcon: string }[];
  statuses: {
    statusOptions: { label: string; value: string; color: string }[];
    statusKeyToIcon: { [key: string]: string };
    statusIconToKey: { [key: string]: string };
  };
}

function Frames({ filter, selectedFrames, frames, statuses }: FrameProps) {
  const [openedDropdown, setOpenedDropdown] = useState<string>("");
  const frameRowRef = useRef<HTMLDivElement>(null);

  const handleFrameClick = async (frameId: string) => {
    emit("FOCUS_FRAME", frameId);
  };

  const handleStatusClick = (frameId: string, status: string) => {
    setOpenedDropdown("");
    emit("UPDATE_STATUS", frameId, statuses.statusKeyToIcon[status]);
  };

  const handleDropdown = (id: string) => {
    if (id === openedDropdown) {
      setOpenedDropdown("");
    } else {
      setOpenedDropdown(id);
    }
  };

  useEffect(() => {
    if (frameRowRef.current) {
      window.scrollTo({
        top: frameRowRef.current.offsetTop - 40,
        behavior: "smooth",
      });
    }
  }, [selectedFrames]);

  useEffect(() => {
    setOpenedDropdown("");
  }, [filter]);

  if (!statuses) {
    return (
      <div class="container">
        <div class="empty-state">
          <h1>
            <LoadingIndicator />
          </h1>
          <p>Making things nice...</p>
        </div>
      </div>
    );
  }

  return (
    <div class="container">
      {frames
        .filter((f) => {
          if (
            filter.value === "all" ||
            statuses.statusIconToKey[f.statusIcon] === filter.value
          ) {
            return true;
          }

          return false;
        })
        .map((f, fIdx, filteredFrames) => {
          const isSelected = selectedFrames.includes(f.id);

          return (
            <div
              class={`frame-item ${isSelected ? "selected" : ""}`}
              ref={isSelected ? frameRowRef : undefined}
            >
              <a class="frame-name" onClick={() => handleFrameClick(f.id)}>
                {f.name}
              </a>
              <Dropdown
                contentPosition={
                  fIdx > 4 && fIdx > filteredFrames.length - 5 ? "up" : "down"
                }
                isShowing={openedDropdown === f.id}
                value={
                  statuses.statusOptions.find(
                    (s) => s.value === statuses.statusIconToKey[f.statusIcon]
                  ) ||
                  constants.statusOptions.find((s) => s.value === "no-status")
                }
                options={statuses.statusOptions}
                color={
                  statuses.statusOptions.find(
                    (s) => s.value === statuses.statusIconToKey[f.statusIcon]
                  )?.color
                }
                onBtnClick={() => handleDropdown(f.id)}
                onItemClick={(status) => handleStatusClick(f.id, status.value)}
              />
            </div>
          );
        })}

      {filter.value !== "all" &&
        !frames.filter(
          (f) => statuses.statusIconToKey[f.statusIcon] === filter.value
        ).length && (
          <div class="empty-state">
            <h1>😵‍💫</h1>
            <p>No frames in '{filter.label}'</p>
          </div>
        )}
    </div>
  );
}

export default Frames;
