import { Ticket } from "@/lib/types";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface Props {
  tickets: Ticket[];
  onTicketUpdate?: () => void;
}

interface EditFormData {
  appliance_id: number;
  problem_type_id?: number;
  brand?: string;
  model?: string;
  description: string;
  urgency?: string;
  address: string;
  preferred_time_slot?: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'closed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getUrgencyColor = (urgency?: string) => {
  if (!urgency) return 'bg-gray-100 text-gray-800';
  switch (urgency.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-orange-100 text-orange-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TicketTable({ tickets, onTicketUpdate }: Props) {
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [appliances, setAppliances] = useState<any[]>([]);
  const [problemTypes, setProblemTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsLoading(true);
    
    try {
      // Fetch appliances and problem types for the form
      const [appliancesRes, problemTypesRes] = await Promise.all([
        apiFetch('/appliances') as Promise<any[]>,
        apiFetch('/problem-types') as Promise<any[]>
      ]);
      setAppliances(appliancesRes || []);
      setProblemTypes(problemTypesRes || []);
    } catch (error) {
      console.error('Failed to fetch form data:', error);
      setAppliances([]);
      setProblemTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to cancel this ticket?')) return;
    
    try {
      await apiFetch(`/tickets/${ticketId}`, {
        method: 'DELETE',
      });
      onTicketUpdate?.();
    } catch (error) {
      alert('Failed to cancel ticket');
    }
  };

  const handleUpdate = async (formData: EditFormData) => {
    if (!editingTicket) return;
    
    try {
      await apiFetch(`/tickets/${editingTicket.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditingTicket(null);
      onTicketUpdate?.();
    } catch (error) {
      alert('Failed to update ticket');
    }
  };
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No tickets found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Urgency
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                {ticket.id.slice(0, 8)}...
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(ticket.urgency)}`}>
                  {ticket.urgency || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(ticket.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  {ticket.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleEdit(ticket)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                        title="Edit ticket"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Cancel ticket"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Ticket</h3>
              <EditTicketForm
                ticket={editingTicket}
                appliances={appliances}
                problemTypes={problemTypes}
                isLoading={isLoading}
                onSubmit={handleUpdate}
                onCancel={() => setEditingTicket(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EditTicketFormProps {
  ticket: Ticket;
  appliances: any[];
  problemTypes: any[];
  isLoading: boolean;
  onSubmit: (data: EditFormData) => void;
  onCancel: () => void;
}

function EditTicketForm({ ticket, appliances, problemTypes, isLoading, onSubmit, onCancel }: EditTicketFormProps) {
  const [formData, setFormData] = useState<EditFormData>({
    appliance_id: ticket.appliance_id || 0,
    problem_type_id: ticket.problem_type_id,
    brand: ticket.brand || '',
    model: ticket.model || '',
    description: ticket.description,
    urgency: ticket.urgency,
    address: ticket.address || '',
    preferred_time_slot: ticket.preferred_time_slot,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (appliances.length === 0) {
    return <div className="text-center py-4 text-red-600">Failed to load appliances. Please try again.</div>;
  }

  if (appliances.length === 0) {
    return <div className="text-center py-4 text-red-600">Failed to load appliances. Please try again.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Appliance</label>
        <select
          value={formData.appliance_id || ''}
          onChange={(e) => setFormData({...formData, appliance_id: parseInt(e.target.value) || 0})}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
          <option value="">Choose your appliance...</option>
          {appliances.map((appliance) => (
            <option key={appliance.id} value={appliance.id}>
              {appliance.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Problem Type</label>
        <select
          value={formData.problem_type_id || ''}
          onChange={(e) => setFormData({...formData, problem_type_id: e.target.value ? parseInt(e.target.value) : undefined})}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select problem type (optional)</option>
          {problemTypes.filter(type => type.label && type.label.trim()).map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => setFormData({...formData, brand: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Urgency</label>
        <select
          value={formData.urgency || ''}
          onChange={(e) => setFormData({...formData, urgency: e.target.value || undefined})}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select urgency (optional)</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preferred Time Slot</label>
        <input
          type="text"
          value={formData.preferred_time_slot || ''}
          onChange={(e) => setFormData({...formData, preferred_time_slot: e.target.value})}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
        >
          Update Ticket
        </button>
      </div>
    </form>
  );
}
