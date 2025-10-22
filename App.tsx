import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { LoadingState } from './components/LoadingState';
import { BlogDisplay, BlogPost } from './components/BlogDisplay';
import { generateBlogPost } from './services/geminiService';
import { savePost } from './services/supabaseService';

const NEWSLETTER_URL = 'https://docs.google.com/spreadsheets/d/1CDALlD2V_Rm_cSaabZCEVIa2LMpV48IsOXrdFQ8lR5E/export?format=csv';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [rawNewsletter, setRawNewsletter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setBlogPost(null);
    setError(null);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const urlWithCacheBust = `${NEWSLETTER_URL}&timestamp=${Date.now()}`;
      const response = await fetch(urlWithCacheBust);

      if (!response.ok) {
        throw new Error(`Network response was not ok, status: ${response.status}`);
      }
      const newsletterContent = await response.text();
      setRawNewsletter(newsletterContent); // Save raw newsletter data

      const generatedPost = await generateBlogPost(newsletterContent);
      setBlogPost(generatedPost);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setError(`Failed to process and generate blog post: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!blogPost) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await savePost({
        title: blogPost.title,
        content: blogPost.body,
        raw_newsletter_data: rawNewsletter
      });
      setSaveSuccess(true);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setSaveError(`Failed to save post: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  }, [blogPost, rawNewsletter]);

  const handleReset = useCallback(() => {
    setBlogPost(null);
    setError(null);
    setIsLoading(false);
    setIsSaving(false);
    setSaveSuccess(false);
    setSaveError(null);
    setRawNewsletter('');
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }
    if (error) {
      return (
        <div className="text-center text-red-300 bg-red-900/50 p-6 rounded-lg">
          <h3 className="font-bold text-xl mb-2 font-serif">An Error Occurred</h3>
          <p className="font-sans">{error}</p>
          <button
            onClick={handleReset}
            className="mt-4 px-6 py-2 bg-amber-200 text-slate-800 font-bold rounded-full hover:bg-amber-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    if (blogPost) {
      return (
        <BlogDisplay
          title={blogPost.title}
          body={blogPost.body}
          onReset={handleReset}
          onSave={handleSave}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          saveError={saveError}
        />
      );
    }
    return (
       <div className="text-center max-w-xl p-8">
        <p className="mb-8 text-lg text-indigo-200">
          Welcome, spiritual guide. OMEGA is ready to transmute the daily news into a powerful sermon for inner liberation.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full max-w-md py-4 px-6 bg-amber-400 text-slate-900 font-bold text-xl rounded-lg shadow-lg hover:bg-amber-300 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300/50"
        >
          {isLoading ? 'Generating...' : 'Generate Today\'s Sermon'}
        </button>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 text-slate-100 p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
