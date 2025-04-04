import * as React from 'react';

interface PresenceProps {
    children: React.ReactElement | ((props: {
        present: boolean;
    }) => React.ReactElement);
    present: boolean;
}
declare const Presence: React.FC<PresenceProps>;

export { Presence, type PresenceProps };
