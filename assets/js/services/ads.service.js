import {request} from '../utils/request.js';

/**
 * @typedef {Object} AdItem
 * @property {(string|number)} [id]
 * @property {string} [title]
 * @property {number} [price]
 * @property {string} [target_action]
 * @property {string} [created_at]
 */

/**
 * Загружает список объявлений из backend.
 *
 * @return {Promise<{ok: boolean, ads: !Array<AdItem>,
 *   message: (string|undefined)}>} Результат загрузки объявлений.
 */
export async function getAds() {
  try {
    const response = await request('/ads', {
      method: 'GET',
    });

    return {
      ok: true,
      ads: response.data.ads || [],
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message,
      ads: [],
    };
  }
}
