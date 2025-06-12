# AI Product Hub

An intelligent product enrichment platform that automatically categorizes and enriches e-commerce products using Gemini API.

## Live Demo
https://product-enrichment-system.vercel.app/ 

## 📋 What It Does
Transform basic product information (name + brand) into fully categorized products with:
- **Product Categories** (Sports & Recreation, Electronics, Health & Supplements, etc.)
- **Google Shopping Categories** (detailed hierarchical categories)
- **Custom Attributes** (weight, dimensions, materials, etc.)

## Key Features

### Product Management
- **Smart Filters**: Hide/show filters, search by category, status, date range
- **Bulk Operations**: CSV import, multi-select enrichment
- **AI Enrichment**: One-click categorization using Gemini
- **CRUD Operations**: Add, edit, copy, delete products

### Attribute Management  
- **Custom Attributes**: Create attributes with AI enrichment
- **Home Areas**: Kitchen, Bathroom, Living Room, etc.
- **AI Prompts**: Configure custom prompts for each attribute
- **Bulk Selection**: Select multiple attributes for batch operations

## AI Examples
Input: "Football" by "Nike"
Output: Sports & Recreation | Sporting Goods > Team Sports > Football

Input: "Protein Powder" by "Optimum Nutrition"
Output: Health & Supplements | Health & Personal Care > Vitamins & Dietary Supplements

Input: "Wireless Headphones" by "AudioTech"
Output: Electronics | Electronics > Audio > Audio Components > Headphones

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **AI**: GEMINI API
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Styling**: Custom CSS

## Deployment
- **Production**: Deployed on Vercel with automatic GitHub integration
- **Environment**: Gemini API key configured in Vercel dashboard


# product-enrichment-system
