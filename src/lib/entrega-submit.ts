/**
 * Guardado de la entrega y reenvío opcional.
 * El webhook no decide el éxito: si falta o falla, la fila ya quedó en Neon.
 */

import {
  entregaWebhookPayload,
  type EntregaWebhookBody,
  type EntregaWrite,
  type StoredEntrega,
} from './entrega-record.ts';

export const ENTREGA_SAVE_ERROR = 'No pudimos despachar tu proyecto. Probá de nuevo en un minuto.';

export interface EntregaDelivery {
  save: (write: EntregaWrite) => Promise<StoredEntrega>;
  webhookUrl: string | undefined;
  post: (url: string, payload: EntregaWebhookBody) => Promise<{ ok: boolean; status: number }>;
  log?: (message: string) => void;
}

export interface EntregaFinish {
  status: number;
  body: Record<string, unknown>;
}

export async function postEntregaWebhook(
  url: string,
  payload: EntregaWebhookBody,
): Promise<{ ok: boolean; status: number }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  return { ok: res.ok, status: res.status };
}

export async function finishEntrega(write: EntregaWrite, deps: EntregaDelivery): Promise<EntregaFinish> {
  const log = deps.log ?? ((message: string) => console.error(message));
  let saved: StoredEntrega;
  try {
    saved = await deps.save(write);
  } catch (err) {
    log(`[entrega] guardar ${err instanceof Error ? err.message : 'error'}`);
    return { status: 503, body: { ok: false, error: ENTREGA_SAVE_ERROR } };
  }

  const webhookUrl = deps.webhookUrl?.trim() ?? '';
  if (webhookUrl !== '') {
    try {
      const response = await deps.post(webhookUrl, entregaWebhookPayload(saved));
      if (!response.ok) log(`[entrega] webhook ${response.status}`);
    } catch (err) {
      log(`[entrega] webhook ${err instanceof Error ? err.message : 'error'}`);
    }
  }

  return { status: 200, body: { ok: true, hackerId: saved.hackerId, at: saved.updatedAt } };
}
