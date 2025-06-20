export const idlFactory = ({ IDL }) => {
  const SessionId = IDL.Text;
  const Error = IDL.Variant({
    'Unauthorized' : IDL.Null,
    'InternalError' : IDL.Text,
    'SessionExpired' : IDL.Null,
    'InvalidSession' : IDL.Null,
  });
  const Result_2 = IDL.Variant({ 'ok' : SessionId, 'err' : Error });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const UserId = IDL.Principal;
  const Result = IDL.Variant({ 'ok' : UserId, 'err' : Error });
  return IDL.Service({
    'createSession' : IDL.Func([], [Result_2], []),
    'healthCheck' : IDL.Func(
        [],
        [IDL.Record({ 'status' : IDL.Text, 'activeSessions' : IDL.Nat })],
        [],
      ),
    'refreshSession' : IDL.Func([SessionId], [Result_1], []),
    'revokeSession' : IDL.Func([SessionId], [Result_1], []),
    'test' : IDL.Func([], [IDL.Text], []),
    'validateSession' : IDL.Func([SessionId], [Result], ['query']),
    'whoami' : IDL.Func([], [IDL.Principal], []),
  });
};
export const init = ({ IDL }) => { return []; };
