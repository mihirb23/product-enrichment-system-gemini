import React, { useState, useCallback } from 'react';
import { Search, Filter, Plus, RefreshCw, Settings, Edit, Trash2, Upload, CheckCircle, XCircle, Clock, X, Copy } from 'lucide-react';
import './App.css';

// Interfaces
interface Product {
  id: string;
  name: string;
  brand: string;
  images: string[];
  barcode?: string;
  category?: string;
  googleCategory?: string;
  enrichmentStatus: 'pending' | 'enriched' | 'processing';
  enrichmentLevel?: 'none' | 'partial' | 'complete';
  channels?: string[];
  createdOn: string;
  hasImages: boolean;
  attributes: Record<string, any>;
}

interface AttributeDefinition {
  name: string;
  type: 'short_text' | 'long_text' | 'rich_text' | 'number' | 'single_select' | 'multiple_select' | 'measure';
  unit?: string;
  options?: string[];
  required?: boolean;
  group?: string;
  aiEnrichment?: boolean;
  variantSpecific?: boolean;
  attributeGroup?: string[];
  attributeDictionary?: string;
  promptConfiguration?: string;
}

// Sample data with enriched products to match screenshots
const sampleProducts: Product[] = [
  {
    id: 'PROD001',
    name: 'Instant Rice Fettuccine',
    brand: 'Koka',
    images: ['https://via.placeholder.com/200x200?text=Koka+Noodles'],
    barcode: '1234567890123',
    enrichmentStatus: 'pending',
    enrichmentLevel: 'none',
    createdOn: '2024-01-15',
    hasImages: true,
    category: 'Food & Beverages',
    googleCategory: 'Food, Beverages & Tobacco > Fo...',
    channels: ['Online Store', 'Amazon'],
    attributes: {}
  },
  {
    id: 'PROD002',
    name: 'Black Neck Cord with Buckle',
    brand: 'Univet',
    images: ['https://via.placeholder.com/200x200?text=Safety+Cord'],
    barcode: '2345678901234',
    enrichmentStatus: 'enriched',
    enrichmentLevel: 'complete',
    createdOn: '2024-02-10',
    hasImages: true,
    category: 'Safety Equipment',
    googleCategory: 'Business & Industrial > Workpl...',
    channels: ['B2B Portal', 'Direct Sales'],
    attributes: {}
  },
  {
    id: 'PROD003',
    name: 'Football',
    brand: 'Nike',
    images: ['https://via.placeholder.com/200x200?text=Nike+Football'],
    barcode: '9336473031366',
    enrichmentStatus: 'pending',
    enrichmentLevel: 'none',
    createdOn: '2024-03-05',
    hasImages: true,
    category: '',
    googleCategory: '',
    channels: ['Online Store', 'Retail Partners'],
    attributes: {}
  },
  {
    id: 'PROD004',
    name: 'Protein Powder',
    brand: 'Optimum Nutrition',
    images: ['https://via.placeholder.com/200x200?text=Protein+Powder'],
    barcode: '4567890123456',
    enrichmentStatus: 'pending',
    enrichmentLevel: 'none',
    createdOn: '2024-04-20',
    hasImages: true,
    category: '',
    googleCategory: '',
    channels: ['Online Store', 'Amazon', '+1'],
    attributes: {}
  },
  {
    id: 'PROD005',
    name: 'Wireless Bluetooth Headphones',
    brand: 'AudioTech',
    images: ['https://via.placeholder.com/200x200?text=Headphones'],
    barcode: '5678901234567',
    enrichmentStatus: 'pending',
    enrichmentLevel: 'none',
    createdOn: '2024-05-12',
    hasImages: true,
    category: '',
    googleCategory: '',
    channels: ['Online Store'],
    attributes: {}
  }
];

const attributeDefinitions: AttributeDefinition[] = [
  { name: 'Item Weight', type: 'measure', unit: 'G', required: true, group: 'custom', aiEnrichment: true, variantSpecific: false, attributeGroup: ['Kitchen'], attributeDictionary: 'Weight of the item', promptConfiguration: 'Extract weight from product description' },
  { name: 'Ingredients', type: 'multiple_select', options: ['Rice Noodles', 'Flavor Seasoning', 'Vegetables', 'Spices', 'Oil', 'Salt'], group: 'custom', aiEnrichment: true, variantSpecific: false, attributeGroup: ['Kitchen'], attributeDictionary: 'List of ingredients', promptConfiguration: 'Identify all ingredients from product information' },
  { name: 'Product Description', type: 'rich_text', group: 'custom', aiEnrichment: true, variantSpecific: false, attributeGroup: ['General'], attributeDictionary: 'Detailed product description', promptConfiguration: 'Generate comprehensive product description' },
  { name: 'Storage Requirements', type: 'single_select', options: ['Dry Storage', 'Deep Frozen', 'Ambient Storage', 'Frozen Food Storage'], group: 'custom', aiEnrichment: true, variantSpecific: false, attributeGroup: ['Kitchen', 'Store Room'], attributeDictionary: 'Storage conditions required', promptConfiguration: 'Determine storage requirements' },
  { name: 'Items per Package', type: 'number', group: 'custom', aiEnrichment: true, variantSpecific: false, attributeGroup: ['General'], attributeDictionary: 'Number of items in package', promptConfiguration: 'Count items per package' },
  { name: 'Color', type: 'short_text', group: 'custom', aiEnrichment: true, variantSpecific: true, attributeGroup: ['General'], attributeDictionary: 'Product color', promptConfiguration: 'Identify primary color' },
  { name: 'Material', type: 'short_text', group: 'custom', aiEnrichment: true, variantSpecific: false, attributeGroup: ['General'], attributeDictionary: 'Material composition', promptConfiguration: 'Identify materials used' },
  { name: 'Width', type: 'measure', unit: 'CM', group: 'custom', aiEnrichment: true, variantSpecific: false, attributeGroup: ['General'], attributeDictionary: 'Product width', promptConfiguration: 'Extract width dimension' },
  { name: 'Height', type: 'measure', unit: 'CM', group: 'custom', aiEnrichment: true, variantSpecific: false, attributeGroup: ['General'], attributeDictionary: 'Product height', promptConfiguration: 'Extract height dimension' },
  { name: 'Warranty', type: 'number', group: 'custom', aiEnrichment: true, variantSpecific: false, attributeGroup: ['General'], attributeDictionary: 'Warranty period in years', promptConfiguration: 'Extract warranty information' },
  { name: 'Home Areas', type: 'multiple_select', options: ['Kitchen', 'Bathroom', 'Living Room', 'Garden', 'Bedroom', 'Balcony', 'Store Room', 'Closet', 'Gym', 'Office'], group: 'custom', aiEnrichment: true, variantSpecific: false, attributeGroup: ['Kitchen', 'Bathroom', 'Living Room', 'Garden', 'Bedroom', 'Balcony', 'Store Room', 'Closet', 'Gym', 'Office'], attributeDictionary: 'Applicable home areas', promptConfiguration: 'Determine suitable home areas' },
  { name: 'SKU', type: 'short_text', group: 'system', aiEnrichment: false, variantSpecific: false, attributeGroup: ['System'], attributeDictionary: 'Stock Keeping Unit', promptConfiguration: '' },
  { name: 'Created Date', type: 'short_text', group: 'system', aiEnrichment: false, variantSpecific: false, attributeGroup: ['System'], attributeDictionary: 'Creation date', promptConfiguration: '' },
  { name: 'Modified Date', type: 'short_text', group: 'system', aiEnrichment: false, variantSpecific: false, attributeGroup: ['System'], attributeDictionary: 'Last modification date', promptConfiguration: '' },
  { name: 'Product ID', type: 'short_text', group: 'system', aiEnrichment: false, variantSpecific: false, attributeGroup: ['System'], attributeDictionary: 'Unique product identifier', promptConfiguration: '' },
  { name: 'Status', type: 'short_text', group: 'system', aiEnrichment: false, variantSpecific: false, attributeGroup: ['System'], attributeDictionary: 'Product status', promptConfiguration: '' },
];

// Fixed OpenAI API call function - removed Vite-specific syntax
const callOpenAIAPI = async (prompt: string): Promise<any> => {
  try {
    console.log('Making OpenAI API call...');
    
    // Try to get API key from environment (CRA compatible)
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY || 
                   process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Fallback: try to make API call through a proxy endpoint
      console.log('No API key found in environment, trying proxy endpoint...');
      
      const response = await fetch('/api/openai-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`API proxy error: ${response.status}`);
      }

      return await response.json();
    }

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert e-commerce product categorization specialist. You must respond with valid JSON only, no additional text or formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    };

    console.log('Request body:', requestBody);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI API');
    }

    return data;

  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
};

// Enhanced enrichment function for all attributes using OpenAI
const enrichProductAttributes = async (product: Product, attributes: AttributeDefinition[]): Promise<Record<string, any>> => {
  const enrichedAttributes: Record<string, any> = {};
  
  const attributesToEnrich = attributes.filter(attr => attr.aiEnrichment && attr.group === 'custom');
  
  for (const attribute of attributesToEnrich) {
    try {
      const attributePrompt = `Based on this product information, provide the value for the "${attribute.name}" attribute.

Product Information:
- Name: ${product.name}
- Brand: ${product.brand}
- Category: ${product.category || 'Not categorized'}
- Google Category: ${product.googleCategory || 'Not categorized'}

Attribute Details:
- Attribute Name: ${attribute.name}
- Type: ${attribute.type}
- Dictionary: ${attribute.attributeDictionary || 'No description'}
- Prompt Configuration: ${attribute.promptConfiguration || 'Generate appropriate value'}

INSTRUCTIONS:
- Provide only the value for "${attribute.name}" attribute
- Be specific and accurate based on the product information
- For measure types, respond with {"value": number, "unit": "appropriate_unit"}
- For text types, respond with just the text value
- For select types, choose from available options or suggest appropriate value
- For numbers, respond with just the number

REQUIRED JSON FORMAT:
{
  "attributeValue": "your_response_here"
}

Generate value for: "${attribute.name}"`;

      const response = await callOpenAIAPI(attributePrompt);
      const responseContent = response.choices[0].message.content;
      
      let attributeData;
      try {
        attributeData = JSON.parse(responseContent.trim());
      } catch {
        attributeData = { attributeValue: responseContent.trim() };
      }

      enrichedAttributes[attribute.name] = attributeData.attributeValue;
      
    } catch (error) {
      console.error(`Error enriching attribute ${attribute.name}:`, error);
      enrichedAttributes[attribute.name] = 'Auto-generation failed';
    }
  }
  
  return enrichedAttributes;
};

// Fallback categorization function
const generateFallbackCategories = (productName: string, brand: string) => {
  const name = productName.toLowerCase();
  const brandName = brand.toLowerCase();
  
  // Sports products
  if (name.includes('football') || name.includes('soccer') || name.includes('ball')) {
    return {
      category: 'Sports & Recreation',
      googleCategory: 'Sporting Goods > Team Sports > Football > Footballs'
    };
  }
  
  // Health & supplements
  if (name.includes('protein') || name.includes('supplement') || name.includes('vitamin') || name.includes('powder')) {
    return {
      category: 'Health & Supplements',
      googleCategory: 'Health & Personal Care > Vitamins & Dietary Supplements > Sports Nutrition > Protein Supplements'
    };
  }
  
  // Electronics
  if (name.includes('phone') || name.includes('headphone') || name.includes('bluetooth') || name.includes('wireless') || brandName.includes('apple') || brandName.includes('samsung')) {
    return {
      category: 'Electronics',
      googleCategory: 'Electronics > Audio > Audio Components > Headphones'
    };
  }
  
  // Food products
  if (name.includes('noodle') || name.includes('food') || name.includes('instant') || name.includes('rice')) {
    return {
      category: 'Food & Beverages',
      googleCategory: 'Food, Beverages & Tobacco > Food Items > Prepared Foods > Instant Foods'
    };
  }
  
  // Default fallback
  return {
    category: 'General Merchandise',
    googleCategory: 'General Merchandise > Miscellaneous'
  };
};

// Modal components (keeping existing modal components unchanged)
const AddProductModal = React.memo(({ 
  show, 
  onClose, 
  newProductForm, 
  setNewProductForm, 
  onAddProduct, 
  categories 
}: {
  show: boolean;
  onClose: () => void;
  newProductForm: any;
  setNewProductForm: (form: any) => void;
  onAddProduct: () => void;
  categories: string[];
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Add New Product</h2>
          <button onClick={onClose} className="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body">
          <input
            type="text"
            placeholder="Product Name"
            value={newProductForm.name}
            onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
            className="form-input"
          />
          <input
            type="text"
            placeholder="Brand"
            value={newProductForm.brand}
            onChange={(e) => setNewProductForm({...newProductForm, brand: e.target.value})}
            className="form-input"
          />
          <input
            type="text"
            placeholder="Barcode (optional)"
            value={newProductForm.barcode}
            onChange={(e) => setNewProductForm({...newProductForm, barcode: e.target.value})}
            className="form-input"
          />
          <select 
            className="form-select"
            value={newProductForm.category}
            onChange={(e) => setNewProductForm({...newProductForm, category: e.target.value})}
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={onAddProduct} className="btn btn-primary">Add Product</button>
        </div>
      </div>
    </div>
  );
});

const EditProductModal = React.memo(({ 
  show, 
  onClose, 
  editingProduct, 
  onSaveProduct,
  categories,
  allChannels
}: {
  show: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSaveProduct: (product: Product) => void;
  categories: string[];
  allChannels: string[];
}) => {
  const [localProduct, setLocalProduct] = useState(editingProduct || {
    id: '',
    name: '',
    brand: '',
    images: [],
    barcode: '',
    category: '',
    googleCategory: '',
    enrichmentStatus: 'pending' as const,
    enrichmentLevel: 'none' as const,
    channels: [],
    createdOn: '',
    hasImages: false,
    attributes: {}
  });

  React.useEffect(() => {
    if (editingProduct) {
      setLocalProduct(editingProduct);
    }
  }, [editingProduct]);

  if (!show || !editingProduct) return null;

  const handleSave = () => {
    onSaveProduct(localProduct);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit Product: {editingProduct.name}</h2>
          <button onClick={onClose} className="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                value={localProduct.name}
                onChange={(e) => setLocalProduct({...localProduct, name: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                type="text"
                value={localProduct.brand}
                onChange={(e) => setLocalProduct({...localProduct, brand: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Barcode</label>
              <input
                type="text"
                value={localProduct.barcode || ''}
                onChange={(e) => setLocalProduct({...localProduct, barcode: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={localProduct.category || ''}
                onChange={(e) => setLocalProduct({...localProduct, category: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Google Category</label>
              <input
                type="text"
                value={localProduct.googleCategory || ''}
                onChange={(e) => setLocalProduct({...localProduct, googleCategory: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-select"
                value={localProduct.enrichmentStatus}
                onChange={(e) => setLocalProduct({...localProduct, enrichmentStatus: e.target.value as Product['enrichmentStatus']})}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="enriched">Enriched</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Channels</label>
            <div className="checkbox-grid">
              {allChannels.map(channel => (
                <label key={channel} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={localProduct.channels?.includes(channel) || false}
                    onChange={(e) => {
                      const currentChannels = localProduct.channels || [];
                      const updatedChannels = e.target.checked
                        ? [...currentChannels, channel]
                        : currentChannels.filter(c => c !== channel);
                      setLocalProduct({...localProduct, channels: updatedChannels});
                    }}
                  />
                  <span>{channel}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
});

const EditAttributeModal = React.memo(({ 
  show, 
  onClose, 
  editingAttribute, 
  onSaveAttribute
}: {
  show: boolean;
  onClose: () => void;
  editingAttribute: AttributeDefinition | null;
  onSaveAttribute: (attribute: AttributeDefinition) => void;
}) => {
  const [localAttribute, setLocalAttribute] = useState(editingAttribute || {
    name: '',
    type: 'short_text' as const,
    group: 'custom' as const,
    aiEnrichment: false,
    variantSpecific: false,
    attributeGroup: [],
    attributeDictionary: '',
    promptConfiguration: ''
  });

  const [newChoice, setNewChoice] = useState('');

  const homeAreaOptions = ['Kitchen', 'Bathroom', 'Living Room', 'Garden', 'Bedroom', 'Balcony', 'Store Room', 'Closet', 'Gym', 'Office'];

  React.useEffect(() => {
    if (editingAttribute) {
      setLocalAttribute(editingAttribute);
    }
  }, [editingAttribute]);

  if (!show || !editingAttribute) return null;

  const handleSave = () => {
    onSaveAttribute(localAttribute);
    onClose();
  };

  const handleAddChoice = () => {
    if (newChoice.trim()) {
      const updatedGroups = [...(localAttribute.attributeGroup || []), newChoice.trim()];
      setLocalAttribute({...localAttribute, attributeGroup: updatedGroups});
      setNewChoice('');
    }
  };

  const handleToggleChoice = (choice: string) => {
    const currentGroups = localAttribute.attributeGroup || [];
    const updatedGroups = currentGroups.includes(choice)
      ? currentGroups.filter(g => g !== choice)
      : [...currentGroups, choice];
    setLocalAttribute({...localAttribute, attributeGroup: updatedGroups});
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit Attribute: {editingAttribute.name}</h2>
          <button onClick={onClose} className="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="info-card">
            <h3 className="info-title">Attribute Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Type:</span>
                <span className="info-value">
                  {localAttribute.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  {localAttribute.unit ? ` (${localAttribute.unit})` : ''}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Group:</span>
                <span className="info-value">{localAttribute.group === 'custom' ? 'Custom' : 'System'}</span>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Attribute Group</h3>
            <div className="checkbox-grid">
              {homeAreaOptions.map(option => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={localAttribute.attributeGroup?.includes(option) || false}
                    onChange={() => handleToggleChoice(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <div className="add-choice-section">
              <input
                type="text"
                placeholder="Add new choice"
                value={newChoice}
                onChange={(e) => setNewChoice(e.target.value)}
                className="form-input"
              />
              <button onClick={handleAddChoice} className="btn btn-primary">Add</button>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Attribute Dictionary</h3>
            <textarea
              value={localAttribute.attributeDictionary || ''}
              onChange={(e) => setLocalAttribute({...localAttribute, attributeDictionary: e.target.value})}
              placeholder="Enter attribute dictionary information..."
              className="form-textarea"
              rows={4}
            />
          </div>

          <div className="form-section">
            <h3 className="section-title">Additional Settings</h3>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={localAttribute.aiEnrichment || false}
                onChange={(e) => setLocalAttribute({...localAttribute, aiEnrichment: e.target.checked})}
                className="switch-input"
              />
              <span className="switch-slider"></span>
              <span>Enable AI Enrichment</span>
            </label>
          </div>

          <div className="form-section">
            <h3 className="section-title">AI Prompt Settings</h3>
            <textarea
              value={localAttribute.promptConfiguration || ''}
              onChange={(e) => setLocalAttribute({...localAttribute, promptConfiguration: e.target.value})}
              placeholder="Enter AI prompt settings for this attribute..."
              disabled={!localAttribute.aiEnrichment}
              className={`form-textarea ${!localAttribute.aiEnrichment ? 'disabled' : ''}`}
              rows={4}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
});

const AddAttributeModal = React.memo(({ 
  show, 
  onClose, 
  newAttributeForm, 
  setNewAttributeForm, 
  onAddAttribute, 
  attributeTab 
}: {
  show: boolean;
  onClose: () => void;
  newAttributeForm: any;
  setNewAttributeForm: (form: any) => void;
  onAddAttribute: () => void;
  attributeTab: string;
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Add New Attribute</h2>
          <button onClick={onClose} className="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Attribute Name</label>
            <input
              type="text"
              placeholder="Attribute Name"
              value={newAttributeForm.name}
              onChange={(e) => setNewAttributeForm({...newAttributeForm, name: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select 
              className="form-select"
              value={newAttributeForm.type}
              onChange={(e) => setNewAttributeForm({...newAttributeForm, type: e.target.value})}
            >
              <option value="">Select Type</option>
              <option value="short_text">Short Text</option>
              <option value="long_text">Long Text</option>
              <option value="rich_text">Rich Text</option>
              <option value="number">Number</option>
              <option value="single_select">Single Select</option>
              <option value="multiple_select">Multiple Select</option>
              <option value="measure">Measure</option>
            </select>
          </div>
          {newAttributeForm.type === 'measure' && (
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                type="text"
                placeholder="Unit (e.g., G, CM, USD)"
                value={newAttributeForm.unit}
                onChange={(e) => setNewAttributeForm({...newAttributeForm, unit: e.target.value})}
                className="form-input"
              />
            </div>
          )}
          <div className="info-text">
            Adding to: <span className="font-medium">{attributeTab === 'custom' ? 'Custom Attributes' : attributeTab === 'system' ? 'System Attributes' : 'All Attributes'}</span>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={onAddAttribute} disabled={!newAttributeForm.name || !newAttributeForm.type} className="btn btn-primary">Add Attribute</button>
        </div>
      </div>
    </div>
  );
});

const BulkImportModal = React.memo(({ 
  show, 
  onClose, 
  onImport 
}: {
  show: boolean;
  onClose: () => void;
  onImport: (content: string) => void;
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!show) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleImport = () => {
    if (csvFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target?.result as string;
        onImport(csvContent);
        onClose();
        setCsvFile(null);
      };
      reader.readAsText(csvFile);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Bulk Import Products</h2>
          <button onClick={onClose} className="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body">
          <div 
            className={`file-upload-area ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="upload-icon" />
            <p className="upload-text">Drop your CSV file here or click to browse</p>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload}
              className="file-input"
            />
            {csvFile && (
              <p className="file-selected">Selected: {csvFile.name}</p>
            )}
          </div>
          <div className="format-info">
            <p className="format-title">Expected CSV Format:</p>
            <code className="format-example">
              name,brand,category,barcode,google category
            </code>
            <p className="format-note">Headers are case-insensitive</p>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={handleImport} disabled={!csvFile} className="btn btn-primary">Import Products</button>
        </div>
      </div>
    </div>
  );
});

const ProductEnrichmentSystem = () => {
  const [currentView, setCurrentView] = useState<'products' | 'attributes'>('products');
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    category: '',
    images: '',
    googleCategory: '',
    status: '',
    enrichment: '',
    channels: '',
    createdOnStart: '',
    createdOnEnd: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [attributes, setAttributes] = useState<AttributeDefinition[]>(attributeDefinitions);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [attributeTab, setAttributeTab] = useState<'custom' | 'system' | 'all'>('custom');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showAddAttributeModal, setShowAddAttributeModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showEditAttributeModal, setShowEditAttributeModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingAttribute, setEditingAttribute] = useState<AttributeDefinition | null>(null);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    brand: '',
    category: '',
    barcode: ''
  });
  const [newAttributeForm, setNewAttributeForm] = useState({
    name: '',
    type: '',
    unit: '',
    options: [] as string[]
  });
  // @ts-ignore
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];
  // @ts-ignore
  const googleCategories = [...new Set(products.map(p => p.googleCategory).filter(Boolean))] as string[];
  // @ts-ignore
  const allChannels = [...new Set(products.flatMap(p => p.channels || []))] as string[];

  // FIXED: Enhanced enrichment function with better error handling and improved prompts
  const enrichProducts = async (productIds: string[]) => {
    console.log('Starting AI enrichment for products:', productIds);
    setIsEnriching(true);
    
    // Update products to processing status
    setProducts(prev => prev.map(p => 
      productIds.includes(p.id) 
        ? { ...p, enrichmentStatus: 'processing' as const }
        : p
    ));

    try {
      const productsToEnrich = products.filter(p => productIds.includes(p.id));
      console.log('Products to enrich:', productsToEnrich.map(p => `${p.name} by ${p.brand}`));
      const enrichedProducts: Product[] = [];

      for (const product of productsToEnrich) {
        try {
          console.log(`Processing: ${product.name} by ${product.brand}`);
          
          // Create a more comprehensive and specific prompt for product categorization
          const enrichmentPrompt = `You are an expert e-commerce product categorization specialist. Categorize this product for online marketplaces:

Product: "${product.name}"
Brand: "${product.brand}"

TASK: Provide appropriate product category and Google Shopping category for this item.

EXAMPLES OF CORRECT CATEGORIZATION:
- Football by Nike → Category: "Sports & Recreation", Google Category: "Sporting Goods > Team Sports > Football > Footballs"
- Protein Powder by Optimum Nutrition → Category: "Health & Supplements", Google Category: "Health & Personal Care > Vitamins & Dietary Supplements > Sports Nutrition > Protein Supplements"
- iPhone by Apple → Category: "Electronics", Google Category: "Electronics > Communications > Telephony > Mobile Phones > Smartphones"
- Instant Noodles by Koka → Category: "Food & Beverages", Google Category: "Food, Beverages & Tobacco > Food Items > Prepared Foods > Instant Foods"
- Wireless Headphones by Sony → Category: "Electronics", Google Category: "Electronics > Audio > Audio Components > Headphones"

INSTRUCTIONS:
1. Analyze the product name and brand carefully
2. Determine the most appropriate main category (like "Sports & Recreation", "Health & Supplements", "Electronics", "Food & Beverages", etc.)
3. Create a detailed Google Shopping category hierarchy using ">" separators
4. Be specific and accurate based on the actual product type
5. Use standard e-commerce category naming conventions

REQUIRED JSON FORMAT (respond with ONLY this JSON, no other text):
{
  "category": "main_category_name",
  "googleCategory": "detailed > hierarchy > with > separators"
}

Product to categorize: "${product.name}" by "${product.brand}"`;

          console.log('Sending enrichment request for:', product.name);
          const openaiResponse = await callOpenAIAPI(enrichmentPrompt);
          
          let responseText = '';
          if (openaiResponse?.choices?.[0]?.message?.content) {
            responseText = openaiResponse.choices[0].message.content;
            console.log('Response received:', responseText);
          } else {
            console.error('Invalid OpenAI response structure:', openaiResponse);
            throw new Error('Invalid response format from OpenAI API');
          }

          let enrichedData;
          try {
            // Clean the response to extract JSON
            const cleanedResponse = responseText.trim();
            
            // Remove any markdown formatting if present
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
            
            console.log('Attempting to parse JSON:', jsonString);
            enrichedData = JSON.parse(jsonString);
            console.log('Successfully parsed data:', enrichedData);
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw response was:', responseText);
            
            // Fallback: try to extract category information manually
            try {
              const categoryMatch = responseText.match(/"category":\s*"([^"]+)"/);
              const googleCategoryMatch = responseText.match(/"googleCategory":\s*"([^"]+)"/);
              
              if (categoryMatch && googleCategoryMatch) {
                enrichedData = {
                  category: categoryMatch[1],
                  googleCategory: googleCategoryMatch[1]
                };
                console.log('Extracted data manually:', enrichedData);
              } else {
                // Final fallback: provide reasonable defaults based on product name
                enrichedData = generateFallbackCategories(product.name, product.brand);
                console.log('Using fallback categorization:', enrichedData);
              }
            } catch (extractError) {
              console.error('Manual extraction failed:', extractError);
              enrichedData = generateFallbackCategories(product.name, product.brand);
            }
          }

          if (!enrichedData.category || !enrichedData.googleCategory) {
            console.error('Missing required fields, using fallback:', enrichedData);
            enrichedData = generateFallbackCategories(product.name, product.brand);
          }

          // Enrich all attributes using OpenAI
          console.log('Enriching product attributes...');
          const enrichedAttributes = await enrichProductAttributes(product, attributes);

          const enrichedProduct: Product = {
            ...product,
            category: enrichedData.category,
            googleCategory: enrichedData.googleCategory,
            channels: product.channels || ['Online Store', 'Amazon'],
            enrichmentStatus: 'enriched' as const,
            enrichmentLevel: 'complete' as const,
            attributes: {
              ...product.attributes,
              ...enrichedAttributes
            }
          };

          console.log('Final enriched product:', {
            name: enrichedProduct.name,
            category: enrichedProduct.category,
            googleCategory: enrichedProduct.googleCategory
          });
          
          enrichedProducts.push(enrichedProduct);

        } catch (error) {
          console.error(`Error enriching product ${product.id}:`, error);
          // Keep the product but mark as failed with fallback categories
          const fallbackData = generateFallbackCategories(product.name, product.brand);
          enrichedProducts.push({
            ...product,
            category: fallbackData.category,
            googleCategory: fallbackData.googleCategory,
            enrichmentStatus: 'enriched' as const,
            enrichmentLevel: 'partial' as const
          });
        }
      }

      // Update the products state with enriched data
      setProducts(prev => prev.map(existingProduct => {
        const enrichedProduct = enrichedProducts.find(p => p.id === existingProduct.id);
        if (enrichedProduct) {
          console.log(`Updated product ${existingProduct.id} with categories:`, {
            category: enrichedProduct.category,
            googleCategory: enrichedProduct.googleCategory
          });
        }
        return enrichedProduct || existingProduct;
      }));

      const successCount = enrichedProducts.filter(p => p.enrichmentStatus === 'enriched').length;
      const partialCount = enrichedProducts.filter(p => p.enrichmentLevel === 'partial').length;
      
      console.log(`Results: ${successCount} enriched (${partialCount} partial)`);
      
      if (partialCount > 0) {
        alert(`Enriched ${successCount} products! ${partialCount} used fallback categorization due to API issues. Check the table to see the results!`);
      } else {
        alert(`Successfully enriched all ${successCount} products using OpenAI!\n\nThe Product Category and Google Category columns are now populated with AI-generated categories. Check the table to see the results!`);
      }

    } catch (error) {
      console.error('Enrichment process error:', error);
      
      // Reset products back to pending status on error
      setProducts(prev => prev.map(p => 
        productIds.includes(p.id) 
          ? { ...p, enrichmentStatus: 'pending' as const }
          : p
      ));
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Enrichment failed: ${errorMessage}\n\nPlease check your OpenAI API configuration. Make sure REACT_APP_OPENAI_API_KEY is set correctly in your environment variables.`);
    } finally {
      setIsEnriching(false);
      setSelectedProducts([]);
      console.log('Enrichment process completed');
    }
  };

  const enrichSingleAttribute = async (attributeName: string) => {
    try {
      console.log(`Enriching attribute: ${attributeName}`);
      
      const productsToEnrich = products.filter(p => 
        p.enrichmentStatus === 'enriched' && 
        (!p.attributes[attributeName] || p.attributes[attributeName] === '')
      );

      if (productsToEnrich.length === 0) {
        alert('No products available for attribute enrichment. Please enrich products first.');
        return;
      }

      const enrichedProducts: Product[] = [];

      for (const product of productsToEnrich) {
        try {
          const enrichmentPrompt = `You are an AI specialist for e-commerce product data enrichment. Based on this product information, provide the value for the "${attributeName}" attribute.

Product Information:
- Name: ${product.name}
- Brand: ${product.brand}
- Category: ${product.category}
- Google Category: ${product.googleCategory}

INSTRUCTIONS:
- Provide only the value for "${attributeName}" attribute
- Be specific and accurate based on the product information
- If it's a measure type, respond with {"value": number, "unit": "appropriate_unit"}
- If it's a text type, respond with just the text value
- If it's a select type, choose the most appropriate option
- If it's a number, respond with just the number

REQUIRED JSON FORMAT:
{
  "attributeValue": "your_response_here"
}

Attribute to generate: "${attributeName}"`;

          const openaiResponse = await callOpenAIAPI(enrichmentPrompt);
          
          let responseText = '';
          if (openaiResponse.choices && openaiResponse.choices[0] && openaiResponse.choices[0].message) {
            responseText = openaiResponse.choices[0].message.content;
          }

          let attributeData;
          try {
            attributeData = JSON.parse(responseText.trim());
          } catch {
            attributeData = { attributeValue: responseText.trim() };
          }

          const enrichedProduct: Product = {
            ...product,
            attributes: {
              ...product.attributes,
              [attributeName]: attributeData.attributeValue
            }
          };

          enrichedProducts.push(enrichedProduct);

        } catch (error) {
          console.error(`Error enriching attribute ${attributeName} for product ${product.id}:`, error);
          enrichedProducts.push(product);
        }
      }

      setProducts(prev => prev.map(existingProduct => {
        const enrichedProduct = enrichedProducts.find(p => p.id === existingProduct.id);
        return enrichedProduct || existingProduct;
      }));

      alert(`Successfully enriched "${attributeName}" for ${enrichedProducts.length} products using OpenAI!`);

    } catch (error) {
      console.error('Attribute enrichment error:', error);
      alert(`Failed to enrich attribute "${attributeName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    setFilters(prev => ({...prev, [filterType]: value}));
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesGoogleCategory = !filters.googleCategory || product.googleCategory === filters.googleCategory;
    const matchesStatus = !filters.status || product.enrichmentStatus === filters.status;
    const matchesEnrichment = !filters.enrichment || product.enrichmentLevel === filters.enrichment;
    const matchesImages = !filters.images || 
      (filters.images === 'with_images' && product.hasImages) ||
      (filters.images === 'without_images' && !product.hasImages);
    const matchesChannels = !filters.channels || product.channels?.includes(filters.channels);
    
    const matchesDateRange = (!filters.createdOnStart || product.createdOn >= filters.createdOnStart) &&
                            (!filters.createdOnEnd || product.createdOn <= filters.createdOnEnd);
    
    return matchesSearch && matchesCategory && matchesGoogleCategory && matchesStatus && 
           matchesEnrichment && matchesImages && matchesChannels && matchesDateRange;
  });

  const getFilteredAttributes = () => {
    if (attributeTab === 'custom') {
      return attributes.filter(attr => attr.group === 'custom');
    } else if (attributeTab === 'system') {
      return attributes.filter(attr => attr.group === 'system');
    }
    return attributes;
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      images: '',
      googleCategory: '',
      status: '',
      enrichment: '',
      channels: '',
      createdOnStart: '',
      createdOnEnd: ''
    });
    setSearchQuery('');
  };

  const getStatusIcon = (status: Product['enrichmentStatus']) => {
    switch (status) {
      case 'enriched': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: Product['enrichmentStatus']) => {
    switch (status) {
      case 'enriched': return 'Enriched';
      case 'processing': return 'Processing';
      default: return 'Pending';
    }
  };

  const handleAddProduct = () => {
    if (newProductForm.name && newProductForm.brand) {
      const newProduct: Product = {
        id: `PROD${String(products.length + 1).padStart(3, '0')}`,
        name: newProductForm.name,
        brand: newProductForm.brand,
        images: [],
        barcode: newProductForm.barcode,
        category: newProductForm.category,
        googleCategory: '',
        enrichmentStatus: 'pending',
        enrichmentLevel: 'none',
        channels: ['Online Store'],
        createdOn: new Date().toISOString().split('T')[0],
        hasImages: false,
        attributes: {}
      };
      setProducts([...products, newProduct]);
      setNewProductForm({ name: '', brand: '', category: '', barcode: '' });
      setShowAddProductModal(false);
      alert('Product added successfully!');
    }
  };

  const handleAddAttribute = () => {
    if (newAttributeForm.name && newAttributeForm.type) {
      const targetGroup = attributeTab === 'system' ? 'system' : 'custom';
      
      const newAttr: AttributeDefinition = {
        name: newAttributeForm.name,
        type: newAttributeForm.type as AttributeDefinition['type'],
        unit: newAttributeForm.unit || undefined,
        options: newAttributeForm.options.length > 0 ? newAttributeForm.options : undefined,
        group: targetGroup,
        aiEnrichment: targetGroup !== 'system',
        variantSpecific: false,
        attributeGroup: [],
        attributeDictionary: '',
        promptConfiguration: ''
      };
      
      setAttributes([...attributes, newAttr]);
      setNewAttributeForm({ name: '', type: '', unit: '', options: [] });
      setShowAddAttributeModal(false);
      alert(`Attribute added to ${targetGroup === 'custom' ? 'Custom' : 'System'} Attributes successfully!`);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
      alert('Product deleted successfully!');
    }
  };

  const handleCopyProduct = (product: Product) => {
    const copiedProduct: Product = {
      ...product,
      id: `PROD${String(products.length + 1).padStart(3, '0')}`,
      name: `${product.name} (Copy)`,
      createdOn: new Date().toISOString().split('T')[0],
      enrichmentStatus: 'pending',
      enrichmentLevel: 'none'
    };
    setProducts([...products, copiedProduct]);
    alert('Product copied successfully!');
  };

  const handleDeleteAttribute = (attributeName: string) => {
    const attrToDelete = attributes.find(a => a.name === attributeName);
    if (attrToDelete?.group === 'system') {
      alert('System attributes cannot be deleted');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the attribute "${attributeName}"?`)) {
      setAttributes(attributes.filter(a => a.name !== attributeName));
      setSelectedAttributes(selectedAttributes.filter(name => name !== attributeName));
      alert('Attribute deleted successfully!');
    }
  };

  const handleBulkImport = (csvContent: string) => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      alert('CSV file must contain at least a header row and one data row');
      return;
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const newProducts: Product[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length >= 2 && values[0] && values[0] !== '') {
        const getValueByHeader = (headerNames: string[]) => {
          for (const headerName of headerNames) {
            const index = headers.indexOf(headerName);
            if (index !== -1 && values[index]) {
              return values[index];
            }
          }
          return '';
        };
        
        const product: Product = {
          id: `PROD${String(products.length + newProducts.length + 1).padStart(3, '0')}`,
          name: getValueByHeader(['name', 'product name', 'product_name']) || values[0],
          brand: getValueByHeader(['brand', 'brand_name']) || values[1] || 'Unknown',
          images: [],
          barcode: getValueByHeader(['barcode', 'ean', 'upc']) || '',
          category: getValueByHeader(['category', 'product category', 'product_category']) || '',
          googleCategory: getValueByHeader(['google category', 'googlecategory', 'google_category']) || '',
          enrichmentStatus: 'pending',
          enrichmentLevel: 'none',
          channels: ['Online Store'],
          createdOn: new Date().toISOString().split('T')[0],
          hasImages: false,
          attributes: {}
        };
        newProducts.push(product);
      }
    }
    
    if (newProducts.length > 0) {
      setProducts([...products, ...newProducts]);
      alert(`Successfully imported ${newProducts.length} products from CSV file!`);
    } else {
      alert('No valid products found in CSV file. Please check the format.');
    }
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    alert('Product updated successfully!');
  };

  const handleSaveAttribute = (updatedAttribute: AttributeDefinition) => {
    setAttributes(attributes.map(a => a.name === updatedAttribute.name ? updatedAttribute : a));
    alert('Attribute updated successfully!');
  };

  // AI Product Hub View
  const ProductListView = () => (
    <div className="main-view">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">AI Product Hub</h1>
          <p className="page-subtitle">{products.length} Products | Main Products</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowBulkImportModal(true)}
            className="btn btn-secondary"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          <button 
            onClick={() => setShowAddProductModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      <div className="search-filter-bar">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-secondary"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <h3 className="filter-title">Filter products by</h3>
          
          <div className="filter-row">
            <div className="filter-item">
              <label className="filter-label">Product Category</label>
              <select 
                className="filter-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label className="filter-label">Images</label>
              <select 
                className="filter-select"
                value={filters.images}
                onChange={(e) => handleFilterChange('images', e.target.value)}
              >
                <option value="">All</option>
                <option value="with_images">With Images</option>
                <option value="without_images">Without Images</option>
              </select>
            </div>
            
            <div className="filter-item">
              <label className="filter-label">Google Category</label>
              <select 
                className="filter-select"
                value={filters.googleCategory}
                onChange={(e) => handleFilterChange('googleCategory', e.target.value)}
              >
                <option value="">All Google Cat</option>
                {googleCategories.map(cat => (
                  <option key={cat} value={cat}>{cat.length > 30 ? `${cat.substring(0, 30)}...` : cat}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label className="filter-label">Status</label>
              <select 
                className="filter-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="enriched">Enriched</option>
              </select>
            </div>
          </div>

          <div className="filter-row">
                        <div className="filter-item">
              <label className="filter-label">Created On (Start)</label>
              <input
                type="date"
                className="filter-input"
                value={filters.createdOnStart}
                onChange={(e) => handleFilterChange('createdOnStart', e.target.value)}
                placeholder="dd/mm/yyyy"
              />
            </div>
            
            <div className="filter-item">
              <label className="filter-label">Created On (End)</label>
              <input
                type="date"
                className="filter-input"
                value={filters.createdOnEnd}
                onChange={(e) => handleFilterChange('createdOnEnd', e.target.value)}
                placeholder="dd/mm/yyyy"
              />
            </div>
            
            <div className="filter-item">
              <label className="filter-label">Enrichment</label>
              <select 
                className="filter-select"
                value={filters.enrichment}
                onChange={(e) => handleFilterChange('enrichment', e.target.value)}
              >
                <option value="">All Enrichment</option>
                <option value="none">None</option>
                <option value="partial">Partial</option>
                <option value="complete">Complete</option>
              </select>
            </div>
            
            <div className="filter-item">
              <label className="filter-label">Channels</label>
              <select 
                className="filter-select"
                value={filters.channels}
                onChange={(e) => handleFilterChange('channels', e.target.value)}
              >
                <option value="">All Channels</option>
                {allChannels.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button onClick={resetFilters} className="btn btn-primary">
              Apply Filters
            </button>
            <button onClick={resetFilters} className="btn btn-secondary">
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {selectedProducts.length > 0 && (
        <div className="selection-banner">
          <span className="selection-text">
            {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => enrichProducts(selectedProducts)}
            disabled={isEnriching}
            className="btn btn-primary"
          >
            <RefreshCw className={`w-4 h-4 ${isEnriching ? 'animate-spin' : ''}`} />
            {isEnriching ? 'AI Enriching...' : 'AI Enrich'}
          </button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(filteredProducts.map(p => p.id));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                />
              </th>
              <th>Product Name</th>
              <th>Product ID</th>
              <th>Brand</th>
              <th>Product Category</th>
              <th>Google Category</th>
              <th>Status</th>
              <th>Channels</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product.id]);
                      } else {
                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                      }
                    }}
                  />
                </td>
                <td>
                  <div className="product-cell">
                    {product.hasImages && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]}
                        alt={product.name}
                        className="product-image"
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      {product.barcode && (
                        <div className="product-barcode">#{product.barcode}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="product-id">{product.id}</td>
                <td className="brand-name">{product.brand}</td>
                <td>
                  <span className={`category-badge ${product.category ? 'filled' : 'empty'}`}>
                    {product.category || 'Not categorized'}
                  </span>
                </td>
                <td>
                  <span className={`google-category ${product.googleCategory ? 'filled' : 'empty'}`}>
                    {product.googleCategory ? (
                      product.googleCategory.length > 30 
                        ? `${product.googleCategory.substring(0, 30)}...`
                        : product.googleCategory
                    ) : 'Not categorized'}
                  </span>
                </td>
                <td>
                  <div className="status-cell">
                    {getStatusIcon(product.enrichmentStatus)}
                    <span>{getStatusText(product.enrichmentStatus)}</span>
                  </div>
                </td>
                <td>
                  <div className="channels-cell">
                    {product.channels && product.channels.length > 0 ? (
                      product.channels.map((channel, index) => (
                        <span key={index} className="channel-tag">{channel}</span>
                      ))
                    ) : (
                      <span className="no-channels">No channels</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowEditProductModal(true);
                      }}
                      className="action-btn edit-btn"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyProduct(product)}
                      className="action-btn copy-btn"
                      title="Copy Product"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="action-btn delete-btn"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-content">
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}
    </div>
  );

  // Attribute Management View
  const AttributeManagementView = () => (
    <div className="main-view">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Manage Product Attributes</h1>
          <p className="page-subtitle">{getFilteredAttributes().length} attribute(s)</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowAddAttributeModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add New Attribute
          </button>
        </div>
      </div>

      <div className="tab-container">
        <div className="tab-list">
          <button 
            className={`tab-button ${attributeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setAttributeTab('custom')}
          >
            Custom Attributes ({attributes.filter(a => a.group === 'custom').length})
          </button>
          <button 
            className={`tab-button ${attributeTab === 'system' ? 'active' : ''}`}
            onClick={() => setAttributeTab('system')}
          >
            System Attributes ({attributes.filter(a => a.group === 'system').length})
          </button>
          <button 
            className={`tab-button ${attributeTab === 'all' ? 'active' : ''}`}
            onClick={() => setAttributeTab('all')}
          >
            All Attributes ({attributes.length})
          </button>
        </div>
      </div>

      {selectedAttributes.length > 0 && (
        <div className="selection-banner">
          <span className="selection-text">
            {selectedAttributes.length} attribute{selectedAttributes.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => {
              selectedAttributes.forEach(attrName => {
                const attr = attributes.find(a => a.name === attrName);
                if (attr?.aiEnrichment) {
                  enrichSingleAttribute(attrName);
                }
              });
              setSelectedAttributes([]);
            }}
            className="btn btn-primary"
          >
            <RefreshCw className="w-4 h-4" />
            AI Enrich Selected
          </button>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input
                  type="checkbox"
                  checked={selectedAttributes.length === getFilteredAttributes().length && getFilteredAttributes().length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAttributes(getFilteredAttributes().map(a => a.name));
                    } else {
                      setSelectedAttributes([]);
                    }
                  }}
                />
              </th>
              <th>Attribute Name</th>
              <th>Type</th>
              <th>Attribute Group</th>
              <th>Attribute Dictionary</th>
              <th>Prompt Configuration</th>
              <th>AI Enrichment</th>
              <th>Variant Specific</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredAttributes().map((attribute) => (
              <tr key={attribute.name}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedAttributes.includes(attribute.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAttributes([...selectedAttributes, attribute.name]);
                      } else {
                        setSelectedAttributes(selectedAttributes.filter(name => name !== attribute.name));
                      }
                    }}
                  />
                </td>
                <td>
                  <div className="attribute-cell">
                    <div className="attribute-name">{attribute.name}</div>
                    <div className="attribute-type">
                      {attribute.type.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                      {attribute.unit && ` (${attribute.unit})`}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`group-badge ${attribute.group}`}>
                    {attribute.group === 'custom' ? 'Custom' : 'System'}
                  </span>
                </td>
                <td>
                  <div className="attribute-group-cell">
                    {attribute.attributeGroup && attribute.attributeGroup.length > 0 ? (
                      <span>{attribute.attributeGroup.join(', ')}</span>
                    ) : (
                      <span className="empty-value">-</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="dictionary-cell">
                    {attribute.attributeDictionary ? (
                      <span>{attribute.attributeDictionary.length > 50 ? `${attribute.attributeDictionary.substring(0, 50)}...` : attribute.attributeDictionary}</span>
                    ) : (
                      <span className="empty-value">-</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="prompt-cell">
                    {attribute.promptConfiguration ? (
                      <span>{attribute.promptConfiguration.length > 50 ? `${attribute.promptConfiguration.substring(0, 50)}...` : attribute.promptConfiguration}</span>
                    ) : (
                      <span className="empty-value">-</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="toggle-container">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={attribute.aiEnrichment || false}
                        disabled={attribute.group === 'system'}
                        onChange={(e) => {
                          const updatedAttribute = {
                            ...attribute,
                            aiEnrichment: e.target.checked
                          };
                          setAttributes(attributes.map(a => 
                            a.name === attribute.name ? updatedAttribute : a
                          ));
                          
                          if (e.target.checked) {
                            enrichSingleAttribute(attribute.name);
                          }
                        }}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </td>
                <td>
                  <div className="toggle-container">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={attribute.variantSpecific || false}
                        disabled={attribute.group === 'system'}
                        onChange={(e) => {
                          const updatedAttribute = {
                            ...attribute,
                            variantSpecific: e.target.checked
                          };
                          setAttributes(attributes.map(a => 
                            a.name === attribute.name ? updatedAttribute : a
                          ));
                        }}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => {
                        setEditingAttribute(attribute);
                        setShowEditAttributeModal(true);
                      }}
                      className="action-btn edit-btn"
                      title="Edit Attribute"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const copiedAttribute: AttributeDefinition = {
                          ...attribute,
                          name: `${attribute.name} (Copy)`
                        };
                        setAttributes([...attributes, copiedAttribute]);
                        alert('Attribute copied successfully!');
                      }}
                      className="action-btn copy-btn"
                      title="Copy Attribute"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {attribute.group === 'custom' && (
                      <button
                        onClick={() => handleDeleteAttribute(attribute.name)}
                        className="action-btn delete-btn"
                        title="Delete Attribute"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {getFilteredAttributes().length === 0 && (
        <div className="empty-state">
          <div className="empty-state-content">
            <h3>No attributes found</h3>
            <p>Start by adding some custom attributes for your products</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="App">
      <div className="app-container">
        <nav className="main-nav">
          <div className="nav-brand">
            <span className="brand-text">AI Product Hub</span>
          </div>
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${currentView === 'products' ? 'active' : ''}`}
              onClick={() => setCurrentView('products')}
            >
              Products
            </button>
            <button 
              className={`nav-tab ${currentView === 'attributes' ? 'active' : ''}`}
              onClick={() => setCurrentView('attributes')}
            >
              <Settings className="w-4 h-4" />
              Attributes
            </button>
          </div>
        </nav>

        <main className="main-content">
          {currentView === 'products' ? <ProductListView /> : <AttributeManagementView />}
        </main>

        <AddProductModal
          show={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          newProductForm={newProductForm}
          setNewProductForm={setNewProductForm}
          onAddProduct={handleAddProduct}
          categories={categories}
        />

        <EditProductModal
          show={showEditProductModal}
          onClose={() => setShowEditProductModal(false)}
          editingProduct={editingProduct}
          onSaveProduct={handleSaveProduct}
          categories={categories}
          allChannels={allChannels}
        />

        <AddAttributeModal
          show={showAddAttributeModal}
          onClose={() => setShowAddAttributeModal(false)}
          newAttributeForm={newAttributeForm}
          setNewAttributeForm={setNewAttributeForm}
          onAddAttribute={handleAddAttribute}
          attributeTab={attributeTab}
        />

        <EditAttributeModal
          show={showEditAttributeModal}
          onClose={() => setShowEditAttributeModal(false)}
          editingAttribute={editingAttribute}
          onSaveAttribute={handleSaveAttribute}
        />

        <BulkImportModal
          show={showBulkImportModal}
          onClose={() => setShowBulkImportModal(false)}
          onImport={handleBulkImport}
        />
      </div>
    </div>
  );
};

export default ProductEnrichmentSystem;

