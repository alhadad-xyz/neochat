export const idlFactory = ({ IDL }) => {
  const MessageId = IDL.Text;
  const Time = IDL.Int;
  const Message = IDL.Record({
    'id' : MessageId,
    'content' : IDL.Text,
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'role' : IDL.Variant({
      'System' : IDL.Null,
      'User' : IDL.Null,
      'Agent' : IDL.Null,
    }),
    'tokens' : IDL.Nat,
    'timestamp' : Time,
  });
  const AgentId = IDL.Text;
  const ConversationId = IDL.Text;
  const ProcessMessageRequest = IDL.Record({
    'context' : IDL.Opt(IDL.Vec(Message)),
    'temperature' : IDL.Opt(IDL.Float64),
    'userMessage' : IDL.Text,
    'agentId' : AgentId,
    'conversationId' : ConversationId,
    'systemPrompt' : IDL.Opt(IDL.Text),
    'enableStreaming' : IDL.Opt(IDL.Bool),
    'maxTokens' : IDL.Opt(IDL.Nat),
    'agentPersonality' : IDL.Opt(IDL.Text),
    'routingStrategy' : IDL.Opt(IDL.Text),
  });
  const ProcessMessageResponse = IDL.Record({
    'messageId' : MessageId,
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'agentResponse' : IDL.Text,
    'processingTime' : IDL.Nat,
    'tokens' : IDL.Nat,
    'modelUsed' : IDL.Text,
    'cached' : IDL.Bool,
    'confidence' : IDL.Float64,
    'providerId' : IDL.Text,
  });
  const Error = IDL.Variant({
    'InvalidInput' : IDL.Text,
    'ProcessingError' : IDL.Text,
    'ServiceUnavailable' : IDL.Null,
    'RateLimited' : IDL.Null,
  });
  const Result_1 = IDL.Variant({
    'ok' : ProcessMessageResponse,
    'err' : Error,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : Error });
  return IDL.Service({
    'getProcessorStatus' : IDL.Func(
        [],
        [
          IDL.Record({
            'provider' : IDL.Text,
            'healthy' : IDL.Bool,
            'version' : IDL.Text,
          }),
        ],
        ['query'],
      ),
    'healthCheck' : IDL.Func(
        [],
        [
          IDL.Record({
            'status' : IDL.Text,
            'providers' : IDL.Nat,
            'activeProviders' : IDL.Nat,
          }),
        ],
        [],
      ),
    'processMessage' : IDL.Func([ProcessMessageRequest], [Result_1], []),
    'processPrompt' : IDL.Func([IDL.Text], [Result], []),
    'processWithLLM' : IDL.Func([IDL.Text], [Result], []),
    'test' : IDL.Func([], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
