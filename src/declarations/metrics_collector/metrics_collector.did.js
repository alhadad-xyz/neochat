export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const Error = IDL.Variant({
    'InvalidUsage' : IDL.Null,
    'InsufficientBalance' : IDL.Null,
    'InternalError' : IDL.Text,
    'UserNotFound' : IDL.Null,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const UsageId = IDL.Text;
  const AgentId = IDL.Text;
  const FeatureType = IDL.Variant({
    'AdvancedPrompts' : IDL.Null,
    'ChainFusion' : IDL.Null,
    'BasicChat' : IDL.Null,
    'DocumentIntegration' : IDL.Null,
  });
  const OperationType = IDL.Variant({
    'AgentCreation' : IDL.Null,
    'CustomPromptTraining' : IDL.Null,
    'AddBalance' : IDL.Null,
    'DocumentUpload' : IDL.Null,
    'MessageProcessing' : FeatureType,
  });
  const Time = IDL.Int;
  const UsageRecord = IDL.Record({
    'id' : UsageId,
    'cost' : IDL.Float64,
    'userId' : UserId,
    'agentId' : AgentId,
    'tokens' : IDL.Nat,
    'operation' : OperationType,
    'timestamp' : Time,
  });
  const PricingTier = IDL.Variant({
    'Enterprise' : IDL.Null,
    'Base' : IDL.Null,
    'Professional' : IDL.Null,
    'Standard' : IDL.Null,
  });
  const UserBalance = IDL.Record({
    'balance' : IDL.Float64,
    'userId' : UserId,
    'lastUpdated' : Time,
    'monthlyUsage' : IDL.Nat,
    'currentTier' : PricingTier,
  });
  const Result_1 = IDL.Variant({ 'ok' : UserBalance, 'err' : Error });
  const Result = IDL.Variant({ 'ok' : UsageId, 'err' : Error });
  return IDL.Service({
    'addBalance' : IDL.Func([UserId, IDL.Float64], [Result_2], []),
    'getUsageHistory' : IDL.Func(
        [UserId, IDL.Opt(IDL.Nat)],
        [IDL.Vec(UsageRecord)],
        ['query'],
      ),
    'getUserBalance' : IDL.Func([UserId], [Result_1], ['query']),
    'healthCheck' : IDL.Func(
        [],
        [
          IDL.Record({
            'status' : IDL.Text,
            'totalUsers' : IDL.Nat,
            'totalTransactions' : IDL.Nat,
          }),
        ],
        [],
      ),
    'recordUsage' : IDL.Func(
        [UserId, AgentId, IDL.Nat, OperationType],
        [Result],
        [],
      ),
    'test' : IDL.Func([], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
