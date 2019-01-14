let stack = [];

export class machine {
    constructor(body) {
        this.id = body.id;
        this.currentState = body.initialState;
        this.context = body.context;
        this.states = body.states;
        this.actions = body.actions;
        if (typeof this.states === 'undefined') {
            this.states = {};
        }
        if (typeof this.actions === 'undefined') {
            this.actions = {};
        }
    }

    executeAction(action) {
        if (typeof action === 'function') {
            stack.unshift(this);
            action(this.event);
            stack.shift();
        } else if (Array.isArray(action)) {
            for (let i = 0; i < action.length; i++) {
                this.executeAction(action[i]);
            }
        } else if (typeof action === 'string') {
            this.executeAction(this.actions[action]);
        }
    }

    transition(event, data) {
        let currentEvent = this.states;
        let path = [this.currentState, "on", event];
        for (let i = 0; i < path.length; i++) {
            if (typeof path[i] === 'undefined') {
                return undefined;
            }
            currentEvent = currentEvent[path[i]];
            if (typeof currentEvent === 'undefined') {
                return undefined;
            }
        }
        this.event = event;
        if (currentEvent["service"]) {
            stack.unshift(this);
            currentEvent.service(data);
            stack.shift();
        } else if (currentEvent["target"]) {
            const [state, setState] = useState();
            setState(currentEvent.target);
        }
    }

}

export function useContext() {
    if (stack.length > 0) {
        const machineObj = stack[0];

        const setContext = function(context) {
            if (typeof (machineObj.context) === 'undefined') {
                machineObj.context = context;
            } else {
                Object.assign(machineObj.context, context);
            }
        }

        return [machineObj.context, setContext];
    } else {
        return null;
    }
}

export function useState() {
    if (stack.length > 0) {
        const machineObj = stack[0];

        const setState = function(state) {
            const oldState = machineObj.states[machineObj.currentState];
            const newState = machineObj.states[state];
            if (typeof newState === 'undefined') {
                return undefined;
            }
            if (oldState && oldState["onExit"]) {
                machineObj.executeAction(oldState["onExit"]);
            }
            machineObj.currentState = state;
            if (newState["onEntry"]) {
                machineObj.executeAction(newState["onEntry"]);
            }
        };

        return [machineObj.currentState, setState];
    } else {
        return null;
    }
}
