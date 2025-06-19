import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Agent {
  'id' : AgentId,
  'status' : AgentStatus,
  'permissions' : {
    'accessLevel' : { 'Viewer' : null } |
      { 'Editor' : null } |
      { 'Owner' : null },
    'allowedUsers' : Array<UserId>,
    'isPublic' : boolean,
  },
  'created' : Time,
  'configHistory' : Array<AgentConfig>,
  'ownerId' : UserId,
  'name' : string,
  'tags' : Array<string>,
  'description' : string,
  'analytics' : {
    'totalTokensUsed' : bigint,
    'totalMessages' : bigint,
    'averageRating' : [] | [number],
    'totalConversations' : bigint,
  },
  'updated' : Time,
  'category' : string,
  'config' : AgentConfig,
  'lastUsed' : [] | [Time],
}
export interface AgentConfig {
  'personality' : PersonalityConfig,
  'integrationSettings' : {
    'webhooks' : Array<
      { 'url' : string, 'enabled' : boolean, 'events' : Array<string> }
    >,
    'rateLimiting' : {
      'maxTokensPerHour' : bigint,
      'enabled' : boolean,
      'maxRequestsPerHour' : bigint,
    },
    'allowedOrigins' : Array<string>,
  },
  'behavior' : BehaviorConfig,
  'appearance' : AppearanceConfig,
  'version' : VersionId,
  'contextSettings' : {
    'enableLearning' : boolean,
    'memoryDuration' : bigint,
    'maxContextMessages' : bigint,
    'enableMemory' : boolean,
  },
  'knowledgeBase' : Array<KnowledgeSource>,
}
export type AgentId = string;
export type AgentStatus = { 'Inactive' : null } |
  { 'Active' : null } |
  { 'Suspended' : null } |
  { 'Archived' : null };
export interface AppearanceConfig {
  'borderRadius' : string,
  'theme' : { 'Light' : null } |
    { 'Auto' : null } |
    { 'Dark' : null },
  'primaryColor' : string,
  'accentColor' : string,
  'fontFamily' : string,
  'secondaryColor' : string,
  'fontSize' : string,
  'customCSS' : [] | [string],
  'avatar' : [] | [string],
}
export interface BehaviorConfig {
  'responseLength' : { 'Short' : null } |
    { 'Long' : null } |
    { 'Medium' : null } |
    { 'Variable' : null },
  'temperature' : number,
  'topP' : number,
  'contextWindow' : bigint,
  'frequencyPenalty' : number,
  'presencePenalty' : number,
  'systemPromptTemplate' : string,
  'maxTokens' : bigint,
  'creativity' : number,
}
export type ContextId = string;
export interface ContextMessage {
  'content' : string,
  'metadata' : Array<[string, string]>,
  'role' : { 'System' : null } |
    { 'User' : null } |
    { 'Assistant' : null },
  'timestamp' : Time,
  'tokenCount' : [] | [bigint],
}
export interface ConversationContext {
  'created' : Time,
  'contextId' : ContextId,
  'lastAccessed' : Time,
  'messages' : Array<ContextMessage>,
  'metadata' : Array<[string, string]>,
  'userId' : UserId,
  'agentId' : AgentId,
  'compressionEnabled' : boolean,
  'maxSize' : bigint,
}
export interface CreateAgentRequest {
  'name' : string,
  'tags' : Array<string>,
  'description' : string,
  'category' : string,
  'isPublic' : boolean,
  'config' : AgentConfig,
}
export type Error = { 'NotFound' : null } |
  { 'ValidationError' : string } |
  { 'Unauthorized' : null } |
  { 'RateLimitExceeded' : null } |
  { 'ConfigurationError' : string } |
  { 'InternalError' : string } |
  { 'QuotaExceeded' : null };
export interface KnowledgeSource {
  'id' : string,
  'content' : string,
  'metadata' : Array<[string, string]>,
  'lastUpdated' : Time,
  'isActive' : boolean,
  'sourceType' : { 'API' : null } |
    { 'URL' : null } |
    { 'Database' : null } |
    { 'Document' : null } |
    { 'Manual' : null },
  'version' : VersionId,
  'priority' : bigint,
}
export interface PersonalityConfig {
  'traits' : Array<string>,
  'tone' : string,
  'style' : string,
  'communicationStyle' : { 'Creative' : null } |
    { 'Technical' : null } |
    { 'Conversational' : null } |
    { 'Educational' : null } |
    { 'Professional' : null },
  'responsePattern' : { 'Structured' : null } |
    { 'Detailed' : null } |
    { 'Narrative' : null } |
    { 'Concise' : null },
}
export type Result = { 'ok' : null } |
  { 'err' : Error };
export type Result_1 = { 'ok' : VersionId } |
  { 'err' : Error };
export type Result_10 = { 'ok' : Agent } |
  { 'err' : Error };
export type Result_11 = { 'ok' : ContextId } |
  { 'err' : Error };
export type Result_12 = { 'ok' : AgentId } |
  { 'err' : Error };
export type Result_2 = {
    'ok' : {
      'contextId' : ContextId,
      'tokensUsed' : bigint,
      'processingTime' : bigint,
      'response' : string,
      'confidence' : number,
    }
  } |
  { 'err' : Error };
export type Result_3 = { 'ok' : string } |
  { 'err' : string };
export type Result_4 = { 'ok' : Array<Agent> } |
  { 'err' : string };
export type Result_5 = { 'ok' : ConversationContext } |
  { 'err' : Error };
export type Result_6 = { 'ok' : Array<ConversationContext> } |
  { 'err' : Error };
export type Result_7 = { 'ok' : Array<AgentConfig> } |
  { 'err' : Error };
export type Result_8 = { 'ok' : Agent } |
  { 'err' : string };
export type Result_9 = {
    'ok' : {
      'totalTokensUsed' : bigint,
      'totalMessages' : bigint,
      'averageRating' : [] | [number],
      'totalConversations' : bigint,
    }
  } |
  { 'err' : Error };
export type Time = bigint;
export type UserId = Principal;
export interface ValidationResult {
  'errors' : Array<string>,
  'score' : number,
  'warnings' : Array<string>,
  'isValid' : boolean,
}
export type VersionId = bigint;
export interface _SERVICE {
  'addContextMessage' : ActorMethod<
    [
      ContextId,
      { 'System' : null } |
        { 'User' : null } |
        { 'Assistant' : null },
      string,
    ],
    Result
  >,
  'clearAgentContext' : ActorMethod<[AgentId, ContextId], Result>,
  'createAgent' : ActorMethod<[CreateAgentRequest], Result_12>,
  'createAgentAdvanced' : ActorMethod<[CreateAgentRequest], Result_12>,
  'createAgentIntegrated' : ActorMethod<[string, CreateAgentRequest], Result_3>,
  'createAgentWithContextSettings' : ActorMethod<
    [
      CreateAgentRequest,
      {
        'enableLearning' : boolean,
        'memoryDuration' : bigint,
        'maxContextMessages' : bigint,
        'enableMemory' : boolean,
      },
    ],
    Result_12
  >,
  'createConversationContext' : ActorMethod<[AgentId], Result_11>,
  'deleteAgent' : ActorMethod<[AgentId], Result>,
  'getAgent' : ActorMethod<[AgentId], Result_10>,
  'getAgentAnalytics' : ActorMethod<[AgentId], Result_9>,
  'getAgentAuthorized' : ActorMethod<[string, string], Result_8>,
  'getAgentConfigHistory' : ActorMethod<[AgentId], Result_7>,
  'getAgentContexts' : ActorMethod<[AgentId], Result_6>,
  'getConversationContext' : ActorMethod<[ContextId], Result_5>,
  'getUserAgents' : ActorMethod<[UserId], Array<Agent>>,
  'getUserAgentsAuthorized' : ActorMethod<[string], Result_4>,
  'healthCheck' : ActorMethod<
    [],
    { 'status' : string, 'services' : Array<string> }
  >,
  'processAgentChat' : ActorMethod<[string, string, string], Result_3>,
  'processAgentChatAdvanced' : ActorMethod<
    [AgentId, string, [] | [ContextId], [] | [boolean], [] | [number]],
    Result_2
  >,
  'revertAgentConfig' : ActorMethod<[AgentId, VersionId], Result>,
  'test' : ActorMethod<[], string>,
  'updateAgent' : ActorMethod<[AgentId, AgentConfig], Result>,
  'updateAgentAdvanced' : ActorMethod<
    [AgentId, AgentConfig, [] | [string]],
    Result_1
  >,
  'updateAgentAnalytics' : ActorMethod<
    [AgentId, bigint, bigint, bigint],
    Result
  >,
  'updateAgentStatus' : ActorMethod<[AgentId, AgentStatus], Result>,
  'validateAgentConfiguration' : ActorMethod<[AgentConfig], ValidationResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
