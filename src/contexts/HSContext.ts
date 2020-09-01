/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import { string, object, union, literal, TypeOf } from 'zod';

import { persistReducer } from '../utils/localStorage';

//import { prefixFetch, Client, discoverServer } from 'matrix-cypher';

enum HSOptions {
    // The homeserver contact policy hasn't
    // been set yet.
    Unset = 'UNSET',
    // Matrix.to should only contact a single provided homeserver
    TrustedClientOnly = 'TRUSTED_CLIENT_ONLY',
    // Matrix.to may contact any homeserver it requires
    Any = 'ANY',
    // Matrix.to may not contact any homeservers
    None = 'NONE',
}

const STATE_SCHEMA = union([
    object({
        option: literal(HSOptions.Unset),
    }),
    object({
        option: literal(HSOptions.None),
    }),
    object({
        option: literal(HSOptions.Any),
    }),
    object({
        option: literal(HSOptions.TrustedClientOnly),
        hs: string(),
    }),
]);

type State = TypeOf<typeof STATE_SCHEMA>;

// TODO: rename actions to something with more meaning out of context
export enum ActionTypes {
    SetHS = 'SET_HS',
    SetAny = 'SET_ANY',
    SetNone = 'SET_NONE',
}

export interface SetHS {
    action: ActionTypes.SetHS;
    HSURL: string;
}

export interface SetAny {
    action: ActionTypes.SetAny;
}

export interface SetNone {
    action: ActionTypes.SetNone;
}

export type Action = SetHS | SetAny | SetNone;

export const INITIAL_STATE: State = {
    option: HSOptions.Unset,
};

export const [initialState, reducer] = persistReducer(
    'home-server-options',
    INITIAL_STATE,
    STATE_SCHEMA,
    (state: State, action: Action): State => {
        switch (action.action) {
            case ActionTypes.SetNone:
                return {
                    option: HSOptions.None,
                };
            case ActionTypes.SetAny:
                return {
                    option: HSOptions.Any,
                };
            case ActionTypes.SetHS:
                return {
                    option: HSOptions.TrustedClientOnly,
                    hs: action.HSURL,
                };
            default:
                return state;
        }
    }
);

// The defualt reducer needs to be overwritten with the one above
// after it's been put through react's useReducer
const { Provider, Consumer } = React.createContext<
    [State, React.Dispatch<Action>]
>([initialState, (): void => {}]);

// Quick rename to make importing easier
export const HSProvider = Provider;
export const HSConsumer = Consumer;
