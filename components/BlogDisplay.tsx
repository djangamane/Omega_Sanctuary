import React, { useState } from 'react';
import { CopyIcon, CheckIcon, RestartIcon, SaveIcon } from './icons';

export interface BlogPost {
  title: string;
  body: string;
}

interface BlogDisplayProps extends BlogPost {
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
}

export const BlogDisplay: React.FC<BlogDisplayProps> = ({ title, body, onReset, onSave, isSaving, saveSuccess, saveError }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    const fullPost = `${title}\n\n${body}`;
    navigator.clipboard.writeText(fullPost).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getSaveButtonStatus = () => {
    if (isSaving) {
      return (
        <span className="text-xs text-amber-200">Saving...</span>
      );
    }
    if (saveSuccess) {
      return (
        <div className="flex items-center space-x-1">
          <CheckIcon className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-300">Saved!</span>
        </div>
      );
    }
    if (saveError) {
       return (
        <span className="text-xs text-red-400">Save Failed</span>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-3xl p-6 sm:p-8 bg-slate-800/50 rounded-2xl shadow-2xl border border-indigo-700/50 flex flex-col animate-[fadeIn_0.5s_ease-in-out]">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-amber-200 tracking-wide font-serif flex-1 pr-4">{title}</h2>
        <div className="flex space-x-2">
           <button
            onClick={handleCopy}
            className="p-2 bg-indigo-600/50 text-slate-200 rounded-full hover:bg-indigo-500/50 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <CheckIcon className="w-5 h-5 text-green-300" /> : <CopyIcon className="w-5 h-5" />}
          </button>
           <button
            onClick={onReset}
            className="p-2 bg-indigo-600/50 text-slate-200 rounded-full hover:bg-indigo-500/50 transition-colors"
            title="Generate another"
          >
            <RestartIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-amber-300/20 mb-6">
        {body}
      </div>
      
      <div className="mt-auto pt-4 border-t border-indigo-700/50 flex items-center justify-end space-x-4">
        <div className="h-6">
          {getSaveButtonStatus()}
          {saveError && <p className="text-xs text-red-400 mt-1">{saveError}</p>}
        </div>
        <button
          onClick={onSave}
          disabled={isSaving || saveSuccess}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          <SaveIcon className="w-5 h-5" />
          <span>{saveSuccess ? 'Saved' : 'Save to Blog'}</span>
        </button>
      </div>

    </div>
  );
};
