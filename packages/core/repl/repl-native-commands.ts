import type { REPLServer } from 'repl';

/**
 * Displays a list of available commands in the REPL alongside with their
 * descriptions.
 * (c) This code was inspired by the 'help' command from Node.js core:
 * {@link https://github.com/nodejs/node/blob/58b60c1393dd65cd228a8b0084a19acd2c1d16aa/lib/repl.js#L1741-L1759}
 */
function listAllCommands(replServer: REPLServer) {
    throw new Error("STUB");
}

export function defineDefaultCommandsOnRepl(replServer: REPLServer): void {
    throw new Error("STUB");
}
