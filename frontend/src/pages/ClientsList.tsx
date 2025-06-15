// pages/ClientsList.tsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, PlusCircle, ChevronDown } from 'lucide-react';
import { ClientCard } from '../components/ClientCard';
import { StatusBadge } from '../components/StatusBadge';
import { useClientsStore } from '../store/clientsStore';
import { ClientStatus } from '../types';

export const ClientsList = () => {
const { clients, fetchClients, isLoading } = useClientsStore();
const [searchQuery, setSearchQuery] = React.useState('');
const [filterStatus, setFilterStatus] = React.useState<ClientStatus | ''>('');
const [filteredClients, setFilteredClients] = React.useState(clients);
const [isFilterOpen, setIsFilterOpen] = React.useState(false);
const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0 });
const filterButtonRef = useRef<HTMLButtonElement>(null);

// Fetch clients on component mount
useEffect(() => {
fetchClients();
}, [fetchClients]);

// Possible statuses for filtering
const statuses: ClientStatus[] = ['New', 'In Progress', 'Approved', 'Rejected', 'Disbursed', 'Completed'];

// Filter and search clients
useEffect(() => {
let result = [...clients];

// Apply status filter
if (filterStatus) {
result = result.filter(client => client.status === filterStatus);
}

// Apply search query
if (searchQuery) {
const query = searchQuery.toLowerCase();
result = result.filter(client =>
client.customer_name.toLowerCase().includes(query) ||
client.phone_number.toLowerCase().includes(query) ||
client.business_name.toLowerCase().includes(query) ||
client.area.toLowerCase().includes(query)
);
}

setFilteredClients(result);
}, [clients, searchQuery, filterStatus]);

// Calculate dropdown position
const updateDropdownPosition = () => {
if (filterButtonRef.current) {
const rect = filterButtonRef.current.getBoundingClientRect();
setDropdownPosition({
top: rect.bottom + window.scrollY + 8,
left: rect.right - 256 // 256px is dropdown width, align right edge
});
}
};

// Calculate dropdown position when opening
const handleFilterToggle = () => {
if (!isFilterOpen) {
updateDropdownPosition();
}
setIsFilterOpen(!isFilterOpen);
};

// Update position on scroll and resize
useEffect(() => {
if (isFilterOpen) {
const handleScroll = () => updateDropdownPosition();
const handleResize = () => updateDropdownPosition();

window.addEventListener('scroll', handleScroll);
window.addEventListener('resize', handleResize);

return () => {
window.removeEventListener('scroll', handleScroll);
window.removeEventListener('resize', handleResize);
};
}
}, [isFilterOpen]);

// Close dropdown when clicking outside
useEffect(() => {
const handleClickOutside = (event: MouseEvent) => {
const target = event.target as HTMLElement;
if (!target.closest('.filter-dropdown-container') && !target.closest('.dropdown-portal')) {
setIsFilterOpen(false);
}
};

if (isFilterOpen) {
document.addEventListener('click', handleClickOutside);
return () => document.removeEventListener('click', handleClickOutside);
}
}, [isFilterOpen]);

if (isLoading) {
return (
<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
<div className="flex flex-col items-center space-y-4">
<div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 shadow-lg"></div>
<p className="text-slate-600 font-medium">Loading clients...</p>
</div>
</div>
);
}

return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
{/* Header section */}
<div className="mb-8">
<div className="text-center mb-8">
<h1 className="text-4xl font-bold text-slate-900 mb-2">Client Management</h1>
<p className="text-lg text-slate-600">Manage and track all your clients in one place</p>
</div>

<div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20">
<div className="p-8">
<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-6">
{/* Search Bar */}
<div className="w-full lg:w-96">
<div className="relative group">
<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
<Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
</div>
<input
type="text"
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-sm font-medium"
placeholder="Search by name, phone, business, or area..."
/>
</div>
</div>

{/* Filter and Add Button */}
<div className="flex items-center space-x-4">
{/* Filter dropdown */}
<div className="relative filter-dropdown-container">
<button
ref={filterButtonRef}
type="button"
className="inline-flex items-center px-6 py-3.5 border-2 border-slate-200 shadow-lg text-sm font-semibold rounded-xl text-slate-700 bg-white/70 backdrop-blur-sm hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
onClick={handleFilterToggle}
>
<Filter className="-ml-1 mr-3 h-5 w-5 text-slate-500" />
{filterStatus || 'All Statuses'}
<ChevronDown className={`ml-3 h-5 w-5 text-slate-500 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
</button>
</div>

{/* Add Client Button */}
<Link
to="/clients/add"
className="inline-flex items-center px-6 py-3.5 border border-transparent text-sm font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform hover:scale-105 transition-all duration-200"
>
<PlusCircle className="-ml-1 mr-3 h-5 w-5" />
Add New Client
</Link>
</div>
</div>
</div>
</div>
</div>

{/* Results summary */}
<div className="mb-6">
<div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
<p className="text-sm font-medium text-slate-700 flex items-center">
<span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-xs font-bold mr-3">
{filteredClients.length}
</span>
Showing {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
{filterStatus && (
<span className="ml-2 flex items-center">
with status <StatusBadge status={filterStatus} size="sm" />
</span>
)}
{searchQuery && (
<span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium">
matching "{searchQuery}"
</span>
)}
</p>
</div>
</div>

{/* Client grid */}
{filteredClients.length > 0 ? (
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
{filteredClients.map((client) => (
<ClientCard key={client.id} client={client} />
))}
</div>
) : (
<div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
<div className="max-w-md mx-auto">
<div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
<svg
className="w-10 h-10 text-slate-400"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
xmlns="http://www.w3.org/2000/svg"
>
<path
strokeLinecap="round"
strokeLinejoin="round"
strokeWidth="2"
d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
></path>
</svg>
</div>
<h3 className="text-xl font-bold text-slate-900 mb-2">No clients found</h3>
<p className="text-slate-600 mb-8">
{searchQuery || filterStatus
? "Try adjusting your search or filter to find what you're looking for."
: 'Get started by adding your first client to begin managing your business relationships.'}
</p>
<Link
to="/clients/add"
className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transform hover:scale-105 transition-all duration-200"
>
<PlusCircle className="-ml-1 mr-2 h-5 w-5" />
Add Your First Client
</Link>
</div>
</div>
)}
</div>

{/* Portal-style dropdown rendered at document body level */}
{isFilterOpen && (
<div className="dropdown-portal">
<div 
className="fixed inset-0 z-[9998]" 
onClick={() => setIsFilterOpen(false)}
/>
<div 
className="absolute z-[9999] w-64 rounded-xl shadow-2xl bg-white ring-1 ring-slate-200 border border-white/20"
style={{
top: `${dropdownPosition.top}px`,
left: `${dropdownPosition.left}px`,
}}
role="menu"
aria-orientation="vertical"
aria-labelledby="filter-button"
>
<div className="p-2">
<button
role="menuitem"
onClick={() => {
setFilterStatus('');
setIsFilterOpen(false);
}}
className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150 ${
!filterStatus 
? 'bg-blue-50 text-blue-700 shadow-sm' 
: 'text-slate-700 hover:bg-slate-50'
}`}
>
All Statuses
</button>
{statuses.map((status) => (
<button
key={status}
role="menuitem"
onClick={() => {
setFilterStatus(status);
setIsFilterOpen(false);
}}
className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150 ${
filterStatus === status 
? 'bg-blue-50 text-blue-700 shadow-sm' 
: 'text-slate-700 hover:bg-slate-50'
}`}
>
<div className="flex items-center">
<StatusBadge status={status} size="sm" />
<span className="ml-3">{status}</span>
</div>
</button>
))}
</div>
</div>
</div>
)}
</div>
);
};