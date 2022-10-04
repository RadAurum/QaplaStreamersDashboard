import React, { useState } from 'react';

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import QaplaTabs from '../QaplaTabs/QaplaTabs';
import QaplaTab from '../QaplaTabs/QaplaTab';
import CheersSettings from './CheersSettings';
import ChatbotCommandSettings from './ChatbotCommandSettings';

const Settings = ({ user }) => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <StreamerDashboardContainer user={user}>
            <QaplaTabs value={value} onChange={handleChange}>
                <QaplaTab label='Cheers' />
                <QaplaTab label='ChatBot Command' />
            </QaplaTabs>
            {user && user.uid && user.id && value === 0 &&
                <CheersSettings uid={user.uid} twitchId={user.id} />
            }
            {user && user.uid && user.id && value === 1 &&
                <ChatbotCommandSettings uid={user.uid} />
            }
        </StreamerDashboardContainer>
    );
}

export default Settings;