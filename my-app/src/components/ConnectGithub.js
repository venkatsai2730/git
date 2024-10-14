import React, { useState } from 'react';
import './ConnectGithub.css';
import axios from 'axios';

const ConnectGithub = () => {
    const [status, setStatus] = useState('Not connected');

    const connectGithub = async () => {
        setStatus('Connecting...');
        try {
            const response = await axios.get('http://localhost:5000/github/oauth');
            if (response.data.url) {
                setStatus('Connected');
                // window.location.href = response.data.url;
            } else {
                setStatus('Failed to get GitHub OAuth URL.');
            }
        } catch (error) {
            console.error('Error connecting to GitHub:', error);
            setStatus('Error connecting to GitHub.');
        }
    };

    return (
        <div>
            <h2>Status: {status}</h2>
            <button onClick={connectGithub} disabled={status === 'Connecting...'}>
                {status === 'Connecting...' ? 'Connecting...' : 'Connect GitHub'}
            </button>
        </div>
    );
};

export default ConnectGithub;
