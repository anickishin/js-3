import {useContext, useState} from './my-state-machine.js'

export const fetchingMachineBody = {
    id: 'fetching',
    initialState: 'wait',
    context: {},
    states: {
        wait: {
            on: {
                FETCH: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        const [state, setState] = useState();
                        setContext({id: event.id, parent: event.parent});
                        window.fetch(event.url)
                            .then((response) => {
                                if (response.status !== 200) {
                                    throw new Error('Ошибка при получении данных');
                                }
                                return response.json();
                            })
                            .then((data) => {
                                if (data.items.length === 0) {
                                    throw new Error('Соответствий не найдено');
                                }
                                setContext({responseData: data.items});
                                setState('ok');
                            })
                            .catch((err) => {
                                context.parent.transition('FETCH_ERROR', {text: err.message});
                            });
                    }
                }
            }
        },
        ok: {
            onEntry() {
                const [context] = useContext();
                context.parent.transition('FETCH_SUCCESS', {id: context.id, data: context.responseData});
            }
        }
    },
    actions: {}
};