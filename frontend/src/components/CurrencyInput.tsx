import React from 'react';
import { formatRupiah, parseRupiah } from '../lib/calculator';

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  placeholder = '0',
  required = false,
  className = '',
  disabled = false,
}) => {
  const displayValue = value > 0 ? value.toLocaleString('id-ID') : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const num = parseRupiah(rawVal);
    onChange(num);
  };

  return (
    <div className={`currency-input-wrapper ${className}`}>
      <span className="currency-prefix">Rp</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off"
      />
    </div>
  );
};
