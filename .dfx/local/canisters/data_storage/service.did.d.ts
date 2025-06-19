import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AgentId = string;
export interface Conversation {
  'id' : ConversationId,
  'status' : ConversationStatus,
  'created' : Time,
  'agentId' : AgentId,
  'participantId' : [] | [string],
  'updated' : Time,
  'sessionId' : SessionId,
}
export type ConversationId = string;
export type ConversationStatus = { 'Active' : null } |
  { 'Archived' : null } |
  { 'Completed' : null };
export type Error = { 'NotFound' : null } |
  { 'ValidationError' : string } |
  { 'Unauthorized' : null } |
  { 'StorageError' : string };
export interface Message {
  'id' : MessageId,
  'content' : string,
  'metadata' : Array<[string, string]>,
  'role' : MessageRole,
  'conversationId' : ConversationId,
  'tokens' : bigint,
  'timestamp' : Time,
}
export type MessageId = string;
export type MessageRole = { 'System' : null } |
  { 'User' : null } |
  { 'Agent' : null };
export type Result = { 'ok' : null } |
  { 'err' : Error };
export type Result_1 = { 'ok' : MessageId } |
  { 'err' : Error };
export type Result_2 = { 'ok' : Array<Message> } |
  { 'err' : Error };
export type Result_3 = { 'ok' : Conversation } |
  { 'err' : Error };
export type Result_4 = { 'ok' : ConversationId } |
  { 'err' : Error };
export type SessionId = string;
export type Time = bigint;
export interface _SERVICE {
  'createConversation' : ActorMethod<
    [AgentId, SessionId, [] | [string]],
    Result_4
  >,
  'getAgentConversations' : ActorMethod<
    [AgentId, [] | [bigint]],
    Array<Conversation>
  >,
  'getConversation' : ActorMethod<[ConversationId], Result_3>,
  'getConversationMessages' : ActorMethod<[ConversationId], Result_2>,
  'healthCheck' : ActorMethod<
    [],
    {
      'status' : string,
      'totalMessages' : bigint,
      'totalConversations' : bigint,
    }
  >,
  'storeMessage' : ActorMethod<
    [ConversationId, MessageRole, string, bigint, Array<[string, string]>],
    Result_1
  >,
  'test' : ActorMethod<[], string>,
  'updateConversationStatus' : ActorMethod<
    [ConversationId, ConversationStatus],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
