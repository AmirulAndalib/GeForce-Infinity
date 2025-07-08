import { ipcMain } from 'electron';
import rpc from 'discord-rpc';

let rpcClient: rpc.Client | undefined;

interface RpcHandlersContext {
  clientId: string;
  updateActivity: (gameTitle: string | null) => void;
  saveConfig: (updates: Partial<{
    autofocus: boolean;
    notify: boolean;
    rpcEnabled: boolean;
    informed: boolean;
  }>) => void;
}

export function registerRpcHandlers({
  clientId,
  updateActivity,
  saveConfig,
}: RpcHandlersContext) {
  ipcMain.handle('rpc-toggle', async (_e, enable: boolean) => {
    saveConfig({ rpcEnabled: enable });

    if (enable) {
      rpcClient = new rpc.Client({ transport: 'ipc' });

      try {
        await rpcClient.login({ clientId });
        rpcClient.on('ready', () => updateActivity(null));
      } catch (e) {
        console.error('RPC login error:', e);
      }
    } else {
      try {
        if (rpcClient) {
          await rpcClient.clearActivity();
          await rpcClient.destroy();
          rpcClient = undefined;
        }
      } catch (e) {
        console.error('RPC logout error:', e);
      }
    }
  });
}
