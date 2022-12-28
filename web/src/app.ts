import { Thought, Reply } from './responses';
import { makeReplyContainer } from './reply';
import { makeThoughtContainer } from './thought';
import { AppManager } from './app_manager';
import { parseCurrentURL } from './params';
import { allRecentThoughts, thoughtByID, replyByID, thoughtsByHashtag } from './queries';
import { ThoughtEntity, ReplyEntity } from './entity/entities';
import { ThoughtParams, ReplyParams } from './params';
import { init } from './handlers/init';

const appManager = new AppManager();

init(appManager);

const params = parseCurrentURL();

if (params instanceof ThoughtParams) {
  let query: string;

  if (params.thoughtID) {
    query = thoughtByID(params.thoughtID);
  } else if (params.hashtag) {
    query = thoughtsByHashtag(params.hashtag);
  } else {
    query = allRecentThoughts;
  }

  const thoughts = (await appManager.queryDispatcher.fetch(query))['newTweets'] as Thought[];

  const entities = thoughts.map((t) => {
    const entity = new ThoughtEntity(t);
    appManager.entityStore.thoughts.set(t.id, entity);
    return entity;
  });

  const thoughtsContainer = document.getElementById('thoughts-container');

  entities.forEach((t) => {
    thoughtsContainer!.appendChild(makeThoughtContainer(t, appManager));
  });
} else if (params instanceof ReplyParams) {
  const query = replyByID(params.replyID);
  const fetchedReplies = (await appManager.queryDispatcher.fetch(query))['newReplies'] as Reply[];
  const entities = fetchedReplies.map((r) => {
    const entity = new ReplyEntity(r);
    appManager.entityStore.replies.set(r.id, entity);
    return entity;
  });

  const thoughtsContainer = document.getElementById('thoughts-container');

  entities
    .map((reply) => {
      return makeReplyContainer(reply, true, appManager, true);
    })
    .forEach((reply) => {
      thoughtsContainer!.appendChild(reply);
    });
}

export {};
