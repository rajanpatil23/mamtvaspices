// Shared type definitions for Attributes feature

export interface Category {
  id: string;
  name: string;
}

export interface CategoryAttribute {
  id: string;
  category?: Category;
  isRequired: boolean;
}

export interface AttributeValue {
  id: string;
  value: string;
}

export interface Attribute {
  id: string;
  name: string;
  categories?: CategoryAttribute[];
  values?: AttributeValue[];
}

export interface AttributeCardProps {
  attribute: Attribute;
  onDelete: () => void;
  onAddValue: (attributeId: string) => void;
  newValue: string;
  setNewValue: (value: string) => void;
  isCreatingValue: boolean;
  onDeleteValue: (valueId: string) => void;
}
