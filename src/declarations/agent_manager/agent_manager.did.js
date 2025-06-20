export const idlFactory = ({ IDL }) => {
  const ContextId = IDL.Text;
  const Error = IDL.Variant({
    'NotFound' : IDL.Null,
    'ValidationError' : IDL.Text,
    'Unauthorized' : IDL.Null,
    'RateLimitExceeded' : IDL.Null,
    'ConfigurationError' : IDL.Text,
    'InternalError' : IDL.Text,
    'QuotaExceeded' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const AgentId = IDL.Text;
  const PersonalityConfig = IDL.Record({
    'traits' : IDL.Vec(IDL.Text),
    'tone' : IDL.Text,
    'style' : IDL.Text,
    'communicationStyle' : IDL.Variant({
      'Creative' : IDL.Null,
      'Technical' : IDL.Null,
      'Conversational' : IDL.Null,
      'Educational' : IDL.Null,
      'Professional' : IDL.Null,
    }),
    'responsePattern' : IDL.Variant({
      'Structured' : IDL.Null,
      'Detailed' : IDL.Null,
      'Narrative' : IDL.Null,
      'Concise' : IDL.Null,
    }),
  });
  const BehaviorConfig = IDL.Record({
    'responseLength' : IDL.Variant({
      'Short' : IDL.Null,
      'Long' : IDL.Null,
      'Medium' : IDL.Null,
      'Variable' : IDL.Null,
    }),
    'temperature' : IDL.Float64,
    'topP' : IDL.Float64,
    'contextWindow' : IDL.Nat,
    'frequencyPenalty' : IDL.Float64,
    'presencePenalty' : IDL.Float64,
    'systemPromptTemplate' : IDL.Text,
    'maxTokens' : IDL.Nat,
    'creativity' : IDL.Float64,
  });
  const AppearanceConfig = IDL.Record({
    'borderRadius' : IDL.Text,
    'theme' : IDL.Variant({
      'Light' : IDL.Null,
      'Auto' : IDL.Null,
      'Dark' : IDL.Null,
    }),
    'primaryColor' : IDL.Text,
    'accentColor' : IDL.Text,
    'fontFamily' : IDL.Text,
    'secondaryColor' : IDL.Text,
    'fontSize' : IDL.Text,
    'customCSS' : IDL.Opt(IDL.Text),
    'avatar' : IDL.Opt(IDL.Text),
  });
  const VersionId = IDL.Nat;
  const Time = IDL.Int;
  const KnowledgeSource = IDL.Record({
    'id' : IDL.Text,
    'content' : IDL.Text,
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'lastUpdated' : Time,
    'isActive' : IDL.Bool,
    'sourceType' : IDL.Variant({
      'API' : IDL.Null,
      'URL' : IDL.Null,
      'Database' : IDL.Null,
      'Document' : IDL.Null,
      'Manual' : IDL.Null,
    }),
    'version' : VersionId,
    'priority' : IDL.Nat,
  });
  const AgentConfig = IDL.Record({
    'personality' : PersonalityConfig,
    'integrationSettings' : IDL.Record({
      'webhooks' : IDL.Vec(
        IDL.Record({
          'url' : IDL.Text,
          'enabled' : IDL.Bool,
          'events' : IDL.Vec(IDL.Text),
        })
      ),
      'rateLimiting' : IDL.Record({
        'maxTokensPerHour' : IDL.Nat,
        'enabled' : IDL.Bool,
        'maxRequestsPerHour' : IDL.Nat,
      }),
      'allowedOrigins' : IDL.Vec(IDL.Text),
    }),
    'behavior' : BehaviorConfig,
    'appearance' : AppearanceConfig,
    'version' : VersionId,
    'contextSettings' : IDL.Record({
      'enableLearning' : IDL.Bool,
      'memoryDuration' : IDL.Nat,
      'maxContextMessages' : IDL.Nat,
      'enableMemory' : IDL.Bool,
    }),
    'knowledgeBase' : IDL.Vec(KnowledgeSource),
  });
  const CreateAgentRequest = IDL.Record({
    'name' : IDL.Text,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'category' : IDL.Text,
    'isPublic' : IDL.Bool,
    'config' : AgentConfig,
  });
  const Result_12 = IDL.Variant({ 'ok' : AgentId, 'err' : Error });
  const Result_3 = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  const Result_11 = IDL.Variant({ 'ok' : ContextId, 'err' : Error });
  const AgentStatus = IDL.Variant({
    'Inactive' : IDL.Null,
    'Active' : IDL.Null,
    'Suspended' : IDL.Null,
    'Archived' : IDL.Null,
  });
  const UserId = IDL.Principal;
  const Agent = IDL.Record({
    'id' : AgentId,
    'status' : AgentStatus,
    'permissions' : IDL.Record({
      'accessLevel' : IDL.Variant({
        'Viewer' : IDL.Null,
        'Editor' : IDL.Null,
        'Owner' : IDL.Null,
      }),
      'allowedUsers' : IDL.Vec(UserId),
      'isPublic' : IDL.Bool,
    }),
    'created' : Time,
    'configHistory' : IDL.Vec(AgentConfig),
    'ownerId' : UserId,
    'name' : IDL.Text,
    'tags' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'analytics' : IDL.Record({
      'totalTokensUsed' : IDL.Nat,
      'totalMessages' : IDL.Nat,
      'averageRating' : IDL.Opt(IDL.Float64),
      'totalConversations' : IDL.Nat,
    }),
    'updated' : Time,
    'category' : IDL.Text,
    'config' : AgentConfig,
    'lastUsed' : IDL.Opt(Time),
  });
  const Result_10 = IDL.Variant({ 'ok' : Agent, 'err' : Error });
  const Result_9 = IDL.Variant({
    'ok' : IDL.Record({
      'totalTokensUsed' : IDL.Nat,
      'totalMessages' : IDL.Nat,
      'averageRating' : IDL.Opt(IDL.Float64),
      'totalConversations' : IDL.Nat,
    }),
    'err' : Error,
  });
  const Result_8 = IDL.Variant({ 'ok' : Agent, 'err' : IDL.Text });
  const Result_7 = IDL.Variant({ 'ok' : IDL.Vec(AgentConfig), 'err' : Error });
  const ContextMessage = IDL.Record({
    'content' : IDL.Text,
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'role' : IDL.Variant({
      'System' : IDL.Null,
      'User' : IDL.Null,
      'Assistant' : IDL.Null,
    }),
    'timestamp' : Time,
    'tokenCount' : IDL.Opt(IDL.Nat),
  });
  const ConversationContext = IDL.Record({
    'created' : Time,
    'contextId' : ContextId,
    'lastAccessed' : Time,
    'messages' : IDL.Vec(ContextMessage),
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'userId' : UserId,
    'agentId' : AgentId,
    'compressionEnabled' : IDL.Bool,
    'maxSize' : IDL.Nat,
  });
  const Result_6 = IDL.Variant({
    'ok' : IDL.Vec(ConversationContext),
    'err' : Error,
  });
  const Result_5 = IDL.Variant({ 'ok' : ConversationContext, 'err' : Error });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Vec(Agent), 'err' : IDL.Text });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Record({
      'contextId' : ContextId,
      'tokensUsed' : IDL.Nat,
      'processingTime' : IDL.Nat,
      'response' : IDL.Text,
      'confidence' : IDL.Float64,
    }),
    'err' : Error,
  });
  const Result_1 = IDL.Variant({ 'ok' : VersionId, 'err' : Error });
  const ValidationResult = IDL.Record({
    'errors' : IDL.Vec(IDL.Text),
    'score' : IDL.Float64,
    'warnings' : IDL.Vec(IDL.Text),
    'isValid' : IDL.Bool,
  });
  return IDL.Service({
    'addContextMessage' : IDL.Func(
        [
          ContextId,
          IDL.Variant({
            'System' : IDL.Null,
            'User' : IDL.Null,
            'Assistant' : IDL.Null,
          }),
          IDL.Text,
        ],
        [Result],
        [],
      ),
    'clearAgentContext' : IDL.Func([AgentId, ContextId], [Result], []),
    'createAgent' : IDL.Func([CreateAgentRequest], [Result_12], []),
    'createAgentAdvanced' : IDL.Func([CreateAgentRequest], [Result_12], []),
    'createAgentIntegrated' : IDL.Func(
        [IDL.Text, CreateAgentRequest],
        [Result_3],
        [],
      ),
    'createAgentWithContextSettings' : IDL.Func(
        [
          CreateAgentRequest,
          IDL.Record({
            'enableLearning' : IDL.Bool,
            'memoryDuration' : IDL.Nat,
            'maxContextMessages' : IDL.Nat,
            'enableMemory' : IDL.Bool,
          }),
        ],
        [Result_12],
        [],
      ),
    'createConversationContext' : IDL.Func([AgentId], [Result_11], []),
    'deleteAgent' : IDL.Func([AgentId], [Result], []),
    'getAgent' : IDL.Func([AgentId], [Result_10], ['query']),
    'getAgentAnalytics' : IDL.Func([AgentId], [Result_9], ['query']),
    'getAgentAuthorized' : IDL.Func([IDL.Text, IDL.Text], [Result_8], []),
    'getAgentConfigHistory' : IDL.Func([AgentId], [Result_7], ['query']),
    'getAgentContexts' : IDL.Func([AgentId], [Result_6], []),
    'getConversationContext' : IDL.Func([ContextId], [Result_5], ['query']),
    'getUserAgents' : IDL.Func([UserId], [IDL.Vec(Agent)], ['query']),
    'getUserAgentsAuthorized' : IDL.Func([IDL.Text], [Result_4], []),
    'healthCheck' : IDL.Func(
        [],
        [IDL.Record({ 'status' : IDL.Text, 'services' : IDL.Vec(IDL.Text) })],
        [],
      ),
    'processAgentChat' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result_3],
        [],
      ),
    'processAgentChatAdvanced' : IDL.Func(
        [
          AgentId,
          IDL.Text,
          IDL.Opt(ContextId),
          IDL.Opt(IDL.Bool),
          IDL.Opt(IDL.Float64),
        ],
        [Result_2],
        [],
      ),
    'revertAgentConfig' : IDL.Func([AgentId, VersionId], [Result], []),
    'test' : IDL.Func([], [IDL.Text], []),
    'updateAgent' : IDL.Func([AgentId, AgentConfig], [Result], []),
    'updateAgentAdvanced' : IDL.Func(
        [AgentId, AgentConfig, IDL.Opt(IDL.Text)],
        [Result_1],
        [],
      ),
    'updateAgentAnalytics' : IDL.Func(
        [AgentId, IDL.Nat, IDL.Nat, IDL.Nat],
        [Result],
        [],
      ),
    'updateAgentStatus' : IDL.Func([AgentId, AgentStatus], [Result], []),
    'validateAgentConfiguration' : IDL.Func(
        [AgentConfig],
        [ValidationResult],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
