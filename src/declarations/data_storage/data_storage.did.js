export const idlFactory = ({ IDL }) => {
  const AgentId = IDL.Text;
  const SessionId = IDL.Text;
  const ConversationId = IDL.Text;
  const Error = IDL.Variant({
    'NotFound' : IDL.Null,
    'ValidationError' : IDL.Text,
    'Unauthorized' : IDL.Null,
    'StorageError' : IDL.Text,
  });
  const Result_4 = IDL.Variant({ 'ok' : ConversationId, 'err' : Error });
  const ConversationStatus = IDL.Variant({
    'Active' : IDL.Null,
    'Archived' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const Time = IDL.Int;
  const Conversation = IDL.Record({
    'id' : ConversationId,
    'status' : ConversationStatus,
    'created' : Time,
    'agentId' : AgentId,
    'participantId' : IDL.Opt(IDL.Text),
    'updated' : Time,
    'sessionId' : SessionId,
  });
  const Result_3 = IDL.Variant({ 'ok' : Conversation, 'err' : Error });
  const MessageId = IDL.Text;
  const MessageRole = IDL.Variant({
    'System' : IDL.Null,
    'User' : IDL.Null,
    'Agent' : IDL.Null,
  });
  const Message = IDL.Record({
    'id' : MessageId,
    'content' : IDL.Text,
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'role' : MessageRole,
    'conversationId' : ConversationId,
    'tokens' : IDL.Nat,
    'timestamp' : Time,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Vec(Message), 'err' : Error });
  const Result_1 = IDL.Variant({ 'ok' : MessageId, 'err' : Error });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  return IDL.Service({
    'createConversation' : IDL.Func(
        [AgentId, SessionId, IDL.Opt(IDL.Text)],
        [Result_4],
        [],
      ),
    'getAgentConversations' : IDL.Func(
        [AgentId, IDL.Opt(IDL.Nat)],
        [IDL.Vec(Conversation)],
        ['query'],
      ),
    'getConversation' : IDL.Func([ConversationId], [Result_3], ['query']),
    'getConversationMessages' : IDL.Func(
        [ConversationId],
        [Result_2],
        ['query'],
      ),
    'healthCheck' : IDL.Func(
        [],
        [
          IDL.Record({
            'status' : IDL.Text,
            'totalMessages' : IDL.Nat,
            'totalConversations' : IDL.Nat,
          }),
        ],
        [],
      ),
    'storeMessage' : IDL.Func(
        [
          ConversationId,
          MessageRole,
          IDL.Text,
          IDL.Nat,
          IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
        ],
        [Result_1],
        [],
      ),
    'test' : IDL.Func([], [IDL.Text], []),
    'updateConversationStatus' : IDL.Func(
        [ConversationId, ConversationStatus],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
