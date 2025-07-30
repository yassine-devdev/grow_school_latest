import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../../icons';
import './shared.css';
import './Branding.css';

interface ThemeState {
  // Layout & Backgrounds
  mainBackground: string;
  headerBackground: string;
  headerBorder: string;
  dockBackground: string;
  dockBorder: string;
  mainNavBackground: string;
  mainNavBorder: string;
  contextualNavBackground: string;
  contextualNavBorder: string;

  // Navigation
  mainNavIconActiveRing: string;
  l1NavActiveBackground: string;
  l1NavActiveText: string;
  l2NavActiveBackground: string;
  l2NavActiveText: string;
  l2NavActiveShadow: string;
  
  // Cards & Widgets
  cardBackground: string;
  cardBorder: string;
  cardPrimaryText: string;
  cardSecondaryText: string;
  cardIconColor: string;
  
  // General UI Elements
  headerText: string;
  headerIcon: string;
  dockText: string;
  dockIcon: string;
  dockActiveButtonBackground: string;
  contextualNavIcon: string;
  contextualNavIconHoverBackground: string;
  contextualNavIconHoverText: string;
  searchInputBackground: string;
  searchInputText: string;
  searchInputPlaceholder: string;
  searchInputFocusBorder: string;
}

const defaultTheme: ThemeState = {
  mainBackground: '#1e1935',
  headerBackground: 'rgba(96, 165, 250, 0.1)',
  headerBorder: 'rgba(96, 165, 250, 0.4)',
  dockBackground: 'rgba(96, 165, 250, 0.1)',
  dockBorder: 'rgba(96, 165, 250, 0.4)',
  mainNavBackground: 'rgba(96, 165, 250, 0.1)',
  mainNavBorder: 'rgba(96, 165, 250, 0.4)',
  contextualNavBackground: 'rgba(96, 165, 250, 0.1)',
  contextualNavBorder: 'rgba(96, 165, 250, 0.4)',
  mainNavIconActiveRing: 'rgba(255, 255, 255, 0.5)',
  l1NavActiveBackground: 'rgba(192, 132, 252, 0.5)',
  l1NavActiveText: '#FFFFFF',
  l2NavActiveBackground: 'rgba(168, 85, 247, 0.4)',
  l2NavActiveText: '#FFFFFF',
  l2NavActiveShadow: 'rgba(168, 85, 247, 0.4)',
  cardBackground: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(96, 165, 250, 0.4)',
  cardPrimaryText: '#FFFFFF',
  cardSecondaryText: '#d1d5db',
  cardIconColor: '#c084fc',
  headerText: '#e5e7eb',
  headerIcon: '#9ca3af',
  dockText: '#e5e7eb',
  dockIcon: '#e5e7eb',
  dockActiveButtonBackground: 'rgba(192, 132, 252, 0.5)',
  contextualNavIcon: '#9ca3af',
  contextualNavIconHoverBackground: 'rgba(255, 255, 255, 0.1)',
  contextualNavIconHoverText: '#FFFFFF',
  searchInputBackground: 'rgba(0, 0, 0, 0.3)',
  searchInputText: '#FFFFFF',
  searchInputPlaceholder: '#9ca3af',
  searchInputFocusBorder: 'rgba(168, 85, 247, 0.6)',
};


const THEME_CONFIG = [
    {
        id: 'layout',
        title: 'Layout & Backgrounds',
        colors: [
            { key: 'mainBackground', label: 'Main Background' },
            { key: 'headerBackground', label: 'Header Background' },
            { key: 'headerBorder', label: 'Header Border/Shadow' },
            { key: 'dockBackground', label: 'Dock Background' },
            { key: 'dockBorder', label: 'Dock Border/Shadow' },
            { key: 'mainNavBackground', label: 'Main Nav Background' },
            { key: 'mainNavBorder', label: 'Main Nav Border/Shadow' },
            { key: 'contextualNavBackground', label: 'Contextual Nav Background' },
            { key: 'contextualNavBorder', label: 'Contextual Nav Border/Shadow' },
        ],
    },
    {
        id: 'navigation',
        title: 'Navigation',
        colors: [
            { key: 'mainNavIconActiveRing', label: 'Main Nav Active Ring' },
            { key: 'l1NavActiveBackground', label: 'L1 Nav Active Background' },
            { key: 'l1NavActiveText', label: 'L1 Nav Active Text' },
            { key: 'l2NavActiveBackground', label: 'L2 Nav Active Background' },
            { key: 'l2NavActiveText', label: 'L2 Nav Active Text' },
            { key: 'l2NavActiveShadow', label: 'L2 Nav Active Shadow' },
        ],
    },
    {
        id: 'cards',
        title: 'Cards & Widgets',
        colors: [
            { key: 'cardBackground', label: 'Card Background' },
            { key: 'cardBorder', label: 'Card Border/Shadow' },
            { key: 'cardPrimaryText', label: 'Card Primary Text' },
            { key: 'cardSecondaryText', label: 'Card Secondary Text' },
            { key: 'cardIconColor', label: 'Card Icon Color' },
        ],
    },
    {
        id: 'ui',
        title: 'General UI Elements',
        colors: [
            { key: 'headerText', label: 'Header Text' },
            { key: 'headerIcon', label: 'Header Icon' },
            { key: 'dockText', label: 'Dock Text' },
            { key: 'dockIcon', label: 'Dock Icon' },
            { key: 'dockActiveButtonBackground', label: 'Dock Active Button BG' },
            { key: 'contextualNavIcon', label: 'Contextual Nav Icon' },
            { key: 'contextualNavIconHoverBackground', label: 'Contextual Nav Icon Hover BG' },
            { key: 'contextualNavIconHoverText', label: 'Contextual Nav Icon Hover Text' },
            { key: 'searchInputBackground', label: 'Search Input Background' },
            { key: 'searchInputText', label: 'Search Input Text' },
            { key: 'searchInputPlaceholder', label: 'Search Placeholder Text' },
            { key: 'searchInputFocusBorder', label: 'Search Input Focus Border' },
        ],
    },
];

const ColorPicker: React.FC<{ label: string; color: string; onChange: (color: string) => void; }> = ({ label, color, onChange }) => (
    <div className="color-picker-item">
        <label>{label}</label>
        <div className="color-input-wrapper">
            <input type="color" value={color.startsWith('rgba') ? '#ffffff' : color} onChange={(e) => onChange(e.target.value)} />
            <input type="text" value={color} onChange={(e) => onChange(e.target.value)} className="color-text-input" />
        </div>
    </div>
);

const Branding: React.FC = () => {
    const [themeColors, setThemeColors] = useState<ThemeState>(() => {
        try {
            const savedTheme = localStorage.getItem('aura-theme');
            return savedTheme ? { ...defaultTheme, ...JSON.parse(savedTheme) } : defaultTheme;
        } catch {
            return defaultTheme;
        }
    });
    const [openAccordion, setOpenAccordion] = useState<string>('layout');

    const applyTheme = useCallback((theme: ThemeState) => {
        const styleId = 'dynamic-theme-style';
        let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }
        
        const css = `
            :root {
                --color-main-bg: ${theme.mainBackground};
                --color-header-bg: ${theme.headerBackground};
                --color-header-border: ${theme.headerBorder};
                --color-dock-bg: ${theme.dockBackground};
                --color-dock-border: ${theme.dockBorder};
                --color-main-nav-bg: ${theme.mainNavBackground};
                --color-main-nav-border: ${theme.mainNavBorder};
                --color-contextual-nav-bg: ${theme.contextualNavBackground};
                --color-contextual-nav-border: ${theme.contextualNavBorder};
                --color-main-nav-icon-active-ring: ${theme.mainNavIconActiveRing};
                --color-l1-tab-active-bg: ${theme.l1NavActiveBackground};
                --color-l1-tab-active-text: ${theme.l1NavActiveText};
                --color-l2-sidebar-active-bg: ${theme.l2NavActiveBackground};
                --color-l2-sidebar-active-text: ${theme.l2NavActiveText};
                --color-l2-sidebar-active-shadow: ${theme.l2NavActiveShadow};
                --color-card-bg: ${theme.cardBackground};
                --color-card-border: ${theme.cardBorder};
                --color-card-primary-text: ${theme.cardPrimaryText};
                --color-card-secondary-text: ${theme.cardSecondaryText};
                --color-card-icon-color: ${theme.cardIconColor};
                --color-header-text: ${theme.headerText};
                --color-header-icon: ${theme.headerIcon};
                --color-dock-text: ${theme.dockText};
                --color-dock-icon: ${theme.dockIcon};
                --color-dock-active-button-bg: ${theme.dockActiveButtonBackground};
                --color-contextual-nav-icon: ${theme.contextualNavIcon};
                --color-contextual-nav-icon-hover-bg: ${theme.contextualNavIconHoverBackground};
                --color-contextual-nav-icon-hover-text: ${theme.contextualNavIconHoverText};
                --color-search-bg: ${theme.searchInputBackground};
                --color-search-text: ${theme.searchInputText};
                --color-search-placeholder: ${theme.searchInputPlaceholder};
                --color-search-focus-border: ${theme.searchInputFocusBorder};
            }
        `;
        styleTag.innerHTML = css;
    }, []);

    useEffect(() => {
        applyTheme(themeColors);
    }, [themeColors, applyTheme]);

    const handleColorChange = (key: keyof ThemeState, value: string) => {
        setThemeColors(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('aura-theme', JSON.stringify(themeColors));
        alert('Theme saved!');
    };

    const handleReset = () => {
        localStorage.removeItem('aura-theme');
        setThemeColors(defaultTheme);
    };

    return (
        <div className="settings-pane-container">
            <div className="settings-header">
                <Icons.Branding size={40} className="text-cyan-400"/>
                <div>
                    <h2 className="font-orbitron text-3xl font-bold text-white">Advanced Branding</h2>
                    <p className="text-gray-400">Full control over the application's color scheme.</p>
                </div>
            </div>

            <div className="theme-editor-layout">
                <div className="theme-controls-wrapper">
                    <div className="theme-controls-actions">
                        <button onClick={handleSave} className="settings-save-button"><Icons.Save size={18}/> Save Theme</button>
                        <button onClick={handleReset} className="settings-button">Reset to Default</button>
                    </div>
                    {THEME_CONFIG.map(section => (
                        <div key={section.id} className="accordion-section">
                            <button className="accordion-header" onClick={() => setOpenAccordion(prev => prev === section.id ? null : section.id)}>
                                <span>{section.title}</span>
                                <Icons.ChevronRight className={`accordion-icon ${openAccordion === section.id ? 'open' : ''}`} />
                            </button>
                            {openAccordion === section.id && (
                                <div className="accordion-content">
                                    {section.colors.map(color => (
                                        <ColorPicker
                                            key={color.key}
                                            label={color.label}
                                            color={themeColors[color.key as keyof ThemeState]}
                                            onChange={v => handleColorChange(color.key as keyof ThemeState, v)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="live-preview-wrapper">
                    <h3 className="live-preview-title">Live Preview</h3>
                    <div className="live-preview-area">
                        {/* StatCard Preview */}
                        <div className="stat-card-bordered stat-card-preview">
                            <div className="flex justify-between items-start">
                                <span className="stat-card-secondary-text">Sample Card</span>
                                <Icons.School className="stat-card-icon" size={24}/>
                            </div>
                            <div>
                                <p className="font-orbitron font-bold text-2xl stat-card-primary-text">1,234</p>
                            </div>
                        </div>
                        {/* Nav Preview */}
                        <div className="nav-preview-container">
                            <button className="l1-nav-preview-active">
                                <Icons.Settings size={16}/> L1 Active
                            </button>
                            <button className="l2-nav-preview-active">
                                <Icons.User size={16}/> L2 Active
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Branding;
