import {machine, useContext, useState} from './my-state-machine.js'

let inputElement = document.querySelector(".city-input");
let selectorElement = document.querySelector(".city-selector");

const helperMachine = new machine({
    id: 'city-helper',
    initialState: 'notActive',
    context: {
        inputElement: inputElement,
        selectorElement: selectorElement,
        findValue: '',
        responseTowns: [],
        selectorTarget: '',
        selection: ''
    },
    states: {
        notActive: {
            onEntry: ['clearSelector', 'showHint'],
            on: {
                EDIT: {
                    target: 'Active',
                }
            }
        },
        Active: {
            onEntry: ['clearSelector', 'fetching'],
            on: {
                EDIT: {
                    target: 'Active',
                }
            }
        },
        choosing: {
            onEntry: 'fillSelector',
            on: {
                EDIT: {
                    target: 'Active',
                },
                TARGETING: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (event.selectorTarget.getAttribute('class') === 'city-selector__item') {
                            event.selectorTarget.setAttribute('class', 'city-selector__item city-selector__item_current');
                            setContext({selectorTarget: event.selectorTarget});
                        }
                    }
                },
                UNTARGETING: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (context.selectorTarget) {
                            context.selectorTarget.setAttribute('class', 'city-selector__item');
                            setContext({selectorTarget: ''});
                        }
                    }
                },
                DOWNTARGET: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (context.selectorTarget) {
                            context.selectorTarget.setAttribute('class', 'city-selector__item');
                            setContext({selectorTarget: context.selectorTarget.nextElementSibling});
                        } else {
                            setContext({selectorTarget: context.selectorElement.firstElementChild});
                        }
                        context.selectorTarget.setAttribute('class', 'city-selector__item city-selector__item_current');
                    }
                },
                UPTARGET: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (context.selectorTarget) {
                            context.selectorTarget.setAttribute('class', 'city-selector__item');
                            setContext({selectorTarget: context.selectorTarget.previousElementSibling});
                        } else {
                            setContext({selectorTarget: context.selectorElement.lastElementChild});
                        }
                        context.selectorTarget.setAttribute('class', 'city-selector__item city-selector__item_current');
                    }
                },
                CHOOSE: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        if (context.selectorTarget) {
                            setContext({selection: context.selectorTarget});
                            context.inputElement.value = context.selection.innerHTML;
                            setState('selected');
                        }
                    }
                }
            }
        },
        selected: {
            onEntry: 'clearSelector',
            onExit() {
                const [context, setContext] = useContext();
                setContext('selection', '');
            },
            on: {
                EDIT: {
                    target: 'Active',
                }
            }
        }
    },
    actions: {
        showHint() {
            const [context] = useContext();
            let li = document.createElement('li');
            li.appendChild(document.createTextNode('Введите не менее 2 символов'));
            li.setAttribute('class', 'city-selector__item');
            context.selectorElement.appendChild(li);
        },
        clearSelector() {
            const [context] = useContext();
            while (context.selectorElement.firstElementChild) {
                context.selectorElement.removeChild(context.selectorElement.firstElementChild);
            }
            context.selectorElement.display = 'none'
        },
        fetching() {
            const [context, setContext] = useContext();
            const [state, setState] = useState();
            if (context.inputElement.value.length < 2) {
                setState('notActive');
            } else {
                const inputValue = context.inputElement.value;
                if (context.findValue !== inputValue) {
                    setContext({findValue: inputValue});
                    window.fetch('https://api.hh.ru/suggests/areas?text=' + inputValue).then((response) => {
                        if (context.findValue === inputValue) {
                            if (response.status !== 200) {
                                throw new Error("Fetch error.");
                            }
                            return response.json();
                        }
                    }).then((Towns) => {
                        setContext({responseTowns: Towns.items});
                        setState('choosing');
                    });
                } else {
                    setState('choosing');
                }
            }
        },
        fillSelector() {
            const [context, setContext] = useContext();
            const [state, setState] = useState();
            if (context.responseTowns && context.responseTowns.length > 0) {
                for (let i = 0; i < context.responseTowns.length; i++) {
                    let li = document.createElement("li");
                    li.appendChild(document.createTextNode(context.responseTowns[i].text));
                    li.setAttribute('class', 'city-selector__item');
                    context.selectorElement.appendChild(li);
                }
            } else {
                let li = document.createElement('li');
                li.appendChild(document.createTextNode('Соответствий не найдено'));
                li.setAttribute('class', 'city-selector__item');
                context.selectorElement.appendChild(li);
            }
        }
    }
});

inputElement.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowDown':
            helperMachine.transition('DOWNTARGET', e);
            break;
        case 'ArrowUp':
            helperMachine.transition('UPTARGET', e);
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
        default:
            helperMachine.transition('EDIT', e);
            break;
    }
});

addEventListener("mouseover", (e) => {
    if (e.target instanceof Element) {
        helperMachine.transition('UNTARGETING', e);
    }
}, true);

selectorElement.addEventListener("mouseover", (e) => {
    if (e.target instanceof Element) {
        helperMachine.transition('TARGETING', {selectorTarget: e.target});
    }
});

selectorElement.addEventListener('click', (e) => {
    if (e.target instanceof Element) {
        helperMachine.transition('CHOOSE', e);
    }
});
