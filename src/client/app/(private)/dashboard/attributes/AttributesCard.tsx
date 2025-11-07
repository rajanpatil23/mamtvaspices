import { ChevronDown, ChevronRight, Plus, Tag, Trash2, Edit, Check, X } from "lucide-react";
import { useState } from "react";
import {
  useUpdateCategoryAttributeMutation,
  useDeleteCategoryAttributeMutation,
  useAssignAttributeToCategoryMutation,
} from "@/app/store/apis/AttributeApi";
import { useGetAllCategoriesQuery } from "@/app/store/apis/CategoryApi";
import useToast from "@/app/hooks/ui/useToast";
import MultiSelect from "@/app/components/molecules/MultiSelect";
import type { AttributeCardProps } from "./types";

const AttributeCard = ({
  attribute,
  onDelete,
  onAddValue,
  newValue,
  setNewValue,
  isCreatingValue,
  onDeleteValue,
}: AttributeCardProps) => {
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editIsRequired, setEditIsRequired] = useState(false);
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const { data: categoriesData } = useGetAllCategoriesQuery(undefined);
  const [updateCategoryAttribute, { isLoading: isUpdating }] =
    useUpdateCategoryAttributeMutation();
  const [deleteCategoryAttribute, { isLoading: isDeleting }] =
    useDeleteCategoryAttributeMutation();
  const [assignAttributeToCategory, { isLoading: isAssigning }] =
    useAssignAttributeToCategoryMutation();

  // Get all available categories
  const allCategories =
    categoriesData?.categories?.map((cat: any) => ({
      label: cat.name,
      value: cat.id,
    })) || [];

  // Get currently assigned category IDs
  const currentCategoryIds = (attribute.categories || [])
    .map((c) => c.category?.id)
    .filter((id): id is string => !!id);

  const handleAddValue = () => {
    onAddValue(attribute.id);
    setShowAddForm(false);
  };

  const handleEditCategory = (catRel: any) => {
    setEditingCategoryId(catRel.id);
    setEditIsRequired(catRel.isRequired);
  };

  const handleSaveEdit = async (catRelId: string) => {
    try {
      await updateCategoryAttribute({
        id: catRelId,
        isRequired: editIsRequired,
      }).unwrap();
      showToast("Category mapping updated successfully", "success");
      setEditingCategoryId(null);
    } catch (err) {
      console.error("Error updating category mapping:", err);
      showToast("Failed to update category mapping", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditIsRequired(false);
  };

  const handleDeleteCategory = async (catRelId: string) => {
    if (!confirm("Are you sure you want to remove this category mapping?")) {
      return;
    }

    try {
      await deleteCategoryAttribute(catRelId).unwrap();
      showToast("Category mapping removed successfully", "success");
    } catch (err) {
      console.error("Error deleting category mapping:", err);
      showToast("Failed to remove category mapping", "error");
    }
  };

  const handleEditCategories = () => {
    setIsEditingCategories(true);
    setSelectedCategoryIds(currentCategoryIds);
  };

  const handleSaveCategories = async () => {
    try {
      // Find categories to add (in selected but not in current)
      const categoriesToAdd = selectedCategoryIds.filter(
        (id) => !currentCategoryIds.includes(id)
      );

      // Find categories to remove (in current but not in selected)
      const categoriesToRemove = (attribute.categories || []).filter(
        (catRel) => catRel.category?.id && !selectedCategoryIds.includes(catRel.category.id)
      );

      // Add new categories
      const addPromises = categoriesToAdd.map((categoryId) =>
        assignAttributeToCategory({
          categoryId,
          attributeId: attribute.id,
          isRequired: false,
        })
      );

      // Remove unselected categories
      const removePromises = categoriesToRemove.map((catRel) =>
        deleteCategoryAttribute(catRel.id)
      );

      await Promise.all([...addPromises, ...removePromises]);

      showToast(
        `Categories updated successfully (${categoriesToAdd.length} added, ${categoriesToRemove.length} removed)`,
        "success"
      );
      setIsEditingCategories(false);
    } catch (err) {
      console.error("Error updating categories:", err);
      showToast("Failed to update categories", "error");
    }
  };

  const handleCancelEditCategories = () => {
    setIsEditingCategories(false);
    setSelectedCategoryIds([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {attribute.name}
              </h3>
            </div>

            {/* Edit Categories Mode */}
            {isEditingCategories ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Select Categories
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveCategories}
                      disabled={isAssigning || isDeleting}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Check size={14} />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEditCategories}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
                <MultiSelect
                  options={allCategories}
                  value={selectedCategoryIds}
                  onChange={setSelectedCategoryIds}
                  placeholder="Select categories..."
                />
              </div>
            ) : (
              <>
                {/* Categories List with Edit/Delete */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Categories ({attribute.categories?.length || 0})
                  </span>
                  <button
                    onClick={handleEditCategories}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Edit size={12} />
                    Edit Categories
                  </button>
                </div>
                <div className="space-y-2">
                  {(attribute.categories || []).map((catRel) => (
                <div
                  key={catRel.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Tag size={14} className="text-gray-400" />
                    <span className="font-medium text-gray-700 text-sm">
                      {catRel.category?.name || "Unknown Category"}
                    </span>

                    {editingCategoryId === catRel.id ? (
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={editIsRequired}
                          onChange={(e) => setEditIsRequired(e.target.checked)}
                          className="h-3 w-3"
                        />
                        Required
                      </label>
                    ) : (
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          catRel.isRequired
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {catRel.isRequired ? "Required" : "Optional"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {editingCategoryId === catRel.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(catRel.id)}
                          disabled={isUpdating}
                          className="p-1 hover:bg-green-100 text-green-600 rounded transition-colors disabled:opacity-50"
                          title="Save changes"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 hover:bg-gray-200 text-gray-600 rounded transition-colors"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditCategory(catRel)}
                          className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                          title="Edit mapping"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(catRel.id)}
                          disabled={isDeleting}
                          className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors disabled:opacity-50"
                          title="Remove mapping"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                  ))}
                  {(!attribute.categories || attribute.categories.length === 0) && (
                    <p className="text-sm text-gray-500 italic">
                      No categories assigned
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-100 text-red-600 rounded-full transition-colors"
              aria-label="Delete attribute"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Values ({attribute.values?.length || 0})
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            aria-label="Add new value"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {/* Values Display */}
        {isExpanded && (
          <div className="space-y-2 mb-4">
            {(attribute.values || []).length > 0 ? (
              attribute.values!.map((value) => (
                <div
                  key={value.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                >
                  <span className="text-sm text-gray-700">{value.value}</span>
                  <button
                    onClick={() => onDeleteValue(value.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors"
                    aria-label={`Delete value ${value.value}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">
                No values added yet
              </p>
            )}
          </div>
        )}

        {/* Quick Preview of Values */}
        {!isExpanded && attribute.values && attribute.values.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {attribute.values.slice(0, 3).map((value) => (
              <span
                key={value.id}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {value.value}
              </span>
            ))}
            {attribute.values.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{attribute.values.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Add Value Form */}
        {showAddForm && (
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter value..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="New value input"
              />
              <button
                onClick={handleAddValue}
                disabled={isCreatingValue || !newValue.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                aria-label="Add value"
              >
                {isCreatingValue ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeCard;
