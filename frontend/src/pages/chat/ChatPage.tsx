import { useState, useEffect, useRef } from 'react';
import {
  Send, Plus, Trash2, Copy, RefreshCw, MessageSquare, Shield, FileText,
  CheckCircle, Loader2, MoreVertical, Clock
} from 'lucide-react';
import { chatService } from '../../services/chatService';
import { ChatConversation, ChatMessage } from '../../types';
import { Button } from '../../components/ui/Button';
import { showToast } from '../../components/ui/Toast';
import { cn, timeAgo } from '../../utils/helpers';

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatService.getConversations().then(convs => {
      setConversations(convs);
      if (convs.length > 0) setActiveConv(convs[0].id);
      setLoading(false);
    });
  }, []);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeConv, conversations]);

  const activeConversation = conversations.find(c => c.id === activeConv);

  const handleNewConversation = async () => {
    const conv = await chatService.createConversation();
    setConversations(prev => [conv, ...prev]);
    setActiveConv(conv.id);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConv || sending) return;
    const content = input.trim();
    setInput('');
    
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`, role: 'user', content, timestamp: new Date().toISOString(),
      securityStatus: 'safe', riskScore: Math.floor(Math.random() * 10),
    };

    setConversations(prev => prev.map(c => c.id === activeConv ? { ...c, messages: [...c.messages, userMsg] } : c));
    setSending(true);

    try {
      const response = await chatService.sendMessage(activeConv, content);
      setConversations(prev => prev.map(c => c.id === activeConv
        ? { ...c, messages: [...c.messages.filter(m => m.id !== response.id), response], title: c.messages.length <= 1 ? content.slice(0, 40) : c.title }
        : c
      ));
    } catch {
      showToast({ type: 'error', title: 'Failed to send message' });
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast({ type: 'success', title: 'Copied to clipboard' });
  };

  const handleDelete = async (id: string) => {
    await chatService.deleteConversation(id);
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConv === id) setActiveConv(conversations[0]?.id || null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className={cn(
        'border-r border-gray-100 bg-white flex flex-col transition-all duration-300 flex-shrink-0',
        sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
      )}>
        <div className="p-3 border-b border-gray-100">
          <Button onClick={handleNewConversation} variant="primary" className="w-full" size="sm" icon={<Plus className="w-4 h-4" />}>
            New Conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={cn(
                'group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all',
                activeConv === conv.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-700'
              )}
              onClick={() => setActiveConv(conv.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs text-gray-400">{conv.messages.length} messages</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 text-gray-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {conversations.length === 0 && !loading && (
            <div className="text-center py-8 text-sm text-gray-400">No conversations yet</div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <MoreVertical className="w-5 h-5" />
            </button>
            <h3 className="font-semibold text-gray-900 truncate">{activeConversation?.title || 'SecureRAG Chat'}</h3>
          </div>
          {activeConversation && (
            <div className="flex items-center gap-1.5">
              <span className="badge-safe"><Shield className="w-3 h-3 mr-1" />Secure Mode</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-cyber-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Start a Secure Conversation</h3>
              <p className="text-sm text-gray-500 max-w-sm">Ask questions about your documents. Every query passes through the SecureRAG security pipeline.</p>
            </div>
          ) : (
            activeConversation.messages.map(msg => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : '')}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyber-500 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={cn('max-w-2xl', msg.role === 'user' ? 'order-first' : '')}>
                  <div className={cn(
                    'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  )}>
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-3 mt-2 ml-1">
                      {msg.securityStatus && (
                        <span className="badge-safe text-[10px]">
                          <Shield className="w-3 h-3 mr-0.5" />
                          {msg.securityStatus === 'safe' ? 'Safe' : msg.securityStatus}
                        </span>
                      )}
                      {msg.riskScore !== undefined && (
                        <span className="text-[10px] text-gray-400">Risk: {msg.riskScore}</span>
                      )}
                      {msg.retrievedDocs && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><FileText className="w-3 h-3" />{msg.retrievedDocs} docs</span>
                      )}
                      {msg.responseValidated && (
                        <span className="text-[10px] text-success-600 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" />Validated</span>
                      )}
                      <button onClick={() => handleCopy(msg.content)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="mt-1 ml-1">
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />{timeAgo(msg.timestamp)}
                    </span>
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-600">U</span>
                  </div>
                )}
              </div>
            ))
          )}
          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyber-500 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing prompt & generating secure response...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 px-4 py-3 bg-white">
          <div className="flex items-end gap-2 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your documents..."
                rows={1}
                className="input-field resize-none pr-4 min-h-[44px] max-h-[120px]"
                style={{ height: 'auto', overflow: 'hidden' }}
                onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 120) + 'px'; }}
              />
            </div>
            <Button onClick={handleSend} disabled={!input.trim() || sending} loading={sending} icon={<Send className="w-4 h-4" />} size="sm">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
