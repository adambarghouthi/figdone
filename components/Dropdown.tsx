import { h } from 'preact'
import { Text } from '@create-figma-plugin/ui'

interface Props {
    contentPosition?: string,
    defaultValue?: {
        label: string,
        value: string
    },
    value?: {
        label: string,
        value: string
    },
    options: {
        label: string,
        value: string
    }[],
    isShowing: boolean,
    onBtnClick: () => void,
    onItemClick: (status:{ label:string, value:string }) => void
}

function Dropdown(props:Props) {
    return (
        <div class="dropdown">
            <button
                class={`dropdown-btn ${props?.value?.value}`}
                onClick={props.onBtnClick}
            >
                {props.value && props.value.label}
                {!props.value &&
                    props.defaultValue &&
                    props.defaultValue.label}
                <div class="dropdown-arrow" />
            </button>
            <div class={`dropdown-content
                ${props.contentPosition || 'up'}
                ${props.isShowing ? 'show' : ''}`}>
                {
                    props.options.map((o) =>
                        <a
                            class="dropdown-item"
                            onClick={() => props.onItemClick(o)}
                        >
                            <Text align="right">{o.label}</Text>
                        </a>
                    )
                }
            </div>
        </div>
    )
}

export default Dropdown;