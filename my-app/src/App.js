import React from 'react';

import './App.css';
import ConnectGithub from './components/ConnectGithub';

function App() {
    
    return (
        <div className="App">
            <h1>GitHub PR Review System</h1>
            <ConnectGithub />
        </div>
    );
}

export default App;
