import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaTag, FaKey } from 'react-icons/fa';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CategoryManager = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', keywords: [] });
  const [newKeyword, setNewKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Add this constant for the special category
  const OTHER_ACCOUNT_KEY = 'other-account-special';
  const OTHER_ACCOUNT_DEFAULT_NAME = 'Other Account';

  // Load categories from Firebase
  const loadCategories = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const categoriesRef = collection(db, 'users', user.uid, 'categories');
      const querySnapshot = await getDocs(categoriesRef);
      let categoriesData = [];
      let foundOtherAccount = false;
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        if (data.isOtherAccount) foundOtherAccount = true;
        categoriesData.push(data);
      });
      // If not found, create it
      if (!foundOtherAccount) {
        const otherCat = {
          id: OTHER_ACCOUNT_KEY,
          name: OTHER_ACCOUNT_DEFAULT_NAME,
          keywords: ['other', 'account', 'misc'],
          isOtherAccount: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(categoriesRef, OTHER_ACCOUNT_KEY), otherCat);
        categoriesData.push(otherCat);
      }
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      setFeedback({ type: 'error', message: 'Failed to load categories' });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, [user]);

  // Save category to Firebase
  const saveCategory = async (categoryData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const categoriesRef = collection(db, 'users', user.uid, 'categories');
      const categoryId = categoryData.id || Date.now().toString();
      await setDoc(doc(categoriesRef, categoryId), {
        name: categoryData.name,
        keywords: categoryData.keywords,
        isOtherAccount: categoryData.isOtherAccount || false,
        createdAt: categoryData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      setFeedback({ type: 'success', message: 'Category saved successfully!' });
      loadCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      setFeedback({ type: 'error', message: 'Failed to save category' });
    }
    setLoading(false);
  };

  // Delete category from Firebase
  const deleteCategory = async (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    if (cat && cat.isOtherAccount) {
      setFeedback({ type: 'error', message: 'Cannot delete the Other Account category.' });
      return;
    }
    if (!user || !window.confirm('Are you sure you want to delete this category?')) return;
    
    setLoading(true);
    try {
      const categoryRef = doc(db, 'users', user.uid, 'categories', categoryId);
      await deleteDoc(categoryRef);
      
      setFeedback({ type: 'success', message: 'Category deleted successfully!' });
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setFeedback({ type: 'error', message: 'Failed to delete category' });
    }
    setLoading(false);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      setFeedback({ type: 'error', message: 'Category name is required' });
      return;
    }
    
    if (newCategory.keywords.length === 0) {
      setFeedback({ type: 'error', message: 'At least one keyword is required' });
      return;
    }

    const categoryToSave = editingCategory 
      ? { ...editingCategory, name: newCategory.name, keywords: newCategory.keywords }
      : newCategory;
    
    saveCategory(categoryToSave);
  };

  // Add keyword to current category
  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    if (newCategory.keywords.includes(newKeyword.trim().toLowerCase())) {
      setFeedback({ type: 'error', message: 'Keyword already exists' });
      return;
    }
    
    setNewCategory(prev => ({
      ...prev,
      keywords: [...prev.keywords, newKeyword.trim().toLowerCase()]
    }));
    setNewKeyword('');
  };

  // Remove keyword from current category
  const removeKeyword = (keywordToRemove) => {
    setNewCategory(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keywordToRemove)
    }));
  };

  // Start editing a category
  const startEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      keywords: [...category.keywords]
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingCategory(null);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setNewCategory({ name: '', keywords: [] });
    setNewKeyword('');
    setEditingCategory(null);
  };

  // Clear feedback after 3 seconds
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  return (
    <Card className="bg-white dark:bg-gray-900 xl:col-span-2 mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <FaTag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Category & Keyword Manager
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create custom categories and keywords to automatically categorize your transactions
        </p>
      </CardHeader>
      <CardContent>
        {/* Feedback Message */}
        {feedback.message && (
          <div className={`mb-4 p-3 rounded-md ${
            feedback.type === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Add/Edit Category Form */}
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <FaTag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category Name
              </label>
              <Input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Coffee Shops, Online Shopping"
                className="w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Keyword
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g., starbucks, coffee"
                  className="flex-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                />
                <Button
                  type="button"
                  onClick={addKeyword}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-800 dark:hover:bg-indigo-900"
                >
                  <FaPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Keywords Display */}
          {newCategory.keywords.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Keywords ({newCategory.keywords.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {newCategory.keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                  >
                    <FaKey className="h-3 w-3 mr-1" />
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-2 bg-white text-gray-800 rounded-full p-1 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 hover:text-red-600"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || !newCategory.name.trim() || newCategory.keywords.length === 0}
              className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <FaSave className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
            </Button>
            {editingCategory && (
              <Button
                type="button"
                onClick={cancelEdit}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <FaTimes className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>

        {/* Categories List */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Categories</h3>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <FaTag className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No custom categories yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Create your first category above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FaTag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</h4>
                      <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                        {category.keywords.length} keywords
                      </Badge>
                      {category.isOtherAccount && (
                        <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Special</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(category)}
                        className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        <FaEdit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteCategory(category.id)}
                        className={`border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900 ${category.isOtherAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={category.isOtherAccount}
                      >
                        <FaTrash className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.keywords.map((keyword, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      >
                        <FaKey className="h-3 w-3 mr-1" />
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager; 