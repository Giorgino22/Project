// ads.txt on the central domain covers all subdomains, so this is the only one Google needs.
import { adsTxtResponse } from '@tools/shared/lib/endpoints';

export const GET = () => adsTxtResponse();
