import '../../../../../motion-utils/dist/es/errors.mjs';
import { memo } from '../../../../../motion-utils/dist/es/memo.mjs';

const supportsScrollTimeline = memo(() => window.ScrollTimeline !== undefined);

export { supportsScrollTimeline };
