import { isLocalFallback, localDb } from '../config/db.js';
import User from './User.js';
import Poem from './Poem.js';
import Essay from './Essay.js';
import Journal from './Journal.js';
import Contact from './Contact.js';
import OpenDiary from './OpenDiary.js';

// Map of model name to collection key
const getCollectionName = (modelName) => {
  return modelName.toLowerCase() + 's';
};

// Simple ID generator for local JSON records
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const dataService = {
  // Find multiple records
  find: async (Model, filter = {}) => {
    if (!isLocalFallback) {
      return Model.find(filter).sort({ createdAt: -1 });
    }
    
    let list = localDb.readCollection(getCollectionName(Model.modelName));
    
    // Filter logic
    return list.filter(item => {
      for (let key in filter) {
        if (filter[key] !== undefined && item[key] !== filter[key]) {
          // Handle nested object/array matching
          if (Array.isArray(item[key]) && Array.isArray(filter[key])) {
            return filter[key].every(v => item[key].includes(v));
          }
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Find a single record by filter
  findOne: async (Model, filter = {}) => {
    if (!isLocalFallback) {
      return Model.findOne(filter);
    }
    
    const list = localDb.readCollection(getCollectionName(Model.modelName));
    return list.find(item => {
      for (let key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    }) || null;
  },

  // Find a record by ID
  findById: async (Model, id) => {
    if (!isLocalFallback) {
      return Model.findById(id);
    }
    
    const list = localDb.readCollection(getCollectionName(Model.modelName));
    // Match string _id or id
    return list.find(item => item._id === id || item.id === id) || null;
  },

  // Create a new record
  create: async (Model, data) => {
    if (!isLocalFallback) {
      return Model.create(data);
    }
    
    const collection = getCollectionName(Model.modelName);
    const list = localDb.readCollection(collection);
    
    const newRecord = {
      _id: generateId(),
      ...data,
      createdAt: data.createdAt || new Date().toISOString()
    };
    
    list.push(newRecord);
    localDb.writeCollection(collection, list);
    return newRecord;
  },

  // Find and update a record by ID
  findByIdAndUpdate: async (Model, id, updateData, options = { new: true }) => {
    if (!isLocalFallback) {
      return Model.findByIdAndUpdate(id, updateData, options);
    }
    
    const collection = getCollectionName(Model.modelName);
    const list = localDb.readCollection(collection);
    const index = list.findIndex(item => item._id === id || item.id === id);
    
    if (index === -1) return null;
    
    list[index] = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    localDb.writeCollection(collection, list);
    return list[index];
  },

  // Find and delete a record by ID
  findByIdAndDelete: async (Model, id) => {
    if (!isLocalFallback) {
      return Model.findByIdAndDelete(id);
    }
    
    const collection = getCollectionName(Model.modelName);
    const list = localDb.readCollection(collection);
    const index = list.findIndex(item => item._id === id || item.id === id);
    
    if (index === -1) return null;
    
    const deletedRecord = list[index];
    list.splice(index, 1);
    localDb.writeCollection(collection, list);
    return deletedRecord;
  },

  // Count documents
  countDocuments: async (Model, filter = {}) => {
    if (!isLocalFallback) {
      return Model.countDocuments(filter);
    }
    
    const list = await dataService.find(Model, filter);
    return list.length;
  }
};
