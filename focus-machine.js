import {useState} from './my-state-machine.js'

export const focusMachineBody = {
    id: 'focus',
    initialState: 'inFocus',
    context: {},
    states: {
        inFocus: {
            on: {
                UNFOCUS: {
                    service:(event) => {
                        const [state, setState] = useState();
                        event.hideElement.style.display = 'none';
                        setState('notInFocus');
                    }
                }
            }
        },
        notInFocus: {
            on: {
                FOCUS: {
                    service:(event)=>{
                        const [state, setState] = useState();
                        if (event.showElement.firstElementChild) {
                            event.showElement.style.display = 'block';
                            setState('inFocus');
                        }
                    }
                }
            }
        }
    },
    actions: {}
}