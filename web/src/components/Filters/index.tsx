import { useState } from 'react';
import './Filters.css';

export interface FilterState {
  domains: Set<string>;
  types: Set<string>;
}

interface FiltersProps {
  availableDomains?: string[];
  availableTypes?: string[];
  onChange: (filters: FilterState) => void;
}

export function Filters({
  availableDomains = ['philosophy', 'mathematics', 'physics'],
  availableTypes = ['proposition', 'theorem', 'theory', 'axiom'],
  onChange,
}: FiltersProps) {
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(
    new Set(availableDomains)
  );
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(availableTypes));

  const toggleDomain = (domain: string) => {
    const newDomains = new Set(selectedDomains);
    if (newDomains.has(domain)) {
      newDomains.delete(domain);
    } else {
      newDomains.add(domain);
    }
    setSelectedDomains(newDomains);
    onChange({ domains: newDomains, types: selectedTypes });
  };

  const toggleType = (type: string) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
    onChange({ domains: selectedDomains, types: newTypes });
  };

  const selectAllDomains = () => {
    const all = new Set(availableDomains);
    setSelectedDomains(all);
    onChange({ domains: all, types: selectedTypes });
  };

  const deselectAllDomains = () => {
    const none = new Set<string>();
    setSelectedDomains(none);
    onChange({ domains: none, types: selectedTypes });
  };

  return (
    <div className="filters">
      <div className="filter-section">
        <div className="filter-header">
          <h3>Domains</h3>
          <div className="filter-actions">
            <button onClick={selectAllDomains}>All</button>
            <button onClick={deselectAllDomains}>None</button>
          </div>
        </div>
        <div className="filter-checkboxes">
          {availableDomains.map((domain) => (
            <label key={domain} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedDomains.has(domain)}
                onChange={() => toggleDomain(domain)}
              />
              <span className="checkbox-label">{domain}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <h3>Types</h3>
        </div>
        <div className="filter-checkboxes">
          {availableTypes.map((type) => (
            <label key={type} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedTypes.has(type)}
                onChange={() => toggleType(type)}
              />
              <span className="checkbox-label">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
