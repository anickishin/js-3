import {useContext, useState} from './my-state-machine.js'

export const listMachineBody = {
        id: 'list',
        initialState: 'notActive',
        context: {
            parent: '',
            list: [],
            selectorElement: '',
            itemClassName: '',
            selecting: '',
            itemActiveClassName: ''
        },
        states: {
            notActive: {
                on: {
                    INIT: {
                        service: (event) => {
                            const [context, setContext] = useContext();
                            const [state, setState] = useState();
                            setContext({
                                parent: event.parent,
                                list: event.list,
                                selectorElement: event.selectorElement,
                                itemClassName: event.itemClassName,
                                selecting: event.selecting,
                                itemActiveClassName: event.itemActiveClassName
                            });
                            while (context.selectorElement.firstElementChild) {
                                context.selectorElement.removeChild(context.selectorElement.firstElementChild);
                            }
                            for (let i = 0; i < context.list.length; i++) {
                                let li = document.createElement("li");
                                if (typeof context.list[i] === 'string') {
                                    li.appendChild(document.createTextNode(context.list[i]));
                                } else {
                                    li.appendChild(document.createTextNode(context.list[i].text));
                                    li.setAttribute('id', context.list[i].id);
                                }
                                li.className = context.itemClassName;
                                context.selectorElement.appendChild(li);
                            }
                            if (context.selecting) {
                                setState('Active');
                            }
                        }
                    }
                }
            },
            Active: {
                on: {
                    TARGET: {
                        service: (event) => {
                            const [context] = useContext();
                            if (event.selectorTarget) {
                                if (event.selectorTarget.className === context.itemClassName) {
                                    event.selectorTarget.classList.add(context.itemActiveClassName);
                                }
                            } else {
                                let selectorTarget = document.querySelector(`.${context.itemActiveClassName}`);
                                if (selectorTarget) {
                                    selectorTarget.classList.remove(context.itemActiveClassName);
                                }
                                if (event.keyUp && event.keyUp===true) {
                                    if (selectorTarget) {
                                        selectorTarget = selectorTarget.previousElementSibling;
                                    } else {
                                        selectorTarget = context.selectorElement.lastElementChild;
                                    }
                                } else {
                                    if (selectorTarget) {
                                        selectorTarget = selectorTarget.nextElementSibling;
                                    } else {
                                        selectorTarget = context.selectorElement.firstElementChild;
                                    }
                                }
                                if (selectorTarget) {
                                    selectorTarget.classList.add(context.itemActiveClassName);
                                }
                            }
                        }
                    },
                    UNTARGET: {
                        service: (event) => {
                            const [context] = useContext();
                            const selectorTarget = document.querySelector(`.${context.itemActiveClassName}`);
                            if (selectorTarget) {
                                selectorTarget.classList.remove(context.itemActiveClassName);
                            }
                        }
                    },
                    CHOOSE: {
                        service: (event) => {
                            const [context, setContext] = useContext();
                            const [state, setState] = useState();
                            const selectorTarget = document.querySelector(`.${context.itemActiveClassName}`);
                            if (selectorTarget) {
                                context.parent.transition('SELECT',{selection: {id: selectorTarget.id,title: selectorTarget.innerHTML}});
                            }
                        }
                    }
                }
            }
        },
        actions: {}
    }
;