import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Eye, X, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { AuditLog } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner, EmptyState } from '../../components/ui/LoadingStates';
import { formatDateTime, getActionBadgeClass, getRiskBg } from '../../utils/helpers';

const PAGE_SIZE = 8;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    auditService.getAuditLogs().then(l => { setLogs(l); setLoading(false); });
  }, []);

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => l.event.toLowerCase().includes(q) || l.user.toLowerCase().includes(q) || l.threatType.toLowerCase().includes(q));
    }
    if (filterEvent !== 'all') result = result.filter(l => l.eventType === filterEvent);
    if (filterAction !== 'all') result = result.filter(l => l.action === filterAction);
    if (filterRisk !== 'all') {
      if (filterRisk === 'high') result = result.filter(l => l.riskScore >= 70);
      else if (filterRisk === 'medium') result = result.filter(l => l.riskScore >= 30 && l.riskScore < 70);
      else result = result.filter(l => l.riskScore < 30);
    }
    return result;
  }, [logs, searchQuery, filterEvent, filterAction, filterRisk]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => { setSearchQuery(''); setFilterEvent('all'); setFilterAction('all'); setFilterRisk('all'); setPage(1); };
  const hasFilters = searchQuery || filterEvent !== 'all' || filterAction !== 'all' || filterRisk !== 'all';

  if (loading) return <LoadingSpinner size="lg" text="Loading audit logs..." />;

  return (
    <div className="page-container animate-fadeIn">
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} placeholder="Search events, users, threats..." className="input-field pl-10" />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filterEvent} onChange={e => { setFilterEvent(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
              <option value="all">All Events</option>
              <option value="prompt_injection">Prompt Injection</option>
              <option value="jailbreak">Jailbreak</option>
              <option value="malicious_document">Malicious Document</option>
              <option value="prompt_leakage">Prompt Leakage</option>
              <option value="unsafe_output">Unsafe Output</option>
              <option value="safe_query">Safe Query</option>
            </select>
            <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
              <option value="all">All Actions</option>
              <option value="blocked">Blocked</option>
              <option value="allowed">Allowed</option>
              <option value="flagged">Flagged</option>
            </select>
            <select value={filterRisk} onChange={e => { setFilterRisk(e.target.value); setPage(1); }} className="input-field w-auto text-sm">
              <option value="all">All Risk Levels</option>
              <option value="high">High (70+)</option>
              <option value="medium">Medium (30-69)</option>
              <option value="low">Low (0-29)</option>
            </select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}><X className="w-4 h-4" /> Clear</Button>
            )}
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">{filteredLogs.length} results found</div>
      </div>

      {/* Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState icon={<Search className="w-8 h-8" />} title="No audit logs found" description="Try adjusting your filters" action={hasFilters ? <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button> : undefined} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Timestamp</th>
                  <th className="table-header">User</th>
                  <th className="table-header">Event</th>
                  <th className="table-header">Threat Type</th>
                  <th className="table-header">Risk Score</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Clock className="w-3.5 h-3.5" />{formatDateTime(log.timestamp)}
                      </div>
                    </td>
                    <td className="table-cell font-medium text-gray-900">{log.user}</td>
                    <td className="table-cell max-w-[200px] truncate">{log.event}</td>
                    <td className="table-cell"><span className="badge-neutral">{log.threatType}</span></td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getRiskBg(log.riskScore)}`}>
                        {log.riskScore}
                      </span>
                    </td>
                    <td className="table-cell"><span className={getActionBadgeClass(log.action)}>{log.action}</span></td>
                    <td className="table-cell"><span className="badge-neutral capitalize">{log.status}</span></td>
                    <td className="table-cell text-right">
                      <button onClick={() => setSelectedLog(log)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-500">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100 text-gray-500'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-500">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Log Details" size="lg">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Event', value: selectedLog.event },
                { label: 'User', value: selectedLog.user },
                { label: 'Timestamp', value: formatDateTime(selectedLog.timestamp) },
                { label: 'Threat Type', value: selectedLog.threatType },
                { label: 'Action', value: selectedLog.action },
                { label: 'Status', value: selectedLog.status },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: selectedLog.riskScore >= 70 ? '#dc2626' : selectedLog.riskScore >= 30 ? '#d97706' : '#16a34a' }}>
                  {selectedLog.riskScore}
                </p>
                <p className="text-xs text-gray-500">Risk Score</p>
              </div>
              <div className="flex-1">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${selectedLog.riskScore}%`, backgroundColor: selectedLog.riskScore >= 70 ? '#dc2626' : selectedLog.riskScore >= 30 ? '#d97706' : '#16a34a' }} />
                </div>
              </div>
            </div>
            {selectedLog.input && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Input / Event Content</p>
                <pre className="text-sm text-gray-800 bg-gray-50 rounded-xl p-3 whitespace-pre-wrap font-mono">{selectedLog.input}</pre>
              </div>
            )}
            {selectedLog.detectionReason && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Detection Reason</p>
                <p className="text-sm text-gray-800 bg-warning-50 rounded-xl p-3">{selectedLog.detectionReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
