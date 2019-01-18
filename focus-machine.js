import {useContext, useState} from './my-state-machine.js'

export const visibleMachineBody = {
    id: 'visible',
    initialState: 'notInit',
    context: {
        element: '',
        inFocus: false,
        isActive: false
    },
    states: {
        notInit: {
            on: {
                INIT: {
                    service:(event) => {
                        const [context, setContext] = useContext();
                        if (typeof event.element === 'object') {
                            setContext({element: event.element});
                            if (typeof event.inFocus) {
                                setContext({inFocus: event.inFocus});
                            } else {
                                setContext({inFocus: false});
                            }
                            if (typeof event.inFocus) {
                                setContext({isActive: event.isActive});
                            } else {
                                setContext({isActive: false});
                            }
                            const [state, setState] = useState();
                            setState('notActive');
                        }
                    }
                }
            }
        },
        Active: {
            onEntry() {
                const [context] = useContext();
                context.element.style.display = 'block';
            },
            on: {
                UNFOCUS: {
                    service:(event) => {
                        const [context, setContext] = useContext();
                        setContext({inFocus: false});
                        const [state, setState] = useState();
                        setState('notActive');
                    }
                },
                DEACTIVATE: {
                    service:(event) => {
                        const [context, setContext] = useContext();
                        setContext({isActive: false});
                        const [state, setState] = useState();
                        setState('notActive');
                    }
                }
            }
        },
        notActive: {
            onEntry() {
                const [context] = useContext();
                context.element.style.display = 'none';
            },
            on: {
                FOCUS: {
                    service:(event)=>{
                        const [context, setContext] = useContext();
                        setContext({inFocus: true});
                        if (context.isActive) {
                            const [state, setState] = useState();
                            setState('Active');
                        }
                    }
                },
                UNFOCUS: {
                    service:(event) => {
                        const [context, setContext] = useContext();
                        setContext({inFocus: false});
                    }
                },
                ACTIVATE: {
                    service:(event) => {
                        const [context, setContext] = useContext();
                        setContext({isActive: true});
                        if (context.inFocus) {
                            const [state, setState] = useState();
                            setState('Active');
                        }
                    }
                },
                DEACTIVATE: {
                    service:(event) => {
                        const [context, setContext] = useContext();
                        setContext({isActive: false});
                    }
                }
            }
        }
    },
    actions: {}
};