import { MetaMask } from '../meta_mask';
import { AppManager } from '../app_manager';
import { ReplyEntity } from '../entity/entities';
import { makeReplyContainer } from '../reply';

let lock: Map<string, boolean> = new Map();

export async function publishReply(
  event: Event,
  thoughtID: string,
  metaMask: MetaMask,
  appManager: AppManager
): Promise<void> {
  if (!(event.target instanceof Element)) {
    return;
  }

  if (lock.get(thoughtID)) {
    return;
  }

  const text = document.getElementById(`new-reply-text-${thoughtID}`)!.textContent!;
  const displayName = document.getElementById(`new-reply-author-${thoughtID}`)!.textContent!;

  lock.set(thoughtID, true);
  event.target.textContent = '🕑';

  const newReply = await metaMask.newReply(text, displayName, thoughtID, 0);

  if (!newReply) {
    lock.set(thoughtID, false);
    event.target.textContent = '📧';
    return;
  }

  const r = new ReplyEntity({
    id: newReply.value,
    sender: newReply.sender,
    text: text,
    displayName: displayName,
    blockTimestamp: newReply.blockTimestamp,
    numLikes: 0,
    numRetweets: 0,
    seq_num: 0,
    tweet: thoughtID
  });

  appManager.entityStore.replies.set(newReply.value, r);

  const container = makeReplyContainer(r, true, appManager, true);

  const allReplies = document.getElementById(`replies-${thoughtID}`)!;
  const newReplyElement = document.getElementById(`new-reply-${thoughtID}`)!;
  allReplies.insertBefore(container, newReplyElement);
  newReplyElement.style.display = 'none';

  appManager.queryDispatcher.invalidateCache();

  lock.set(thoughtID, false);
  event.target.textContent = '📧';
}