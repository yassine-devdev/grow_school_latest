
import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../../icons';
import './shared.css';
import './Design.css';

interface DesignState {
  globalFontMain: string;
  headerHeight: number;
  headerFontSize: number;
  statCardPadding: number;
  statCardIconSize: number;
  statCardTitleFontSize: number;
  statCardValueFontSize: number;
  mainNavWidth: number;
  mainNavIconSize: number;
}

const defaultDesign: DesignState = {
  globalFontMain: "'Roboto', sans-serif",
  headerHeight: 64, // px
  headerFontSize: 20, // px
  statCardPadding: 16, // px
  statCardIconSize: 32, // px
  statCardTitleFontSize: 14, // px
  statCardValueFontSize: 36, // px
  mainNavWidth: 72, // px
  mainNavIconSize: 28, // px
};

const fontOptions = [
    { label: 'Roboto', value: "'Roboto', sans-serif" },
    { label: 'Inter', value: "'Inter', sans-serif" },
    { label: 'Source Code Pro', value: "'Source Code Pro', monospace" },
];

const applyDesign = (design: DesignState) => {
    const styleId = 'dynamic-design-style';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }
    
    const css = `
        :root {
            --global-font-main: ${design.globalFontMain};
            --header-height: ${design.headerHeight}px;
            --header-font-size: ${design.headerFontSize}px;
            --stat-card-padding: ${design.statCardPadding}px;
            --stat-card-icon-size: ${design.statCardIconSize}px;
            --stat-card-title-font-size: ${design.statCardTitleFontSize}px;
            --stat-card-value-font-size: ${design.statCardValueFontSize}px;
            --main-nav-width: ${design.mainNavWidth}px;
            --main-nav-icon-size: ${design.mainNavIconSize}px;
        }
    `;
    styleTag.innerHTML = css;
};

const Design: React.FC = () => {
    const [designState, setDesignState] = useState<DesignState>(() => {
        try {
            const savedDesign = localStorage.getItem('aura-design');
            return savedDesign ? { ...defaultDesign, ...JSON.parse(savedDesign) } : defaultDesign;
        } catch {
            return defaultDesign;
        }
    });
    
    useEffect(() => {
        applyDesign(designState);
    }, [designState]);

    const handleChange = (key: keyof DesignState, value: string | number) => {
        setDesignState(prev => ({ ...prev, [key]: value }));
    };
    
     const handleSave = () => {
        localStorage.setItem('aura-design', JSON.stringify(designState));
        alert('Design settings saved!');
    };

    const handleReset = () => {
        localStorage.removeItem('aura-design');
        setDesignState(defaultDesign);
    };

    return (
        <div className="settings-pane-container">
            <div className="settings-header">
                <Icons.Design size={40} className="text-cyan-400"/>
                <div>
                    <h2 className="font-orbitron text-3xl font-bold text-white">Design Studio</h2>
                    <p className="text-gray-400">Customize the layout, sizing, and typography of the UI.</p>
                </div>
            </div>
            
            <div className="settings-card">
                 <div className="flex justify-end gap-4 mb-4">
                    <button onClick={handleReset} className="settings-button">Reset to Default</button>
                    <button onClick={handleSave} className="settings-save-button"><Icons.Save size={18}/> Save Design</button>
                </div>
                
                <div className="design-accordion-section">
                    <h3 className="design-accordion-header">Global Styles</h3>
                    <div className="design-accordion-content">
                        <div className="control-item">
                            <label>Font Family</label>
                             <select className="settings-select" value={designState.globalFontMain} onChange={e => handleChange('globalFontMain', e.target.value)}>
                                {fontOptions.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="design-accordion-section">
                    <h3 className="design-accordion-header">Header</h3>
                    <div className="design-accordion-content">
                        <div className="control-item">
                            <label>Height</label>
                            <div className="slider-input-wrapper"><input type="range" min="48" max="96" value={designState.headerHeight} onChange={e => handleChange('headerHeight', parseInt(e.target.value))} /><span className="slider-value">{designState.headerHeight}px</span></div>
                        </div>
                         <div className="control-item">
                            <label>Title Font Size</label>
                            <div className="slider-input-wrapper"><input type="range" min="16" max="32" value={designState.headerFontSize} onChange={e => handleChange('headerFontSize', parseInt(e.target.value))} /><span className="slider-value">{designState.headerFontSize}px</span></div>
                        </div>
                    </div>
                </div>

                 <div className="design-accordion-section">
                    <h3 className="design-accordion-header">Stat Cards</h3>
                    <div className="design-accordion-content md:grid-cols-2">
                        <div className="control-item">
                            <label>Padding</label>
                            <div className="slider-input-wrapper"><input type="range" min="8" max="32" value={designState.statCardPadding} onChange={e => handleChange('statCardPadding', parseInt(e.target.value))} /><span className="slider-value">{designState.statCardPadding}px</span></div>
                        </div>
                         <div className="control-item">
                            <label>Icon Size</label>
                            <div className="slider-input-wrapper"><input type="range" min="24" max="48" value={designState.statCardIconSize} onChange={e => handleChange('statCardIconSize', parseInt(e.target.value))} /><span className="slider-value">{designState.statCardIconSize}px</span></div>
                        </div>
                         <div className="control-item">
                            <label>Title Font Size</label>
                            <div className="slider-input-wrapper"><input type="range" min="12" max="20" value={designState.statCardTitleFontSize} onChange={e => handleChange('statCardTitleFontSize', parseInt(e.target.value))} /><span className="slider-value">{designState.statCardTitleFontSize}px</span></div>
                        </div>
                         <div className="control-item">
                            <label>Value Font Size</label>
                            <div className="slider-input-wrapper"><input type="range" min="24" max="48" value={designState.statCardValueFontSize} onChange={e => handleChange('statCardValueFontSize', parseInt(e.target.value))} /><span className="slider-value">{designState.statCardValueFontSize}px</span></div>
                        </div>
                    </div>
                </div>
                
                 <div className="design-accordion-section">
                    <h3 className="design-accordion-header">Main Navigation (Right Sidebar)</h3>
                    <div className="design-accordion-content">
                        <div className="control-item">
                            <label>Width</label>
                            <div className="slider-input-wrapper"><input type="range" min="64" max="96" value={designState.mainNavWidth} onChange={e => handleChange('mainNavWidth', parseInt(e.target.value))} /><span className="slider-value">{designState.mainNavWidth}px</span></div>
                        </div>
                         <div className="control-item">
                            <label>Icon Size</label>
                            <div className="slider-input-wrapper"><input type="range" min="24" max="40" value={designState.mainNavIconSize} onChange={e => handleChange('mainNavIconSize', parseInt(e.target.value))} /><span className="slider-value">{designState.mainNavIconSize}px</span></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Design;
