import {machine, useContext, useState} from './my-state-machine.js'
import {focusMachineBody} from "./focus-machine.js";
import {fetchingMachineBody} from "./fetching-machine.js";
import {listMachineBody} from "./list-machine.js";


const inputMinLength = 2;
const inputElement = document.querySelector(".city-input");
const selectorElement = document.querySelector(".city-selector");
const focusMachine = new machine(focusMachineBody);

const helperMachine = new machine({
    id: 'city-helper',
    initialState: 'notActive',
    context: {
        listMachine: '',
        focusMachine: new machine(focusMachineBody),
        inputElement: inputElement,
        inputInFocus: false,
        selectorElement: selectorElement,
        findValue: '',
        responseTowns: [],
        selection: '',
        itemClassName: 'city-selector__item',
        itemActiveClassName: 'city-selector__item_current'
    },
    states: {
        notActive: {
            onEntry() {
                const [context, setContext] = useContext();
                const inputValue = context.inputElement.value;
                if (inputValue.trim().length < inputMinLength) {
                    helperMachine.transition('FETCH_ERROR', {text: `Введите не менее ${inputMinLength} символов`});
                } else {
                    if (context.findValue !== inputValue || context.responseTowns.length === 0) {
                        setContext({findValue: inputValue});
                        const fetchingMachine = new machine(fetchingMachineBody);
                        fetchingMachine.transition('FETCH', {
                            url: `https://api.hh.ru/suggests/areas?text=${inputValue}`,
                            id: inputValue,
                            parent: helperMachine
                        });
                    }
                }
            },
            onExit(){
                const [context, setContext] = useContext();
                setContext({listMachine: ''});
                focusMachine.transition('UNFOCUS',{hideElement:selectorElement});
            },
            on: {
                EDIT: {
                    target: 'notActive',
                },
                FETCH_SUCCESS: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (event.id === context.findValue) {
                            const [state, setState] = useState();
                            setContext({responseTowns: event.data});
                            setState('Active');
                        }
                    }
                },
                FETCH_ERROR: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        focusMachine.transition('UNFOCUS',{hideElement:selectorElement});
                        let listMachine = new machine(listMachineBody);
                        setContext({listMachine:listMachine});
                        listMachine.transition('INIT', {
                            parent: helperMachine,
                            list: [event.text],
                            selectorElement: context.selectorElement,
                            itemClassName: context.itemClassName,
                            selecting: false,
                            itemActiveClassName: context.itemActiveClassName
                        });
                    }
                },
                FOCUS: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (event.showElement) {
                            setContext({inputInFocus: true});
                        }
                        if (context.inputInFocus && context.listMachine) {
                            focusMachine.transition('FOCUS',{showElement:selectorElement});
                        }
                    }
                },
                UNFOCUS: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (event.hideElement) {
                            setContext({inputInFocus: false});
                        }
                        focusMachine.transition('UNFOCUS',{hideElement:selectorElement});
                    }
                }
            }
        },
        Active: {
            onEntry() {
                const [context, setContext] = useContext();
                focusMachine.transition('UNFOCUS',{hideElement:selectorElement});
                let listMachine = new machine(listMachineBody);
                setContext({listMachine: listMachine});
                setContext({listMachine: listMachine});
                listMachine.transition('INIT', {
                    parent: helperMachine,
                    list: context.responseTowns,
                    selectorElement: context.selectorElement,
                    itemClassName: context.itemClassName,
                    selecting: true,
                    itemActiveClassName: context.itemActiveClassName
                });
            },
            onExit(){
                const [context, setContext] = useContext();
                setContext({listMachine: ''});
                focusMachine.transition('UNFOCUS',{hideElement:selectorElement});
            },
            on: {
                EDIT: {
                    target: 'notActive',
                },
                TARGET: {
                    service: (event) => {
                        const [context] = useContext();
                        context.listMachine.transition('TARGET', event);
                    }
                },
                UNTARGET: {
                    service: (event) => {
                        const [context] = useContext();
                        context.listMachine.transition('UNTARGET', event);
                    }
                },
                CHOOSE: {
                    service: (event) => {
                        const [context] = useContext();
                        context.listMachine.transition('CHOOSE', event);
                    }
                },
                SELECT: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        setContext(event);
                        context.inputElement.value = context.selection.title;
                        setState('selected');
                    }
                },
                FOCUS: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (event.showElement) {
                            setContext({inputInFocus: true});
                        }
                        if (context.inputInFocus && context.listMachine) {
                            focusMachine.transition('FOCUS',{showElement:selectorElement});
                        }
                    }
                },
                UNFOCUS: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (event.hideElement) {
                            setContext({inputInFocus: false});
                        }
                        focusMachine.transition('UNFOCUS',{hideElement:selectorElement});
                    }
                }
            }
        },
        selected: {
            onExit() {
                const [context, setContext] = useContext();
                setContext({selection: ''});
            },
            on: {
                EDIT: {
                    target: 'notActive',
                },
                FOCUS: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        setContext({inputInFocus: true});
                    }
                },
                UNFOCUS: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        setContext({inputInFocus: false});
                    }
                }
            }
        }
    },
    actions: {}
});

inputElement.addEventListener('focusin', (e) => {
    helperMachine.transition('FOCUS', {showElement: selectorElement});
});

addEventListener('click', (e) => {
    if (e.target !== inputElement) {
        helperMachine.transition('UNFOCUS', {hideElement: selectorElement});
    }
});

inputElement.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowDown':
            helperMachine.transition('TARGET', {keyDown: true});
            break;
        case 'ArrowUp':
            helperMachine.transition('TARGET', {keyUp: true});
            break;
        case 'Tab':
            helperMachine.transition('UNFOCUS', {hideElement: selectorElement});
            break;
    }
});

inputElement.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowDown':
            break;
        case 'ArrowUp':
            break;
        case 'Enter':
            helperMachine.transition('CHOOSE', e);
            break;
        case 'ArrowLeft':
            break;
        case 'ArrowRight':
            break;
        default:
            helperMachine.transition('EDIT', e);
            break;
    }
});

addEventListener("mouseover", (e) => {
    if (e.target instanceof Element) {
        helperMachine.transition('UNTARGET', e);
    }
}, true);

selectorElement.addEventListener("mouseover", (e) => {
    if (e.target instanceof Element) {
        helperMachine.transition('TARGET', {selectorTarget: e.target});
    }
});

selectorElement.addEventListener('click', (e) => {
    if (e.target instanceof Element) {
        helperMachine.transition('CHOOSE', e);
        e.stopPropagation();
    }
});
