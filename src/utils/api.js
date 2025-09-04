const BASE_URL = 'https://toeic-api.openlearnhub.io.vn/api/v1';

async function http(method, path, body) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function fetchTopics() {
  const json = await http('GET', '/topics');
  return json?.data?.data ?? [];
}

export async function fetchVocabulariesByTopic(topicId) {
  const payload = {
    topic_ids: [Number(topicId)],
    level_ids: [],
    page: 1,
    size: 10,
    sort: 'default',
    keyword: '',
  };
  const json = await http('POST', '/vocabularies/filter', payload);
  return json?.data?.data ?? [];
}

export async function filterVocabularies({ topicId, page = 1, size = 10, keyword = '', sort = 'default', levelIds = [] } = {}) {
  const payload = {
    topic_ids: topicId != null ? [Number(topicId)] : [],
    level_ids: levelIds,
    page: Number(page) || 1,
    size: Number(size) || 10,
    sort,
    keyword: String(keyword || ''),
  };
  const json = await http('POST', '/vocabularies/filter', payload);
  // Prefer returning both list and any pagination metadata if present
  const dataNode = json?.data;
  const list = dataNode?.data ?? [];
  const total = dataNode?.total ?? dataNode?.pagination?.total ?? undefined;
  const totalPages = dataNode?.total_pages ?? dataNode?.pagination?.total_pages ?? undefined;
  return { list, total, totalPages };
} 