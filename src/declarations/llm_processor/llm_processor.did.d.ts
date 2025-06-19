import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AgentId = string;
export type ConversationId = string;
export type Error = { 'InvalidInput' : string } |
  { 'ProcessingError' : string } |
  { 'ServiceUnavailable' : null } |
  { 'RateLimited' : null };
export interface Message {
  'id' : MessageId,
  'content' : string,
  'metadata' : Array<[string, string]>,
  'role' : { 'System' : null } |
    { 'User' : null } |
    { 'Agent' : null },
  'tokens' : bigint,
  'timestamp' : Time,
}
export type MessageId = string;
export interface ProcessMessageRequest {
  'context' : [] | [Array<Message>],
  'temperature' : [] | [number],
  'userMessage' : string,
  'agentId' : AgentId,
  'conversationId' : ConversationId,
  'systemPrompt' : [] | [string],
  'enableStreaming' : [] | [boolean],
  'maxTokens' : [] | [bigint],
  'agentPersonality' : [] | [string],
  'routingStrategy' : [] | [string],
}
export interface ProcessMessageResponse {
  'messageId' : MessageId,
  'metadata' : Array<[string, string]>,
  'agentResponse' : string,
  'processingTime' : bigint,
  'tokens' : bigint,
  'modelUsed' : string,
  'cached' : boolean,
  'confidence' : number,
  'providerId' : string,
}
export type Result = { 'ok' : string } |
  { 'err' : Error };
export type Result_1 = { 'ok' : ProcessMessageResponse } |
  { 'err' : Error };
export type Time = bigint;
export interface _SERVICE {
  'getProcessorStatus' : ActorMethod<
    [],
    { 'provider' : string, 'healthy' : boolean, 'version' : string }
  >,
  'healthCheck' : ActorMethod<
    [],
    { 'status' : string, 'providers' : bigint, 'activeProviders' : bigint }
  >,
  'processMessage' : ActorMethod<[ProcessMessageRequest], Result_1>,
  'processPrompt' : ActorMethod<[string], Result>,
  'processWithLLM' : ActorMethod<[string], Result>,
  'test' : ActorMethod<[], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
