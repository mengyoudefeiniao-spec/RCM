import { request } from './client.js';

// National cockpit overview. Dynamic records live in PocketBase (rcm_center_cockpit_overview_v1)
// and only carry locale-neutral indicator keys, units and province codes.
export const getCockpitOverview = () => request({ url: '/cockpit/overview', method: 'GET' });
