import React, { useState } from 'react';
import {
  Library,
  Plus,
  Search,
  BookOpen,
  CheckCircle2,
  Trash2,
  Edit2,
  Bookmark
} from 'lucide-react';
import { store } from '../lib/storage';
import { Book, BookStatus } from '../types';

export const BooksView: React.FC = () => {
  const books = store.getBooks() || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('Indian Polity');
  const [totalPages, setTotalPages] = useState('850');
  const [pagesRead, setPagesRead] = useState('0');
  const [status, setStatus] = useState<BookStatus>('Reading');
  const [notes, setNotes] = useState('');

  const filteredBooks = (books || []).filter(b => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = !q ||
      ((b.name || '') + '').toLowerCase().includes(q) ||
      ((b.author || '') + '').toLowerCase().includes(q) ||
      ((b.subject || '') + '').toLowerCase().includes(q);
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tot = parseInt(totalPages) || 100;
    const read = parseInt(pagesRead) || 0;
    const percent = Math.min(100, Math.round((read / tot) * 100));

    store.addBook({
      name: name.trim(),
      author: author.trim() || 'Standard Edition',
      subject,
      totalPages: tot,
      pagesRead: read,
      progressPercent: percent,
      status,
      revisionCount: 0,
      notes: notes.trim() || undefined
    });

    setName('');
    setAuthor('');
    setNotes('');
    setIsAdding(false);
  };

  const handleUpdatePages = (bookId: string, delta: number) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      const newRead = Math.max(0, Math.min(book.totalPages, book.pagesRead + delta));
      const newPercent = Math.min(100, Math.round((newRead / book.totalPages) * 100));
      const newStatus: BookStatus = newPercent === 100 ? 'Completed' : 'Reading';
      store.updateBook(bookId, {
        pagesRead: newRead,
        progressPercent: newPercent,
        status: newStatus
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Remove this book from library?')) {
      store.deleteBook(id);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Standard Literature & NCERTs</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans']">
            BOOKS & RESOURCES TRACKER
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking pages read, active revisions, and completion progress across essential books
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Resource / Book
          </button>
        </div>
      </div>

      {/* Add Book Modal Form */}
      {isAdding && (
        <form onSubmit={handleAddBook} className="bg-white rounded-3xl p-6 border-2 border-indigo-500 shadow-xl space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
            Add Book or Material to Library
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Book Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Indian Polity"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Author / Publication</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. M. Laxmikanth (7th Edition)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Polity & Constitution"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Pages</label>
              <input
                type="number"
                required
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pages Read So Far</label>
              <input
                type="number"
                value={pagesRead}
                onChange={(e) => setPagesRead(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reading Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="Reading">Currently Reading</option>
                <option value="Completed">Completed</option>
                <option value="Not Started">Not Started</option>
                <option value="Reference">Reference Only</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
            >
              Add to Library
            </button>
          </div>
        </form>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(filteredBooks || []).map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  b.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                }`}>
                  {b.status}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {b.revisionCount}x Revisions
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                {b.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{b.author}</p>
              <p className="text-[11px] font-semibold text-indigo-600 mt-1">📚 {b.subject}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-600 font-mono">
                  {b.pagesRead} / {b.totalPages} pages
                </span>
                <span className="font-extrabold text-indigo-600">{b.progressPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${b.progressPercent}%` }}
                />
              </div>

              {/* Quick page adjustments */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUpdatePages(b.id, -10)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-[10px] text-slate-600"
                  >
                    -10p
                  </button>
                  <button
                    onClick={() => handleUpdatePages(b.id, 10)}
                    className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 font-bold text-[10px] text-indigo-700"
                  >
                    +10p
                  </button>
                  <button
                    onClick={() => handleUpdatePages(b.id, 50)}
                    className="px-2 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 font-bold text-[10px] text-indigo-800"
                  >
                    +50p
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
