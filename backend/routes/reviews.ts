import { send, readBody, methodNotAllowed, serverError } from '../lib/http.js';
import { sbGetSetting, sbSetSetting } from '../lib/sb.js';

/**
 * GET  /api/reviews                      -> { success, reviews, count }
 * POST /api/reviews                      -> batch save / add / toggle / update / delete / reset
 *
 * Reviews live in site_settings under the `customer_reviews` key so the CMS and
 * the public review wall always read the same array.
 */
const REVIEW_KEY = 'customer_reviews';

async function loadReviews(): Promise<any[]> {
  const { data } = await sbGetSetting(REVIEW_KEY);
  const value = data?.[0]?.value;
  return Array.isArray(value) ? value : [];
}

async function saveReviews(reviews: any[]): Promise<void> {
  const { error } = await sbSetSetting(REVIEW_KEY, reviews);
  if (error) throw new Error(error.message);
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const reviews = await loadReviews();
      send(res, 200, { success: true, reviews, count: reviews.length, updatedAt: new Date().toISOString() });
      return;
    }

    if (req.method !== 'POST') {
      methodNotAllowed(res, ['GET', 'POST']);
      return;
    }

    const { reviews, action, review, id, updates } = readBody(req);
    let current = await loadReviews();

    if (Array.isArray(reviews) && action !== 'sync_client') {
      await saveReviews(reviews);
      send(res, 200, { success: true, reviews });
      return;
    }

    if (action === 'sync_client' && Array.isArray(reviews)) {
      if (reviews.length > current.length) {
        await saveReviews(reviews);
        send(res, 200, { success: true, reviews });
      } else {
        send(res, 200, { success: true, reviews: current });
      }
      return;
    }

    if (action === 'add' && review) {
      const newRev = {
        ...review,
        id: review.id || `rev-${Date.now()}`,
        approved: review.approved !== undefined ? review.approved : true,
        date: review.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        createdAt: new Date().toISOString(),
      };
      current = [newRev, ...current];
      await saveReviews(current);
      send(res, 200, { success: true, newReview: newRev, reviews: current });
      return;
    }

    if (action === 'toggle' && id) {
      let nextApproved = true;
      current = current.map((r: any) => {
        if (r.id === id) {
          nextApproved = !(r.approved !== false);
          return { ...r, approved: nextApproved };
        }
        return r;
      });
      await saveReviews(current);
      send(res, 200, { success: true, approved: nextApproved, reviews: current });
      return;
    }

    if (action === 'update' && id && updates) {
      current = current.map((r: any) => (r.id === id ? { ...r, ...updates } : r));
      await saveReviews(current);
      send(res, 200, { success: true, reviews: current });
      return;
    }

    if (action === 'delete' && id) {
      current = current.filter((r: any) => r.id !== id);
      await saveReviews(current);
      send(res, 200, { success: true, reviews: current });
      return;
    }

    if (action === 'reset') {
      await saveReviews([]);
      send(res, 200, { success: true, reviews: [] });
      return;
    }

    send(res, 400, { success: false, error: 'Unknown action or invalid payload' });
  } catch (err) {
    serverError(res, err, 'Reviews endpoint failed');
  }
}
