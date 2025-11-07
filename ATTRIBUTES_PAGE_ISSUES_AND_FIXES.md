# 🔧 Attributes Page Issues & Complete Fix

## 📋 **ISSUES IDENTIFIED**

### **Issue 1: Category Dropdown is Single-Select (Should be Multi-Select)**
❌ **Current:** Can only assign attribute to ONE category at a time
✅ **Expected:** Should be able to select MULTIPLE categories at once

### **Issue 2: No Edit Option for Mapped Categories**
❌ **Current:** Once an attribute is assigned to a category, you can't edit:
- Can't change the category
- Can't toggle `isRequired` status
- Can't remove the mapping

✅ **Expected:** Should be able to:
- Edit mapped categories
- Change `isRequired` status
- Remove category mappings
- Update and save changes

---

## 🔍 **ROOT CAUSE ANALYSIS**

### **Issue 1: Single-Select Dropdown**

**Current Implementation:**
```typescript
// CategoryAssignment.tsx
<Controller
  name="categoryId"
  control={control}
  render={({ field }) => (
    <Dropdown
      options={categoryOptions}
      value={field.value}  // ❌ Single value (string)
      onChange={field.onChange}
      label="Choose a category"
    />
  )}
/>
```

**Problem:**
- `Dropdown` component only supports single selection
- `categoryId` is a string, not an array
- Backend API `assignAttributeToCategory` creates ONE mapping at a time

---

### **Issue 2: No Edit Functionality**

**Current Implementation:**
```typescript
// AttributesCard.tsx - Shows mapped categories
{(attribute.categories || []).map((catRel) => (
  <div key={catRel.id} className="flex items-center gap-2 text-sm">
    <Tag size={14} className="text-gray-400" />
    <span className="font-medium text-gray-700">
      {catRel.category?.name || "Unknown Category"}
    </span>
    <span className={`px-2 py-0.5 text-xs rounded-full ${
      catRel.isRequired
        ? "bg-red-100 text-red-700"
        : "bg-green-100 text-green-700"
    }`}>
      {catRel.isRequired ? "Required" : "Optional"}
    </span>
  </div>
))}
```

**Problems:**
- ❌ No edit button
- ❌ No delete button
- ❌ No way to change `isRequired` status
- ❌ Read-only display

---

## ✅ **COMPLETE SOLUTION**

### **Solution 1: Multi-Select Dropdown**

#### **Step 1: Create MultiSelect Component**

<details>
<summary>Click to see full code</summary>

```typescript
// src/client/app/components/molecules/MultiSelect.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Check } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value = [],
  onChange,
  className,
  disabled,
  placeholder = "Select options...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        className={`flex items-center justify-between px-3 py-2 min-h-[42px]
          rounded-lg bg-white border border-gray-200
          transition-all duration-200 cursor-pointer 
          hover:border-gray-300 focus:ring-2 focus:ring-blue-100 ${className}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {value.length === 0 ? (
            <span className="text-sm text-gray-400">{placeholder}</span>
          ) : (
            selectedLabels.map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
              >
                {label}
                <X
                  size={14}
                  className="cursor-pointer hover:text-blue-900"
                  onClick={(e) => handleRemove(value[index], e)}
                />
              </span>
            ))
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-gray-400 ml-2" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute mt-1 w-full bg-white border border-gray-100 rounded-lg shadow-lg z-10 overflow-hidden"
          >
            <ul className="max-h-60 overflow-auto py-1">
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <li
                    key={option.value}
                    className={`px-3 py-2 text-sm transition-colors duration-150
                      cursor-pointer hover:bg-gray-50 flex items-center justify-between
                      ${isSelected ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
                    onClick={() => handleToggle(option.value)}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={16} className="text-blue-600" />}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiSelect;
```

</details>

#### **Step 2: Update CategoryAssignment Component**

```typescript
// src/client/app/(private)/dashboard/attributes/CategoryAssignment.tsx
import MultiSelect from "@/app/components/molecules/MultiSelect";
import { TagsIcon } from "lucide-react";
import { Controller } from "react-hook-form";

const CategoryAssignmentSection: React.FC<{
  control: any;
  handleSubmit: any;
  onAssignToCategory: any;
  categoryOptions: any[];
  isAssigningToCategory: boolean;
  watch: any;
}> = ({
  control,
  handleSubmit,
  onAssignToCategory,
  categoryOptions,
  isAssigningToCategory,
  watch,
}) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-4">
      <TagsIcon size={18} className="text-blue-600" />
      <h3 className="text-base font-semibold text-gray-800">
        Assign to Categories
      </h3>
    </div>

    <form onSubmit={handleSubmit(onAssignToCategory)} className="space-y-4">
      <div>
        <Controller
          name="categoryIds"  {/* ✅ Changed from categoryId to categoryIds */}
          control={control}
          render={({ field }) => (
            <MultiSelect  {/* ✅ Changed from Dropdown to MultiSelect */}
              label="Select Categories"
              options={categoryOptions}
              value={field.value || []}  {/* ✅ Array instead of string */}
              onChange={field.onChange}
              placeholder="Choose categories..."
            />
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <Controller
          name="isRequired"
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              id="isRequired"
              checked={field.value}
              onChange={field.onChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          )}
        />
        <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
          Mark as required attribute
        </label>
      </div>

      <button
        type="submit"
        disabled={
          isAssigningToCategory || 
          !watch("attributeId") || 
          !watch("categoryIds")?.length  {/* ✅ Check array length */}
        }
        className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAssigningToCategory ? "Assigning..." : "Assign to Categories"}
      </button>
    </form>
  </div>
);

export default CategoryAssignmentSection;
```

#### **Step 3: Update AttributeAssignment Logic**

```typescript
// src/client/app/(private)/dashboard/attributes/AttributeAssignment.tsx
const { control, handleSubmit, watch, setValue } = useForm<AssignFormData>({
  defaultValues: {
    attributeId: "",
    categoryIds: [],  // ✅ Changed to array
    productId: "",
    isRequired: false,
  },
});

// Handle category assignment - now supports multiple categories
const onAssignToCategory = async (data: AssignFormData) => {
  if (!data.attributeId || !data.categoryIds?.length) {
    showToast("Please select an attribute and at least one category", "error");
    return;
  }

  try {
    // ✅ Assign to multiple categories
    const promises = data.categoryIds.map((categoryId) =>
      assignAttributeToCategory({
        categoryId,
        attributeId: data.attributeId,
        isRequired: data.isRequired,
      })
    );

    await Promise.all(promises);
    showToast(
      `Attribute assigned to ${data.categoryIds.length} ${
        data.categoryIds.length === 1 ? "category" : "categories"
      } successfully`,
      "success"
    );
    setValue("categoryIds", []);
    setValue("isRequired", false);
  } catch (err) {
    console.error("Error assigning to categories:", err);
    showToast("Failed to assign attribute to categories", "error");
  }
};
```

---

### **Solution 2: Add Edit & Delete Functionality**

#### **Step 1: Add Backend API Endpoints**

```typescript
// src/server/src/modules/attribute/attribute.controller.ts
updateCategoryAttribute = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isRequired } = req.body;
    
    const result = await this.attributeService.updateCategoryAttribute(
      id,
      { isRequired }
    );
    
    sendResponse(res, 200, {
      data: { result },
      message: "Category attribute updated successfully",
    });
    
    this.logsService.info("Category attribute updated", {
      userId: req.user?.id,
      sessionId: req.session.id,
    });
  }
);

deleteCategoryAttribute = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    await this.attributeService.deleteCategoryAttribute(id);
    
    sendResponse(res, 200, {
      message: "Category attribute deleted successfully",
    });
    
    this.logsService.info("Category attribute deleted", {
      userId: req.user?.id,
      sessionId: req.session.id,
    });
  }
);
```

```typescript
// src/server/src/modules/attribute/attribute.service.ts
async updateCategoryAttribute(id: string, data: { isRequired: boolean }) {
  return await this.attributeRepository.updateCategoryAttribute(id, data);
}

async deleteCategoryAttribute(id: string) {
  const categoryAttribute = 
    await this.attributeRepository.findCategoryAttributeById(id);
  
  if (!categoryAttribute) {
    throw new AppError(404, "Category attribute mapping not found");
  }
  
  return await this.attributeRepository.deleteCategoryAttribute(id);
}
```

```typescript
// src/server/src/modules/attribute/attribute.repository.ts
async findCategoryAttributeById(id: string) {
  return prisma.categoryAttribute.findUnique({
    where: { id },
    include: { category: true, attribute: true },
  });
}

async updateCategoryAttribute(id: string, data: { isRequired: boolean }) {
  return prisma.categoryAttribute.update({
    where: { id },
    data,
  });
}

async deleteCategoryAttribute(id: string) {
  return prisma.categoryAttribute.delete({
    where: { id },
  });
}
```

```typescript
// src/server/src/modules/attribute/attribute.routes.ts
router.put(
  "/category-attribute/:id",
  protect,
  authorizeRole("ADMIN", "SUPERADMIN"),
  attributeController.updateCategoryAttribute
);

router.delete(
  "/category-attribute/:id",
  protect,
  authorizeRole("ADMIN", "SUPERADMIN"),
  attributeController.deleteCategoryAttribute
);
```

#### **Step 2: Add Frontend API Mutations**

```typescript
// src/client/app/store/apis/AttributeApi.ts
updateCategoryAttribute: builder.mutation({
  query: ({ id, isRequired }) => ({
    url: `/attributes/category-attribute/${id}`,
    method: "PUT",
    body: { isRequired },
  }),
  invalidatesTags: ["Attributes"],
}),

deleteCategoryAttribute: builder.mutation({
  query: (id) => ({
    url: `/attributes/category-attribute/${id}`,
    method: "DELETE",
  }),
  invalidatesTags: ["Attributes"],
}),
```

#### **Step 3: Update AttributesCard with Edit/Delete**

```typescript
// src/client/app/(private)/dashboard/attributes/AttributesCard.tsx
import { ChevronDown, ChevronRight, Plus, Tag, Trash2, Edit, Check, X } from "lucide-react";
import { useState } from "react";
import {
  useUpdateCategoryAttributeMutation,
  useDeleteCategoryAttributeMutation,
} from "@/app/store/apis/AttributeApi";
import useToast from "@/app/hooks/ui/useToast";

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

  const [updateCategoryAttribute, { isLoading: isUpdating }] =
    useUpdateCategoryAttributeMutation();
  const [deleteCategoryAttribute, { isLoading: isDeleting }] =
    useDeleteCategoryAttributeMutation();

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

  const handleDeleteCategory = async (catRelId: string) => {
    try {
      await deleteCategoryAttribute(catRelId).unwrap();
      showToast("Category mapping removed successfully", "success");
    } catch (err) {
      console.error("Error deleting category mapping:", err);
      showToast("Failed to remove category mapping", "error");
    }
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

            {/* Categories with Edit/Delete */}
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
                          className="p-1 hover:bg-green-100 text-green-600 rounded transition-colors"
                          title="Save changes"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingCategoryId(null)}
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
                          className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                          title="Remove mapping"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-100 text-red-600 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
    </div>
  );
};

export default AttributeCard;
```

---

## 📝 **IMPLEMENTATION CHECKLIST**

### **Backend Changes:**
- [ ] Add `updateCategoryAttribute` method to controller
- [ ] Add `deleteCategoryAttribute` method to controller
- [ ] Add `findCategoryAttributeById` to repository
- [ ] Add `updateCategoryAttribute` to repository
- [ ] Add `deleteCategoryAttribute` to repository
- [ ] Add routes for PUT and DELETE `/category-attribute/:id`
- [ ] Test API endpoints with Postman/curl

### **Frontend Changes:**
- [ ] Create `MultiSelect.tsx` component
- [ ] Update `CategoryAssignment.tsx` to use MultiSelect
- [ ] Update form to handle `categoryIds` array
- [ ] Update assignment logic to handle multiple categories
- [ ] Add `updateCategoryAttribute` mutation to API
- [ ] Add `deleteCategoryAttribute` mutation to API
- [ ] Update `AttributesCard.tsx` with edit/delete buttons
- [ ] Add edit mode state management
- [ ] Test multi-select functionality
- [ ] Test edit functionality
- [ ] Test delete functionality

---

## 🧪 **TESTING GUIDE**

### **Test 1: Multi-Select Categories**
1. Go to `/dashboard/attributes`
2. Select an attribute
3. Click on category dropdown
4. Select multiple categories (e.g., "Electronics", "Clothing")
5. Check "Mark as required"
6. Click "Assign to Categories"
7. ✅ Verify: Attribute appears under both categories

### **Test 2: Edit Category Mapping**
1. Find an attribute card with mapped categories
2. Click the Edit icon (pencil) next to a category
3. Toggle the "Required" checkbox
4. Click the Save icon (checkmark)
5. ✅ Verify: Badge changes from "Required" to "Optional" or vice versa

### **Test 3: Delete Category Mapping**
1. Find an attribute card with mapped categories
2. Click the Delete icon (trash) next to a category
3. ✅ Verify: Category mapping is removed
4. ✅ Verify: Attribute still exists with other mappings

---

## 🎯 **EXPECTED BEHAVIOR AFTER FIX**

### **Multi-Select:**
- ✅ Can select multiple categories at once
- ✅ Selected categories show as chips/tags
- ✅ Can remove individual selections
- ✅ Assigns attribute to all selected categories with one click

### **Edit Functionality:**
- ✅ Edit button appears next to each mapped category
- ✅ Click edit to enter edit mode
- ✅ Can toggle "Required" status
- ✅ Save button commits changes
- ✅ Cancel button discards changes

### **Delete Functionality:**
- ✅ Delete button appears next to each mapped category
- ✅ Click delete to remove mapping
- ✅ Confirmation (optional)
- ✅ Mapping removed from database

---

## 📊 **BEFORE vs AFTER**

### **BEFORE:**
```
❌ Single category selection
❌ No way to edit mappings
❌ No way to delete mappings
❌ Must delete entire attribute to change categories
```

### **AFTER:**
```
✅ Multi-category selection
✅ Edit button for each mapping
✅ Delete button for each mapping
✅ Toggle Required/Optional status
✅ Full CRUD operations on category mappings
```

---

## 🚀 **QUICK START**

Want me to implement these fixes for you? I can:

1. ✅ Create the MultiSelect component
2. ✅ Update all frontend files
3. ✅ Add backend API endpoints
4. ✅ Update routes and controllers
5. ✅ Test the implementation

Just say "implement the fixes" and I'll do it all for you!

---

**Last Updated:** 2025-01-07
**Status:** Ready for Implementation
