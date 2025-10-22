import { memo, useEffect, useRef } from 'react';

interface ChatMessage {
  user: string;
  message: string;
  timestamp: number;
  avatar?: string;
}

interface ChatWidgetProps {
  messages: ChatMessage[];
}

export const ChatWidget = memo(function ChatWidget({ messages }: ChatWidgetProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const lastScrollTopRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!scrollRef.current || isUserScrollingRef.current) return;

    // Smooth scroll to bottom
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  // Detect if user is manually scrolling
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold

    // If user scrolled up, pause auto-scroll
    if (scrollTop < lastScrollTopRef.current) {
      isUserScrollingRef.current = true;
    }

    // If user scrolled back to bottom, resume auto-scroll
    if (isAtBottom) {
      isUserScrollingRef.current = false;
    }

    lastScrollTopRef.current = scrollTop;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
        <span className="text-xl sm:text-2xl">💬</span>
        <h2 className="text-base sm:text-lg font-bold text-white">Live Chat</h2>
        <span className="ml-auto text-xs sm:text-sm text-gray-500">
          {messages.length}
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
      >
        {messages.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-gray-500 text-sm">
            Noch keine Chat-Nachrichten...
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={`${msg.timestamp}-${index}`}
              className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 transition-colors"
            >
              {msg.avatar ? (
                <img
                  src={msg.avatar}
                  alt={msg.user}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
                  {msg.user.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-blue-400 text-xs sm:text-sm truncate">
                    {msg.user}
                  </span>
                  <span className="text-[10px] text-gray-600 flex-shrink-0">
                    {new Date(msg.timestamp).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-gray-300 text-xs sm:text-sm mt-0.5 break-words">
                  {msg.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
