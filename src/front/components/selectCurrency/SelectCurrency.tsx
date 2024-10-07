import React, { useState, useEffect, useRef, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { currencyStore } from '../../stores/FromStore';
import { ItemType } from "../../api/CurrencyApi";
import "./SelectCurrency.css";

type SelectCurrencyPropsType = {
    onSelect: (item: ItemType) => void;
    defaultCode?: string;
}

const SelectCurrency = observer(({ onSelect, defaultCode }: SelectCurrencyPropsType) => {
    const { items, toggleFavorite } = currencyStore;

    const [filteredItems, setFilteredItems] = useState<ItemType[]>([]);
    const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = useCallback((code: string) => {
        const selected = filteredItems.find((item) => item.code === code);
        setSelectedItem(selected || null);
        setIsOpen(false);

        if (onSelect && selected) {
            onSelect(selected);
        }
    }, [filteredItems, onSelect]);

    useEffect(() => {
        if (defaultCode && !selectedItem) {
            const selected = items.find((item) => item.code === defaultCode);
            setSelectedItem(selected || null);
        }
    }, [defaultCode, items, selectedItem]);

    useEffect(() => {
        if (filteredItems.length && defaultCode && !selectedItem) {
            handleSelect(defaultCode);
        }
    }, [filteredItems, defaultCode, selectedItem, handleSelect]);

    useEffect(() => {
        if (!items || !items.length) {
            return;
        }
        if (!searchTerm) { 
            setFilteredItems(items);
        } 
        else{
            setFilteredItems(
                items.filter((item) =>
                item.code.toLowerCase().includes(searchTerm.toLowerCase()) 
                || 
                item.text.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }, [searchTerm, items]);

    const handleFavorite = (code: string) => {
        toggleFavorite(code);
    };

    const handleClick = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchTerm("");
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="select-container" ref={containerRef}>
            <div className="select-currency" onClick={handleClick}>
                {selectedItem ? (
                    selectedItem.text
                ) : (
                    <i className="placeholder-text">Выберите валюту для конвертации</i>
                )}
            </div>
            {isOpen && (
                <div className="options-currency">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Поиск валюты..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <div
                                key={item.code}
                                className={`option-currency ${selectedItem && selectedItem.code === item.code ? "selected" : ""}`}
                                onClick={() => handleSelect(item.code)}
                            >
                                <span>{item.text + ' (' + item.code + ')'}</span>
                                {currencyStore.account && ( 
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFavorite(item.code);
                                        }}
                                        className={item.buttonClass}
                                    >
                                        {item.isFavorite ? "⭐" : "☆"}
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <span className="no-results-text">⨷ Не найдено</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export { SelectCurrency };
