import { Topic } from "@/lib/types/exam";
import {
  MASTER_TOPICS_BY_SUBJECT,
  getTopicsForSubject,
  getTopicById,
  getAllTopics,
} from "@/lib/data/topicRegistry";

export const MOCK_TOPICS: Topic[] = getAllTopics();

export { getTopicsForSubject, getTopicById, getAllTopics, MASTER_TOPICS_BY_SUBJECT };
