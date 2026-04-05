'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function TabBar({ tabs, activeTab, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: '#e8d5b7' }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'text-white shadow-md'
              : 'text-amber-900 hover:text-amber-800'
          }`}
          style={{
            backgroundColor: activeTab === tab.id ? '#81a551' : 'transparent',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'help' | 'cheer';
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  const colors: Record<string, { bg: string; text: string }> = {
    success: { bg: '#81a551', text: '#fff' },
    warning: { bg: '#e8a020', text: '#fff' },
    info: { bg: '#5b8dd9', text: '#fff' },
    help: { bg: '#81a551', text: '#fff' },
    cheer: { bg: '#d97941', text: '#fff' },
  };

  const c = colors[variant] ?? colors.info;

  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {children}
    </span>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 border-4 border-amber-800 shadow-lg ${onClick ? 'cursor-pointer hover:scale-[1.01] transition-transform' : ''} ${className}`}
      style={{
        backgroundColor: '#faf3e0',
        borderColor: '#8b6914',
        boxShadow: '4px 4px 0px #8b6914',
      }}
    >
      {children}
    </div>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function Button({ children, onClick, variant = 'primary', disabled, className = '', type = 'button' }: ButtonProps) {
  const styles: Record<string, { bg: string; hover: string; text: string }> = {
    primary:   { bg: '#81a551', hover: '#6d9242', text: '#fff' },
    secondary: { bg: '#e8a020', hover: '#d08a10', text: '#fff' },
    danger:    { bg: '#c0392b', hover: '#a93226', text: '#fff' },
  };

  const s = styles[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: disabled ? '#aaa' : s.bg,
        color: s.text,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = s.hover; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = s.bg; }}
    >
      {children}
    </button>
  );
}

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export function Input({ value, onChange, placeholder, maxLength, multiline, rows = 3, className = '' }: InputProps) {
  const baseClass = multiline ? 'textarea' : 'input';

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className={`w-full rounded-lg border-2 px-3 py-2 text-sm ${className}`}
          style={{
            backgroundColor: '#fff8e7',
            borderColor: '#c9a227',
            color: '#3d2914',
            resize: 'none',
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full rounded-lg border-2 px-3 py-2 text-sm ${className}`}
          style={{
            backgroundColor: '#fff8e7',
            borderColor: '#c9a227',
            color: '#3d2914',
          }}
        />
      )}
      {maxLength && (
        <span className="absolute bottom-1 right-2 text-xs" style={{ color: '#a08020' }}>
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function Select({ value, onChange, options, className = '' }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border-2 px-3 py-2 text-sm appearance-none cursor-pointer ${className}`}
      style={{
        backgroundColor: '#fff8e7',
        borderColor: '#c9a227',
        color: '#3d2914',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Content */}
      <div
        className="relative w-full max-w-sm rounded-xl border-4 p-5 shadow-2xl"
        style={{ backgroundColor: '#faf3e0', borderColor: '#8b6914' }}
      >
        {title && (
          <h3 className="mb-3 text-lg font-bold text-center" style={{ color: '#5a3a0a' }}>
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
}

interface InterestBadgeProps {
  onClick?: () => void;
}

export function InterestBadge({ onClick }: InterestBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg hover:scale-110 transition-transform"
      style={{ backgroundColor: '#e8a020' }}
      title="Someone has contacted this user"
    >
      !
    </button>
  );
}
