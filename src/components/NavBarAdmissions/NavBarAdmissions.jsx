import React from 'react';
import { TabsList, TabsTrigger } from '../animate-ui/components/radix/tabs';
import './NavBarAdmissions.css';

const NavBarAdmissions = ({ activeTab }) => {
    const tabs = [
        { value: 'overview', label: 'Overview' },
        { value: 'applications', label: 'Applications' },
        { value: 'info-sessions', label: 'Info Sessions' },
        { value: 'workshops', label: 'Workshops' },
        { value: 'emails', label: 'Emails' }
    ];

    return (
        <div className="navbar-admissions h-[45px]">
            <TabsList className="navbar-admissions__list h-[45px]">
                {tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="navbar-admissions__trigger h-[45px]"
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </div>
    );
};

export default NavBarAdmissions;

