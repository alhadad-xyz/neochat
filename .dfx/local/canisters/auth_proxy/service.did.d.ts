import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Error = { 'Unauthorized' : null } |
  { 'InternalError' : string } |
  { 'SessionExpired' : null } |
  { 'InvalidSession' : null };
export type Result = { 'ok' : UserId } |
  { 'err' : Error };
export type Result_1 = { 'ok' : null } |
  { 'err' : Error };
export type Result_2 = { 'ok' : SessionId } |
  { 'err' : Error };
export type SessionId = string;
export type UserId = Principal;
export interface _SERVICE {
  'createSession' : ActorMethod<[], Result_2>,
  'healthCheck' : ActorMethod<
    [],
    { 'status' : string, 'activeSessions' : bigint }
  >,
  'refreshSession' : ActorMethod<[SessionId], Result_1>,
  'revokeSession' : ActorMethod<[SessionId], Result_1>,
  'test' : ActorMethod<[], string>,
  'validateSession' : ActorMethod<[SessionId], Result>,
  'whoami' : ActorMethod<[], Principal>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
