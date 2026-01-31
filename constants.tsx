
import React from 'react';
import { InventoryItem, User } from './types';

export const INITIAL_USERS: User[] = [
  { id: 1, username: 'admin', role: 'admin', createdAt: new Date().toISOString() },
  { id: 2, username: 'employee1', role: 'employee', createdAt: new Date().toISOString() }
];

const generateSalesHistory = (days: number) => {
  const history = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    history.push({
      date: d.toISOString().split('T')[0],
      quantity: Math.floor(Math.random() * 10) + 2
    });
  }
  return history;
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    name: 'Wireless Mechanical Keyboard',
    category: 'Electronics',
    current_quantity: 45,
    min_required_quantity: 20,
    price: 129.99,
    sales_history: generateSalesHistory(30),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Ergonomic Office Chair',
    category: 'Furniture',
    current_quantity: 8,
    min_required_quantity: 15,
    price: 349.50,
    sales_history: generateSalesHistory(30),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'USB-C Hub / Docking Station',
    category: 'Accessories',
    current_quantity: 120,
    min_required_quantity: 50,
    price: 89.00,
    sales_history: generateSalesHistory(30),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
