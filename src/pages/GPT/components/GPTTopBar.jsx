import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { cn } from '../../../lib/utils';

function GPTTopBar({ threads, activeThread, onThreadSelect, onNewThread }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter threads based on search query
  const filteredThreads = threads.filter(thread => {
    const title = thread.title || thread.name || 'New Conversation';
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getThreadId = (thread) => thread.thread_id || thread.id;
  const getThreadTitle = (thread) => thread.title || thread.name || 'New Conversation';

  return (
    <div className="sticky top-0 left-0 right-0 h-[45px] bg-bg-light border-b border-divider shadow-lg z-20">
      <div className="flex items-center justify-center h-full px-6">
        {/* Search Bar - Centered, white background */}
        <div ref={searchRef} className="relative w-[664px]">
          <div className="bg-white rounded-[5px] px-[10px] py-[4px] shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Browse chat history or search by keyword"
                className="flex-1 text-[18px] leading-[26px] font-proxima font-normal text-carbon-black placeholder:text-divider border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-[26px] bg-transparent"
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchOpen(false);
                  }}
                  className="flex-shrink-0"
                >
                  <X className="w-6 h-6 text-carbon-black" />
                </button>
              ) : (
                <Search className="w-6 h-6 text-carbon-black flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Dropdown - Thread List */}
          {searchOpen && (
            <div className="absolute top-[41px] left-0 w-full bg-white rounded-[5px] shadow-[0_4px_12px_rgba(0,0,0,0.3)] overflow-hidden z-50">
              {/* Header */}
              <div className="px-4 py-2 text-sm font-proxima text-carbon-black border-b border-divider">
                {searchQuery ? 'Search Results' : 'All Chats'}
              </div>

              {/* Thread List */}
              <ScrollArea className="max-h-[300px]">
                <div className="py-1">
                  {filteredThreads.length === 0 ? (
                    <div className="px-4 py-3 text-sm font-proxima text-divider text-center">
                      No conversations found
                    </div>
                  ) : (
                    filteredThreads.map((thread) => {
                      const threadId = getThreadId(thread);
                      const isActive = String(threadId) === String(activeThread);
                      
                      return (
                        <button
                          key={threadId}
                          onClick={() => {
                            onThreadSelect(threadId);
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className={cn(
                            'w-full px-4 py-2 text-left text-[14px] font-proxima transition-colors',
                            isActive
                              ? 'bg-pursuit-purple text-white'
                              : 'text-carbon-black hover:bg-gray-100'
                          )}
                        >
                          {getThreadTitle(thread)}
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GPTTopBar;

