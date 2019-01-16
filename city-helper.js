import {machine, useContext, useState} from './my-state-machine.js'

const inputMinLength = 2;
const inputElement = document.querySelector(".city-input");
const selectorElement = document.querySelector(".city-selector");

const helperMachine = new machine({
    id: 'city-helper',
    initialState: 'notActive',
    context: {
        inputElement: inputElement,
        inputInFocus: true,
        selectorElement: selectorElement,
        findValue: '',
        responseTowns: [],
        selection: '',
        itemClassName: 'city-selector__item',
        itemActiveClassName: 'city-selector__item_current'
    },
    states: {
        notActive: {
            onEntry: ['clearSelector', 'fetching'],
            on: {
                EDIT: {
                    target: 'notActive',
                },
                FOCUS: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (context.selectorElement.firstElementChild) {
                            context.selectorElement.style.display = 'block';
                            setContext({inputInFocus: true});
                        }
                    }
                },
                UNFOCUS: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        context.selectorElement.style.display = 'none';
                        setContext({inputInFocus: false});
                    }
                }
            }
        },
        Active: {
            onEntry: ['clearSelector', 'fillSelector'],
            on: {
                EDIT: {
                    target: 'notActive',
                },
                TARGETING: {
                    service: (event) => {
                        const [context] = useContext();
                        if (event.selectorTarget.className === context.itemClassName) {
                            event.selectorTarget.classList.add(context.itemActiveClassName);
                        }
                    }
                },
                UNTARGETING: {
                    service: (event) => {
                        const [context] = useContext();
                        const selectorTarget = document.querySelector(`.${context.itemActiveClassName}`);
                        if (selectorTarget) {
                            selectorTarget.classList.remove(context.itemActiveClassName);
                        }
                    }
                },
                DOWNTARGET: {
                    service: (event) => {
                        const [context] = useContext();
                        let selectorTarget = document.querySelector(`.${context.itemActiveClassName}`);
                        if (selectorTarget) {
                            selectorTarget.classList.remove(context.itemActiveClassName);
                            selectorTarget = selectorTarget.nextElementSibling;
                        } else {
                            selectorTarget = context.selectorElement.firstElementChild;
                        }
                        if (selectorTarget) {
                            selectorTarget.classList.add(context.itemActiveClassName);
                        }
                    }
                },
                UPTARGET: {
                    service: (event) => {
                        const [context] = useContext();
                        let selectorTarget = document.querySelector(`.${context.itemActiveClassName}`);
                        if (selectorTarget) {
                            selectorTarget.classList.remove(context.itemActiveClassName);
                            selectorTarget = selectorTarget.previousElementSibling;
                        } else {
                            selectorTarget = context.selectorElement.lastElementChild;
                        }
                        if (selectorTarget) {
                            selectorTarget.classList.add(context.itemActiveClassName);
                        }
                    }
                },
                CHOOSE: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        const selectorTarget = document.querySelector(`.${context.itemActiveClassName}`);
                        if (selectorTarget) {
                            setContext({
                                selection: {
                                    id: selectorTarget.id,
                                    title: selectorTarget.innerHTML
                                }
                            });
                            context.inputElement.value = context.selection.title;
                            setState('selected');
                        }
                    }
                },
                FOCUS: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (context.selectorElement.firstElementChild) {
                            context.selectorElement.style.display = 'block';
                            setContext({inputInFocus: true});
                        }
                    }
                },
                UNFOCUS: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        if (!event.target.classList.contains(context.itemClassName)) {
                            context.selectorElement.style.display = 'none';
                            setContext({inputInFocus: false});
                        }
                    }
                }
            }
        },
        selected: {
            onEntry: 'clearSelector',
            onExit() {
                const [context, setContext] = useContext();
                setContext({selection: ''});
            },
            on: {
                EDIT: {
                    target: 'notActive',
                }
            }
        }
    },
    actions: {
        clearSelector() {
            const [context] = useContext();
            while (context.selectorElement.firstElementChild) {
                context.selectorElement.removeChild(context.selectorElement.firstElementChild);
            }
            context.selectorElement.style.display = 'none';
        },
        fetching() {
            const [context, setContext] = useContext();
            const [state, setState] = useState();
            const inputValue = context.inputElement.value;
            if (inputValue.trim().length < inputMinLength) {
                let li = document.createElement('li');
                li.appendChild(document.createTextNode(`Введите не менее ${inputMinLength} символов`));
                li.className = context.itemClassName;
                context.selectorElement.appendChild(li);
                if (context.inputInFocus) {
                    context.selectorElement.style.display = 'block';
                }
            } else {
                if (context.findValue !== inputValue || context.responseTowns.length === 0) {
                    setContext({findValue: inputValue});
                    window.fetch(`https://api.hh.ru/suggests/areas?text=${inputValue}`)
                        .then((response) => {
                            if (context.findValue === inputValue) {
                                if (response.status !== 200) {
                                    throw new Error("Fetch error.");
                                }
                                return response.json();
                            }
                        })
                        .then((Towns) => {
                            setContext({responseTowns: Towns.items});
                            setState('Active');
                        })
                        .catch((err) => {
                            while (context.selectorElement.firstElementChild) {
                                context.selectorElement.removeChild(context.selectorElement.firstElementChild);
                            }
                            let li = document.createElement('li');
                            li.appendChild(document.createTextNode('Ошибка при получении данных'));
                            li.className = context.itemClassName;
                            context.selectorElement.appendChild(li);
                            if (context.inputInFocus) {
                                context.selectorElement.style.display = 'block';
                            }
                        });
                } else {
                    setState('Active');
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
                    li.setAttribute('id', context.responseTowns[i].id);
                    li.className = context.itemClassName;
                    context.selectorElement.appendChild(li);
                }
            } else {
                let li = document.createElement('li');
                li.appendChild(document.createTextNode('Соответствий не найдено'));
                li.className = context.itemClassName;
                context.selectorElement.appendChild(li);
            }
            if (context.inputInFocus) {
                context.selectorElement.style.display = 'block';
            }
        }
    }
});

inputElement.addEventListener('focusin', (e) => {
    helperMachine.transition('FOCUS', e);
});

addEventListener('click', (e) => {
    if (e.target !== inputElement) {
        helperMachine.transition('UNFOCUS', e);
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
        case 'Tab':
            helperMachine.transition('UNFOCUS', e);
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
        e.stopPropagation();
    }
});
