import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AgentId = string;
export type Error = { 'InvalidUsage' : null } |
  { 'InsufficientBalance' : null } |
  { 'InternalError' : string } |
  { 'UserNotFound' : null };
export type FeatureType = { 'AdvancedPrompts' : null } |
  { 'ChainFusion' : null } |
  { 'BasicChat' : null } |
  { 'DocumentIntegration' : null };
export type OperationType = { 'AgentCreation' : null } |
  { 'CustomPromptTraining' : null } |
  { 'AddBalance' : null } |
  { 'DocumentUpload' : null } |
  { 'MessageProcessing' : FeatureType };
export type PricingTier = { 'Enterprise' : null } |
  { 'Base' : null } |
  { 'Professional' : null } |
  { 'Standard' : null };
export type Result = { 'ok' : UsageId } |
  { 'err' : Error };
export type Result_1 = { 'ok' : UserBalance } |
  { 'err' : Error };
export type Result_2 = { 'ok' : null } |
  { 'err' : Error };
export type Time = bigint;
export type UsageId = string;
export interface UsageRecord {
  'id' : UsageId,
  'cost' : number,
  'userId' : UserId,
  'agentId' : AgentId,
  'tokens' : bigint,
  'operation' : OperationType,
  'timestamp' : Time,
}
export interface UserBalance {
  'balance' : number,
  'userId' : UserId,
  'lastUpdated' : Time,
  'monthlyUsage' : bigint,
  'currentTier' : PricingTier,
}
export type UserId = Principal;
export interface _SERVICE {
  'addBalance' : ActorMethod<[UserId, number], Result_2>,
  'getUsageHistory' : ActorMethod<[UserId, [] | [bigint]], Array<UsageRecord>>,
  'getUserBalance' : ActorMethod<[UserId], Result_1>,
  'healthCheck' : ActorMethod<
    [],
    { 'status' : string, 'totalUsers' : bigint, 'totalTransactions' : bigint }
  >,
  'recordUsage' : ActorMethod<[UserId, AgentId, bigint, OperationType], Result>,
  'test' : ActorMethod<[], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
