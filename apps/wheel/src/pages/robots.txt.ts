import { robotsResponse } from '@tools/shared/lib/endpoints';
import { site } from '../site';

export const GET = () => robotsResponse(site.id);
