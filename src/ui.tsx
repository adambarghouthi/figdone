import {
  Text,
  Bold,
  render,
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { Fragment, h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { useRef } from 'react'

import Dropdown from '../components/Dropdown'
import * as constants from '../utils/constants'

import '!./styles.css'
// import { InsertCodeHandler } from './types'

function Plugin(props: {
  initialFrames: { id:string, name:string, status:string }[],
}) {
  const [openedDropdown, setOpenedDropdown] = useState<string>('');
  const [frames, setFrames] = useState<{ id:string, name:string, status:string }[]>(props.initialFrames);
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [filter, setFilter] = useState<{ label: string, value: string}>({ label: 'All', value: 'all' });
  const frameRowRef = useRef<HTMLDivElement>(null);

  const handleFrameClick = (frameId:string) => {
    emit("FOCUS_FRAME", frameId);
  };

  const handleStatusClick = (frameId:string, status:string) => {
    setOpenedDropdown('');
    emit("UPDATE_STATUS", frameId, constants.statusKeyToIcon[status]);
  };

  const handleDropdown = (id:string) => {
    if (id === openedDropdown) {
      setOpenedDropdown('');
    } else {
      setOpenedDropdown(id);
    }
  };
  
  const handleFilter = (filter:{ label: string, value: string }) => {
    setOpenedDropdown('');
    setFilter(filter);
  };

  onmessage = (event) => {
    const { message, ...data } = event.data.pluginMessage;

    if (message === 'select-frames') {
      setSelectedFrames(data.selectedFrames);
    }

    if (message === 'update-frames') {
      setFrames(data.frames);
    }
  }

  useEffect(() => {
    if (frameRowRef.current) {
      window.scrollTo({top: frameRowRef.current.offsetTop - 40, behavior: 'smooth'});
    }
  }, [selectedFrames]);

  return (
    <Fragment>
      <div class="navbar">
        <Text>
          <Bold>Frame</Bold>
        </Text>
        <Dropdown
          isShowing={openedDropdown === 'filter'}
          value={filter}
          options={[
            { label: 'All', value: 'all' },
            ...constants.statusOptions
          ]}
          onBtnClick={() => handleDropdown('filter')}
          onItemClick={handleFilter}
        />
      </div>

      <div class="container">
        {
          frames
            .filter((f) => {
              if (filter.value === 'all' || f.status === filter.value) {
                return true;
              }

              return false;
            })
            .map((f, fIdx, filteredFrames) => {
              const isSelected = selectedFrames.includes(f.id);

              return (
                <div
                  class={`frame-item ${isSelected ? 'selected' : ''}`}
                  ref={isSelected ? frameRowRef : undefined}
                >
                  <a
                    class="frame-name"
                    onClick={() => handleFrameClick(f.id)}
                  >
                    {f.name}
                  </a>
                  <Dropdown
                    contentPosition={fIdx > 4 && fIdx > filteredFrames.length - 5 ? 'up' : 'down'}
                    isShowing={openedDropdown === f.id}
                    value={constants.statusOptions.find((s) => s.value === f.status)}
                    options={constants.statusOptions}
                    onBtnClick={() => handleDropdown(f.id)}
                    onItemClick={(status) => handleStatusClick(f.id, status.value)}
                  />
                </div>
              );
            })
        }

        {
          filter.value !== 'all' &&
          !frames.filter((f) => f.status === filter.value).length &&
            <div class="empty-state">
              <h1>😵‍💫</h1>
              <p>
                No frames in '{filter.label}'
              </p>
            </div>
        }
      </div>
    </Fragment>
  )
}

export default render(Plugin)
