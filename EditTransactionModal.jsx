import React from 'react';

export default function EditTransactionModal({
  editingTx = null,
  editForm = { amount: '', description: '', category: '', date: '', time: '' },
  setEditForm = () => {},
  handleSaveEditTx = () => {},
  handleCancelEditTx = () => {},
  editLoading = false,
  editFeedback = '',
  allEditCategories = [],
  editCategorySearch = '',
  setEditCategorySearch = () => {},
}) {
  if (!editingTx) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 w-full max-w-md">
        <div className="text-lg font-semibold mb-3">Edit Transaction</div>
        <div className="space-y-2">
          <input className="w-full border rounded p-2" type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
          <input className="w-full border rounded p-2" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          <input className="w-full border rounded p-2" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
          <div className="flex gap-2">
            <input className="flex-1 border rounded p-2" type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
            <input className="flex-1 border rounded p-2" type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} />
          </div>
        </div>
        {editFeedback && <div className="text-sm mt-2">{editFeedback}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-3 py-1 rounded border" onClick={handleCancelEditTx}>Cancel</button>
          <button className="px-3 py-1 rounded bg-indigo-600 text-white" disabled={editLoading} onClick={handleSaveEditTx}>{editLoading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}