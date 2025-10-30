import { useState } from 'react';
import { Download, Upload, FileJson, Settings, FileImage, FileCode, FileText, Layout } from 'lucide-react';
import useStore from '../store';
import { exportAsPNG, exportAsSVG, generatePlantUML, generateMermaid, generateMarkdown, exportAsHTML } from '../utils/exportUtils';
import { applyHierarchicalLayout, applyGridLayout, applyCircularLayout, applyForceLayout } from '../utils/layoutUtils';

const Header = () => {
  const { metadata, setMetadata, currentLevel, setCurrentLevel, exportModel, importModel, clearAll, getAllElements, updateElement, relationships } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  const levels = [
    { value: 'context', label: 'Context' },
    { value: 'container', label: 'Container' },
    { value: 'component', label: 'Component' },
    { value: 'code', label: 'Code' },
  ];

  const handleLevelChange = (newLevel) => {
    const elements = getAllElements();

    // If there are elements, warn the user
    if (elements.length > 0) {
      const confirmed = window.confirm(
        `Changing diagram level will clear all elements from the canvas.\n\n` +
        `Current elements: ${elements.length}\n\n` +
        `Are you sure you want to proceed? This cannot be undone.`
      );

      if (!confirmed) {
        return; // User cancelled
      }

      // User confirmed - clear all elements and relationships
      clearAll();
    }

    // Change the level
    setCurrentLevel(newLevel);
  };

  const handleExportJSON = () => {
    const model = exportModel();
    const dataStr = JSON.stringify(model, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${metadata.name.replace(/\s+/g, '-').toLowerCase()}-c4-model.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportJSON = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const model = JSON.parse(e.target.result);
          importModel(model);
          alert('Model imported successfully!');
        } catch (error) {
          alert('Error importing model: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all elements? This cannot be undone.')) {
      clearAll();
    }
  };

  const handleExportPlantUML = () => {
    const model = exportModel();
    const plantuml = generatePlantUML(model);
    const blob = new Blob([plantuml], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata.name.replace(/\s+/g, '-').toLowerCase()}-c4.puml`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportMermaid = () => {
    const model = exportModel();
    const mermaid = generateMermaid(model);
    const blob = new Blob([mermaid], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata.name.replace(/\s+/g, '-').toLowerCase()}-c4.mmd`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportMarkdown = () => {
    const model = exportModel();
    const markdown = generateMarkdown(model);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata.name.replace(/\s+/g, '-').toLowerCase()}-c4.md`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportHTML = () => {
    const model = exportModel();
    exportAsHTML(model);
    setShowExportMenu(false);
  };

  const handleExportPNG = async () => {
    await exportAsPNG();
    setShowExportMenu(false);
  };

  const handleExportSVG = async () => {
    await exportAsSVG();
    setShowExportMenu(false);
  };

  const applyLayout = (layoutFn) => {
    const elements = getAllElements();
    const layoutedElements = layoutFn(elements, relationships);

    // Update each element with new position
    layoutedElements.forEach((el) => {
      updateElement(el.type, el.id, { position: el.position });
    });

    setShowLayoutMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">
            C4 Modelling Tool
          </h1>
          <div className="text-sm text-gray-600">
            {metadata.name}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Level Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Level:</span>
            <select
              value={currentLevel}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {levels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export/Import Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
                title="Export model"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={handleExportJSON}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileJson className="w-4 h-4" />
                      JSON
                    </button>
                    <button
                      onClick={handleExportPlantUML}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileCode className="w-4 h-4" />
                      PlantUML
                    </button>
                    <button
                      onClick={handleExportMermaid}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileCode className="w-4 h-4" />
                      Mermaid
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Markdown
                    </button>
                    <button
                      onClick={handleExportHTML}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      HTML Document
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleExportPNG}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileImage className="w-4 h-4" />
                      PNG Image
                    </button>
                    <button
                      onClick={handleExportSVG}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileImage className="w-4 h-4" />
                      SVG Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            <div className="relative">
              <button
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm transition-colors"
                title="Auto-layout"
              >
                <Layout className="w-4 h-4" />
                Layout
              </button>

              {showLayoutMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => applyLayout(applyHierarchicalLayout)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Hierarchical
                    </button>
                    <button
                      onClick={() => applyLayout(applyGridLayout)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => applyLayout(applyCircularLayout)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Circular
                    </button>
                    <button
                      onClick={() => applyLayout(applyForceLayout)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Force-Directed
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
              title="Clear all elements"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
