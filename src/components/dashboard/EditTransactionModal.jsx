export default function EditTransactionModal({
  transaction = null,
  editForm = { amount: '', description: '', category: '', date: '', time: '', isCounted: true, currency: 'THB' },
  setEditForm = () => {},
  onSave = () => {},
  onClose = () => {},
  isEditLoading = false,
  editFeedback = '',
  allCategories = [],
  allUserCurrencies = [],
  editCategorySearch = '',
  setEditCategorySearch = () => {},
  modalRef
}) {
  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] ${transaction ? '' : 'hidden'}`}> {/* Added hidden class */}
      {transaction && ( // Conditionally render inner content
        <div ref={modalRef} className="bg-black text-white border border-gray-700 rounded-lg p-4 w-full max-w-md">
          <div className="text-lg font-semibold mb-3">Edit Transaction</div>
          <div className="space-y-2">
            <input className="w-full border rounded p-2 bg-gray-800 text-white" type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
            <input className="w-full border rounded p-2 bg-gray-800 text-white" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            <input className="w-full border rounded p-2 bg-gray-800 text-white" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
            <div className="flex gap-2">
              <input className="flex-1 border rounded p-2 bg-gray-800 text-white" type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
              <input className="flex-1 border rounded p-2 bg-gray-800 text-white" type="time" value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-white">Count</label>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded ${editForm.isCounted ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setEditForm({ ...editForm, isCounted: true })}
                >
                  Count
                </button>
                <button
                  className={`px-3 py-1 rounded ${!editForm.isCounted ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  onClick={() => setEditForm({ ...editForm, isCounted: false })}
                >
                  Not Count
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-white">Payment Method</label>
              <select className="w-full border rounded p-2 bg-gray-800 text-white" value={editForm.paymentMethod} onChange={(e) => {
                setEditForm({ ...editForm, paymentMethod: e.target.value });
              }}>
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="between_account">Between Account</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-white">Currency</label>
              <select className="w-full border rounded p-2 bg-gray-800 text-white" value={editForm.currency} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}>
                {allUserCurrencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>
          {editFeedback && <div className="text-sm mt-2">{editFeedback}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button className="px-3 py-1 rounded border" onClick={onClose}>Cancel</button>
            <button className="px-3 py-1 rounded bg-indigo-600 text-white" disabled={isEditLoading} onClick={onSave}>{isEditLoading ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      )}
    </div>
  );
}