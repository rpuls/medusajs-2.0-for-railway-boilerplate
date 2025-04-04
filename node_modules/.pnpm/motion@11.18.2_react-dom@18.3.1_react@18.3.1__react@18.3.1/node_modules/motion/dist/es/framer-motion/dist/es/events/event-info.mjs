import '../../../../motion-utils/dist/es/errors.mjs';
import { isPrimaryPointer } from '../../../../motion-dom/dist/es/gestures/utils/is-primary-pointer.mjs';

function extractEventInfo(event) {
    return {
        point: {
            x: event.pageX,
            y: event.pageY,
        },
    };
}
const addPointerInfo = (handler) => {
    return (event) => isPrimaryPointer(event) && handler(event, extractEventInfo(event));
};

export { addPointerInfo, extractEventInfo };
